import os
from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

class PDFLoader:
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def load_document(self, filename: str) -> List[Document]:
        """Load a single PDF document and extract pages."""
        file_path = os.path.join(self.upload_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        # Add filename to metadata
        display_filename = os.path.basename(filename)
        for doc in documents:
            doc.metadata['filename'] = display_filename
            doc.metadata['document_id'] = filename
            
        return documents

    def load_documents(self, filenames: List[str]) -> List[Document]:
        """Load multiple PDF documents."""
        all_documents = []
        for filename in filenames:
            docs = self.load_document(filename)
            all_documents.extend(docs)
        return all_documents

    def get_document_info(self, filename: str) -> Dict[str, Any]:
        """Get basic information about a document without full text extraction."""
        file_path = os.path.join(self.upload_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        size = os.path.getsize(file_path)
        
        # Quick page count
        loader = PyPDFLoader(file_path)
        pages = len(loader.load())
        
        return {
            "id": filename,
            "filename": filename,
            "size_bytes": size,
            "pages": pages
        }
