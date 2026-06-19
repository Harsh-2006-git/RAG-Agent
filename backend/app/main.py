from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api.routes import router, init_services
from app.db.database import engine
from app.db import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

with engine.begin() as connection:
    columns = connection.exec_driver_sql("PRAGMA table_info(chat_sessions)").fetchall()
    column_names = {column[1] for column in columns}
    if "owner_id" not in column_names:
        connection.exec_driver_sql(
            "ALTER TABLE chat_sessions ADD COLUMN owner_id VARCHAR DEFAULT 'default'"
        )
        
    msg_columns = connection.exec_driver_sql("PRAGMA table_info(chat_messages)").fetchall()
    msg_column_names = {column[1] for column in msg_columns}
    if "analytics" not in msg_column_names:
        connection.exec_driver_sql(
            "ALTER TABLE chat_messages ADD COLUMN analytics JSON DEFAULT NULL"
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize RAG services (Loader, VectorStore, etc)
    print("Initializing RAG components...")
    init_services()
    yield
    # Shutdown
    print("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="AI-Powered PDF RAG System API",
    description="Backend for chatting with your PDFs using Google Gemini and ChromaDB",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
