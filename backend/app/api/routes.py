import os
import shutil
import time
import re
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Header
from pydantic import BaseModel

from app.models.schemas import (
    UploadResponse, ProcessRequest, ProcessResponse, 
    ChatRequest, ChatResponse, DocumentInfo, HealthResponse,
    ChatSessionResponse, ChatMessageResponse
)
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.rag.loader import PDFLoader
from app.rag.splitter import TextChunker
from app.rag.embedding import EmbeddingModel
from app.rag.vectorstore import VectorStore
from app.rag.retriever import Retriever
from app.services.chat_service import ChatService

# Create router
router = APIRouter()

def get_owner_id(x_client_id: str = Header(default="default")) -> str:
    """Return a filesystem-safe browser/client ID."""
    owner_id = re.sub(r"[^a-zA-Z0-9_-]", "", x_client_id or "default")
    return owner_id[:80] or "default"

def safe_pdf_filename(filename: str) -> str:
    basename = os.path.basename(filename or "document.pdf")
    safe_name = re.sub(r"[^a-zA-Z0-9._ -]", "_", basename).strip()
    return safe_name or "document.pdf"

def owner_upload_dir(owner_id: str) -> str:
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    return os.path.join(upload_dir, owner_id)

# Globals for singleton-like access to RAG components
# In a real app, use a dependency injection framework or app state
_loader = None
_chunker = None
_embedding_model = None
_vector_store = None
_retriever = None
_chat_service = None

def init_services():
    """Initialize RAG components. Call this on app startup."""
    global _loader, _chunker, _embedding_model, _vector_store, _retriever, _chat_service
    
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    chroma_dir = os.getenv("CHROMA_DB_PATH", "./vectorstore")
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    
    _loader = PDFLoader(upload_dir=upload_dir)
    _chunker = TextChunker(chunk_size=800, chunk_overlap=100)
    _embedding_model = EmbeddingModel(api_key=gemini_key)
    _vector_store = VectorStore(persist_directory=chroma_dir, embedding_model=_embedding_model)
    _retriever = Retriever(vector_store=_vector_store)
    
    # Always initialize ChatService to allow local/Ollama and Groq usage without Gemini key
    _chat_service = ChatService(retriever=_retriever, api_key=gemini_key, groq_key=groq_key)

# Endpoints

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if the API is running."""
    return HealthResponse(status="healthy", message="API is running")

@router.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...), owner_id: str = Depends(get_owner_id)):
    """Upload one PDF for the current browser/client."""
    pdf_files = [file for file in files if file.filename.lower().endswith('.pdf')]
    if len(pdf_files) != 1:
        raise HTTPException(status_code=400, detail="Upload exactly one PDF file")

    upload_dir = owner_upload_dir(owner_id)
    os.makedirs(upload_dir, exist_ok=True)

    for existing_file in os.listdir(upload_dir):
        if existing_file.lower().endswith(".pdf"):
            existing_document_id = f"{owner_id}/{existing_file}"
            existing_path = os.path.join(upload_dir, existing_file)
            if os.path.exists(existing_path):
                os.remove(existing_path)
            if _vector_store:
                _vector_store.delete_document(existing_document_id)
    
    documents_info = []
    
    for file in pdf_files:
        filename = safe_pdf_filename(file.filename)
        document_id = f"{owner_id}/{filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Get basic info
        try:
            info = _loader.get_document_info(document_id)
            # Add current timestamp
            from datetime import datetime
            info['id'] = document_id
            info['filename'] = filename
            info['upload_date'] = datetime.utcnow().isoformat() + "Z"
            info['chunks'] = 0 # Will be updated after processing
            
            documents_info.append(DocumentInfo(**info))
        except Exception as e:
            print(f"Error reading PDF info for {file.filename}: {e}")
            
    if not documents_info:
        raise HTTPException(status_code=400, detail="No valid PDF files uploaded")
        
    return UploadResponse(
        message=f"Successfully uploaded {len(documents_info)} files",
        documents=documents_info
    )

@router.post("/process", response_model=ProcessResponse)
async def process_documents(request: ProcessRequest, owner_id: str = Depends(get_owner_id)):
    """Extract text, chunk, embed, and store documents in vector database."""
    if not request.document_ids:
        raise HTTPException(status_code=400, detail="No document IDs provided")

    document_ids = [doc_id for doc_id in request.document_ids if doc_id.startswith(f"{owner_id}/")]
    if len(document_ids) != len(request.document_ids):
        raise HTTPException(status_code=403, detail="Cannot process documents from another browser")
        
    try:
        # 1. Load PDFs
        documents = _loader.load_documents(document_ids)
        for document in documents:
            document.metadata["owner_id"] = owner_id
        
        # 2. Split into chunks
        chunks = _chunker.split_documents(documents)
        
        # 3. Embed and store
        num_chunks = _vector_store.add_documents(chunks)
        
        return ProcessResponse(
            message=f"Successfully processed {len(document_ids)} documents",
            total_chunks=num_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@router.get("/chats", response_model=List[ChatSessionResponse])
async def list_chats(owner_id: str = Depends(get_owner_id), db: Session = Depends(get_db)):
    """List all chat sessions."""
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.owner_id == owner_id
    ).order_by(models.ChatSession.created_at.desc()).all()
    return [ChatSessionResponse(id=s.id, title=s.title, created_at=s.created_at.isoformat() + "Z") for s in sessions]

@router.get("/chats/{session_id}", response_model=ChatSessionResponse)
async def get_chat(session_id: str, owner_id: str = Depends(get_owner_id), db: Session = Depends(get_db)):
    """Get a specific chat session with its messages."""
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.owner_id == owner_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    messages = [
        ChatMessageResponse(
            id=m.id, 
            role=m.role, 
            content=m.content, 
            sources=m.sources, 
            analytics=m.analytics,
            created_at=m.created_at.isoformat() + "Z"
        ) for m in session.messages
    ]
    return ChatSessionResponse(
        id=session.id, 
        title=session.title, 
        created_at=session.created_at.isoformat() + "Z", 
        messages=messages
    )

@router.delete("/chats/{session_id}")
async def delete_chat(session_id: str, owner_id: str = Depends(get_owner_id), db: Session = Depends(get_db)):
    """Delete a chat session."""
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.owner_id == owner_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Chat deleted"}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, owner_id: str = Depends(get_owner_id), db: Session = Depends(get_db)):
    """Ask a question based on uploaded documents using RAG."""
    if not _chat_service:
        raise HTTPException(status_code=500, detail="Chat service not initialized. Check GEMINI_API_KEY.")
        
    try:
        request.owner_id = owner_id
        if request.document_ids:
            request.document_ids = [
                doc_id for doc_id in request.document_ids
                if doc_id.startswith(f"{owner_id}/")
            ]
            if not request.document_ids:
                raise HTTPException(status_code=403, detail="Cannot chat with documents from another browser")

        session_id = request.session_id
        
        # 1. Handle Chat Session
        if session_id:
            session = db.query(models.ChatSession).filter(
                models.ChatSession.id == session_id,
                models.ChatSession.owner_id == owner_id
            ).first()
            if not session:
                raise HTTPException(status_code=404, detail="Chat session not found")
            
            # Fetch history to inject into request for context
            if not request.history:
                db_history = db.query(models.ChatMessage).filter(models.ChatMessage.session_id == session_id).order_by(models.ChatMessage.created_at.asc()).all()
                request.history = [{"role": m.role, "content": m.content} for m in db_history]
        else:
            # Create a new session
            title = request.question[:30] + "..." if len(request.question) > 30 else request.question
            session = models.ChatSession(title=title, owner_id=owner_id)
            db.add(session)
            db.commit()
            db.refresh(session)
            session_id = session.id
            
        # 2. Save User Message
        user_msg = models.ChatMessage(session_id=session_id, role="user", content=request.question)
        db.add(user_msg)
        db.commit()

        # 3. Generate Answer
        response = _chat_service.generate_answer(request)
        response.session_id = session_id
        
        # 4. Save AI Message
        sources_dicts = [{"filename": s.filename, "page": s.page, "content": s.content} for s in response.sources]
        analytics_dict = response.analytics.dict() if response.analytics else None
        ai_msg = models.ChatMessage(
            session_id=session_id, 
            role="assistant", 
            content=response.answer, 
            sources=sources_dicts,
            analytics=analytics_dict
        )
        db.add(ai_msg)
        db.commit()

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.get("/documents")
async def list_documents(owner_id: str = Depends(get_owner_id)):
    """List uploaded and processed documents for the current browser/client."""
    upload_dir = owner_upload_dir(owner_id)
    os.makedirs(upload_dir, exist_ok=True)
    
    files = [f for f in os.listdir(upload_dir) if f.endswith('.pdf')]
    processed_ids = _vector_store.list_documents(owner_id=owner_id) if _vector_store else []
    
    docs = []
    from datetime import datetime
    for f in files:
        document_id = f"{owner_id}/{f}"
        file_path = os.path.join(upload_dir, f)
        size = os.path.getsize(file_path)
        mtime = os.path.getmtime(file_path)
        
        is_processed = document_id in processed_ids
        
        docs.append({
            "id": document_id,
            "filename": f,
            "upload_date": datetime.fromtimestamp(mtime).isoformat() + "Z",
            "size_bytes": size,
            "status": "processed" if is_processed else "uploaded"
        })
        
    return {"documents": docs}

@router.delete("/document/{document_id:path}")
async def delete_document(document_id: str, owner_id: str = Depends(get_owner_id)):
    """Delete a document from filesystem and vector store for the current browser/client."""
    if not document_id.startswith(f"{owner_id}/"):
        raise HTTPException(status_code=403, detail="Cannot delete documents from another browser")

    filename = safe_pdf_filename(document_id.split("/", 1)[1])
    file_path = os.path.join(owner_upload_dir(owner_id), filename)
    
    deleted_from_fs = False
    if os.path.exists(file_path):
        os.remove(file_path)
        deleted_from_fs = True
        
    deleted_from_vs = False
    if _vector_store:
        deleted_from_vs = _vector_store.delete_document(document_id)
        
    if not deleted_from_fs and not deleted_from_vs:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {"message": f"Document {document_id} deleted successfully"}
