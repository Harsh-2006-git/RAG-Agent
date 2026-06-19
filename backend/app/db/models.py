import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    owner_id = Column(String, default="default", index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), index=True)
    role = Column(String) # 'user' or 'assistant'
    content = Column(Text)
    sources = Column(JSON, nullable=True) # Store sources used for AI answers
    analytics = Column(JSON, nullable=True) # Store detailed RAG metrics
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")
