import os
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document

class VectorStore:
    def __init__(self, persist_directory: str, embedding_model):
        self.persist_directory = persist_directory
        self.embedding_model = embedding_model
        
        # Initialize ChromaDB client
        os.makedirs(self.persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection_name = "pdf_rag_collection"
        if getattr(embedding_model, "use_local", False):
            self.collection_name = "pdf_rag_collection_local"

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_documents(self, documents: List[Document]) -> int:
        """Add documents to the vector store."""
        if not documents:
            return 0
            
        texts = [doc.page_content for doc in documents]
        metadatas = [doc.metadata for doc in documents]
        ids = [doc.metadata.get('chunk_id', f"chunk_{i}") for i, doc in enumerate(documents)]
        
        # Generate embeddings
        embeddings = self.embedding_model.embed_documents(texts)
        
        # Add to ChromaDB
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=texts
        )
        
        return len(texts)

    def similarity_search(self, query: str, top_k: int = 5, filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        query_embedding = self.embedding_model.embed_query(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=filter_dict
        )
        
        formatted_results = []
        if results and results['ids'] and results['ids'][0]:
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "score": results['distances'][0][i] if 'distances' in results and results['distances'] else 0.0
                })
                
        return formatted_results

    def delete_document(self, document_id: str) -> bool:
        """Delete all chunks associated with a document_id."""
        try:
            self.collection.delete(
                where={"document_id": document_id}
            )
            return True
        except Exception as e:
            print(f"Error deleting document {document_id}: {e}")
            return False

    def delete_owner_documents(self, owner_id: str) -> bool:
        """Delete all chunks owned by a browser/client."""
        try:
            self.collection.delete(
                where={"owner_id": owner_id}
            )
            return True
        except Exception as e:
            print(f"Error deleting documents for owner {owner_id}: {e}")
            return False

    def count_chunks(self) -> int:
        """Get total number of chunks in the collection."""
        return self.collection.count()
        
    def list_documents(self, owner_id: Optional[str] = None) -> List[str]:
        """Get a list of unique document IDs in the store."""
        # Note: In a production system with millions of chunks, you might want to maintain
        # a separate SQL database for document metadata. For this simple app, we query Chroma.
        # This is a bit inefficient for ChromaDB but works for a small demo.
        try:
            kwargs = {"include": ['metadatas']}
            if owner_id:
                kwargs["where"] = {"owner_id": owner_id}
            results = self.collection.get(**kwargs)
            doc_ids = set()
            for meta in results['metadatas']:
                if 'document_id' in meta:
                    doc_ids.add(meta['document_id'])
            return list(doc_ids)
        except Exception:
            return []
