from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DocumentInfo(BaseModel):
    id: str = Field(description="Unique document ID (filename)")
    filename: str = Field(description="Original filename")
    upload_date: str = Field(description="ISO format upload timestamp")
    size_bytes: int = Field(description="File size in bytes")
    pages: int = Field(description="Number of pages in the PDF")
    chunks: int = Field(description="Number of text chunks generated")

class UploadResponse(BaseModel):
    message: str = Field(description="Status message")
    documents: List[DocumentInfo] = Field(description="Information about uploaded documents")

class ProcessRequest(BaseModel):
    document_ids: List[str] = Field(description="List of document IDs to process")

class ProcessResponse(BaseModel):
    message: str = Field(description="Status message")
    total_chunks: int = Field(description="Total number of chunks generated and stored")

class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(default=None, description="Optional session ID to continue a chat")
    question: str = Field(description="User's question")
    document_ids: Optional[List[str]] = Field(default=None, description="Optional list of document IDs to restrict search")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation history (deprecated in favor of session_id)")
    owner_id: Optional[str] = Field(default=None, description="Internal browser/client owner ID")
    model: Optional[str] = Field(default="gemini-2.5-flash", description="Model to use for generating answers")
    retrieval_mode: Optional[str] = Field(default="history_aware", description="RAG search strategy: simple, history_aware, multi_query, advanced")

class SourceChunk(BaseModel):
    id: str = Field(description="Chunk ID")
    document_id: str = Field(description="Source document ID")
    filename: str = Field(description="Source filename")
    page: int = Field(description="Page number")
    content: str = Field(description="Text content of the chunk")
    score: float = Field(description="Relevance score (lower distance is better)")

class RAGAnalytics(BaseModel):
    model: str = Field(description="LLM model used")
    retrieval_mode: str = Field(description="Retrieval strategy used")
    distance_metric: str = Field(default="cosine", description="Distance metric used in vector database")
    avg_similarity: float = Field(description="Average similarity score (1 - distance)")
    accuracy: float = Field(description="Estimated answer accuracy")
    precision: float = Field(description="Retrieval precision")
    retrieved_queries: List[str] = Field(description="Queries executed against vector database")
    prompt_template: str = Field(description="Full system prompt template sent to the model")

class ChatResponse(BaseModel):
    session_id: str = Field(default="", description="ID of the chat session")
    answer: str = Field(description="AI generated answer")
    sources: List[SourceChunk] = Field(description="List of sources used to generate the answer")
    processing_time_ms: int = Field(description="Total processing time in milliseconds")
    analytics: Optional[RAGAnalytics] = Field(default=None, description="Detailed RAG execution analytics")

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    analytics: Optional[Dict[str, Any]] = None
    created_at: str

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    messages: Optional[List[ChatMessageResponse]] = None

class HealthResponse(BaseModel):
    status: str = Field(default="healthy")
    message: str = Field(default="API is running")
