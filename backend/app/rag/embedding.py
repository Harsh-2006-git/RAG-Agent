from typing import List

class EmbeddingModel:
    def __init__(self, api_key: str):
        """Initialize the embedding model, falling back to local if API key is not configured."""
        keys = [k.strip() for k in api_key.split(",") if k.strip() and k.strip() != "your_gemini_api_key_here"]
        self.use_local = len(keys) == 0
        
        if self.use_local:
            print("GEMINI_API_KEY not set. Using ChromaDB local ONNX embedding function (all-MiniLM-L6-v2).")
            from chromadb.utils import embedding_functions
            self.model = embedding_functions.DefaultEmbeddingFunction()
        else:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            self.model = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-2",
                google_api_key=keys[0]
            )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of documents."""
        if self.use_local:
            return self.model(texts)
        return self.model.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """Generate an embedding for a single query string."""
        if self.use_local:
            return self.model([text])[0]
        return self.model.embed_query(text)
