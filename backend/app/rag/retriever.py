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
        Uses a hybrid search combining vector similarity search and keyword matching.
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
                
        # 1. Perform standard vector similarity search
        vector_results = self.vector_store.similarity_search(
            query=query,
            top_k=top_k * 2, # Fetch slightly more to merge with keyword results
            filter_dict=filter_dict
        )
        
        # 2. Extract keywords from query
        import re
        # Find alphanumeric words longer than 2 chars
        words = re.findall(r'\b[A-Za-z0-9_]{3,}\b', query)
        stopwords = {
            "tell", "about", "show", "many", "there", "what", "where", "whom", 
            "this", "that", "them", "then", "their", "they", "from", "with", 
            "have", "here", "know", "find", "give", "does", "mean", "name", 
            "info", "information", "some", "more", "very", "much", "please"
        }
        keywords = [w.lower() for w in words if w.lower() not in stopwords]
        
        # 3. Perform keyword matching
        merged_results = {}
        
        # Add vector results first
        for res in vector_results:
            merged_results[res["id"]] = res
            
        # If we have keywords, fetch all chunks matching the metadata filter and check matches
        if keywords:
            try:
                # Retrieve all docs in collection for metadata filter
                # This is fast since collections are scoped per-owner upload (usually 50-200 chunks)
                all_records = self.vector_store.collection.get(
                    where=filter_dict,
                    include=["documents", "metadatas"]
                )
                
                docs = all_records.get("documents", [])
                metadatas = all_records.get("metadatas", [])
                ids = all_records.get("ids", [])
                
                for doc, meta, cid in zip(docs, metadatas, ids):
                    # Count keyword occurrences
                    match_count = sum(1 for kw in keywords if kw in doc.lower())
                    if match_count > 0:
                        # Keyword score: start at 0.5 (medium relevance) and boost by 0.12 per match
                        # Cosine distance ranges from 0 (perfect match) to 1 (different).
                        kw_score = 0.5 - (match_count * 0.12)
                        kw_score = max(0.01, kw_score) # Don't go below 0.01
                        
                        if cid in merged_results:
                            # Boost vector score if it's already there
                            merged_results[cid]["score"] = min(merged_results[cid]["score"], kw_score)
                        else:
                            # Add new keyword result
                            merged_results[cid] = {
                                "id": cid,
                                "content": doc,
                                "metadata": meta,
                                "score": kw_score
                            }
            except Exception as e:
                print(f"Error executing keyword search fallback: {e}")
                
        # 4. Sort by score ascending (lowest distance/score first)
        sorted_results = sorted(merged_results.values(), key=lambda x: x["score"])
        final_results = sorted_results[:top_k]
        
        # Format results as SourceChunk objects
        sources = []
        for result in final_results:
            metadata = result.get('metadata', {})
            
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
