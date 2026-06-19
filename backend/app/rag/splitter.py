from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class TextChunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """Split a list of documents into smaller chunks."""
        chunks = self.splitter.split_documents(documents)
        
        # Enhance metadata for chunks
        for i, chunk in enumerate(chunks):
            chunk.metadata['chunk_id'] = f"{chunk.metadata.get('document_id', 'doc')}_{i}"
            
        return chunks

    def split_text(self, text: str) -> List[str]:
        """Split raw text into chunks."""
        return self.splitter.split_text(text)
