from typing import List, Dict, Any, Optional
from app.rag.vectorstore import VectorStore
from app.models.schemas import SourceChunk

class Retriever:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    def retrieve(self, query: str, document_ids: Optional[List[str]] = None, top_k: int = 5, owner_id: Optional[str] = None) -> List[SourceChunk]:
        """
        Retrieve top_k chunks relevant to the query.
        Optionally filter by document_ids.
        """
        
        # Build filter if document_ids are provided
        filters = []
        if owner_id:
            filters.append({"owner_id": owner_id})
        if document_ids and len(document_ids) > 0:
            if len(document_ids) == 1:
                filters.append({"document_id": document_ids[0]})
            else:
                # ChromaDB supports $in operator
                filters.append({"document_id": {"$in": document_ids}})

        filter_dict = None
        if len(filters) == 1:
            filter_dict = filters[0]
        elif len(filters) > 1:
            filter_dict = {"$and": filters}
                
        # Perform similarity search
        results = self.vector_store.similarity_search(
            query=query,
            top_k=top_k,
            filter_dict=filter_dict
        )
        
        # Format results as SourceChunk objects
        sources = []
        for result in results:
            metadata = result.get('metadata', {})
            
            # Safely handle missing metadata fields
            page_num = metadata.get('page', 0)
            if isinstance(page_num, str):
                try:
                    page_num = int(page_num)
                except ValueError:
                    page_num = 0
                    
            sources.append(
                SourceChunk(
                    id=result.get('id', ''),
                    document_id=metadata.get('document_id', 'unknown'),
                    filename=metadata.get('filename', 'Unknown Document'),
                    page=page_num,
                    content=result.get('content', ''),
                    score=result.get('score', 0.0)
                )
            )
            
        return sources
