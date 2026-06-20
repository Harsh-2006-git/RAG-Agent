# # import unittest
# # from unittest.mock import MagicMock, patch
# # from langchain_core.documents import Document
# # from app.rag.splitter import TextChunker
# # from app.db.models import ChatSession, ChatMessage
# # from sqlalchemy import create_engine
# # from sqlalchemy.orm import sessionmaker
# # from app.db.database import Base
# # from fastapi.testclient import TestClient
# # from app.main import app

# # class TestTextChunker(unittest.TestCase):
# #     def setUp(self):
# #         # Configure a small chunk size to guarantee text splitting
# #         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

# #     def test_split_text(self):
# #         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
# #         chunks = self.chunker.split_text(text)
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertTrue(len(chunk) <= 100)

# #     def test_split_documents(self):import unittest
# # from unittest.mock import MagicMock, patch
# # from langchain_core.documents import Document
# # from app.rag.splitter import TextChunker
# # from app.db.models import ChatSession, ChatMessage
# # from sqlalchemy import create_engine
# # from sqlalchemy.orm import sessionmaker
# # from app.db.database import Base
# # from fastapi.testclient import TestClient
# # from app.main import app

# # class TestTextChunker(unittest.TestCase):
# #     def setUp(self):
# #         # Configure a small chunk size to guarantee text splitting
# #         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

# #     def test_split_text(self):
# #         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
# #         chunks = self.chunker.split_text(text)
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertTrue(len(chunk) <= 100)

# #     def test_split_documents(self):
# #         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
# #         chunks = self.chunker.split_documents([doc])
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
# #             self.assertIn("chunk_id", chunk.metadata)

# # class TestDatabaseModels(unittest.TestCase):
# #     def setUp(self):
# #         # Configure an in-memory SQLite database for safe, decoupled testing
# #         self.engine = create_engine("sqlite:///:memory:")
# #         self.SessionLocal = sessionmaker(bind=self.engine)
# #         Base.metadata.create_all(bind=self.engine)
# #         self.db = self.SessionLocal()

# #     def tearDown(self):
# #         self.db.close()
# #         Base.metadata.drop_all(bind=self.engine)

# #     def test_create_chat_session(self):
# #         session = ChatSession(title="Test Chat", owner_id="user_123")
# #         self.db.add(session)
# #         self.db.commit()
# #         self.db.refresh(session)
        
# #         self.assertIsNotNone(session.id)
# #         self.assertEqual(session.title, "Test Chat")
# #         self.assertEqual(session.owner_id, "user_123")

# #     def test_session_message_relationship(self):
# #         session = ChatSession(title="RAG Discussion", owner_id="user_456")
# #         self.db.add(session)
# #         self.db.commit()
        
# #         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
# #         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
# #         self.db.add_all([user_message, ai_message])
# #         self.db.commit()
        
# #         self.db.refresh(session)
# #         self.assertEqual(len(session.messages), 2)
# #         self.assertEqual(session.messages[0].role, "user")
# #         self.assertEqual(session.messages[1].role, "assistant")

# # class TestAPIEndpoints(unittest.TestCase):
# #     def setUp(self):
# #         self.client = TestClient(app)

# #     def test_health_check(self):
# #         response = self.client.get("/api/v1/health")
# #         self.assertEqual(response.status_code, 200)
# #         data = response.json()
# #         self.assertEqual(data["status"], "healthy")

# # if __name__ == "__main__":
# #     unittest.main()
# # import unittest
# # from unittest.mock import MagicMock, patch
# # from langchain_core.documents import Document
# # from app.rag.splitter import TextChunker
# # from app.db.models import ChatSession, ChatMessage
# # from sqlalchemy import create_engine
# # from sqlalchemy.orm import sessionmaker
# # from app.db.database import Base
# # from fastapi.testclient import TestClient
# # from app.main import app

# # class TestTextChunker(unittest.TestCase):
# #     def setUp(self):
# #         # Configure a small chunk size to guarantee text splitting
# #         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

# #     def test_split_text(self):
# #         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
# #         chunks = self.chunker.split_text(text)
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertTrue(len(chunk) <= 100)

# #     def test_split_documents(self):
# #         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
# #         chunks = self.chunker.split_documents([doc])
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
# #             self.assertIn("chunk_id", chunk.metadata)

# # class TestDatabaseModels(unittest.TestCase):
# #     def setUp(self):
# #         # Configure an in-memory SQLite database for safe, decoupled testing
# #         self.engine = create_engine("sqlite:///:memory:")
# #         self.SessionLocal = sessionmaker(bind=self.engine)
# #         Base.metadata.create_all(bind=self.engine)
# #         self.db = self.SessionLocal()

# #     def tearDown(self):
# #         self.db.close()
# #         Base.metadata.drop_all(bind=self.engine)

# #     def test_create_chat_session(self):
# #         session = ChatSession(title="Test Chat", owner_id="user_123")
# #         self.db.add(session)
# #         self.db.commit()
# #         self.db.refresh(session)
        
# #         self.assertIsNotNone(session.id)
# #         self.assertEqual(session.title, "Test Chat")
# #         self.assertEqual(session.owner_id, "user_123")

# #     def test_session_message_relationship(self):
# #         session = ChatSession(title="RAG Discussion", owner_id="user_456")
# #         self.db.add(session)
# #         self.db.commit()
        
# #         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
# #         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
# #         self.db.add_all([user_message, ai_message])
# #         self.db.commit()
        
# #         self.db.refresh(session)
# #         self.assertEqual(len(session.messages), 2)
# #         self.assertEqual(session.messages[0].role, "user")
# #         self.assertEqual(session.messages[1].role, "assistant")

# # class TestAPIEndpoints(unittest.TestCase):
# #     def setUp(self):
# #         self.client = TestClient(app)

# #     def test_health_check(self):
# #         response = self.client.get("/api/v1/health")
# #         self.assertEqual(response.status_code, 200)
# #         data = response.json()
# #         self.assertEqual(data["status"], "healthy")

# # if __name__ == "__main__":
# #     unittest.main()

# #         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
# #         chunks = self.chunker.split_documents([doc])
# #         self.assertTrue(len(chunks) > 0)
# #         for chunk in chunks:
# #             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
# #             self.assertIn("chunk_id", chunk.metadata)

# # class TestDatabaseModels(unittest.TestCase):
# #     def setUp(self):
# #         # Configure an in-memory SQLite database for safe, decoupled testing
# #         self.engine = create_engine("sqlite:///:memory:")
# #         self.SessionLocal = sessionmaker(bind=self.engine)
# #         Base.metadata.create_all(bind=self.engine)
# #         self.db = self.SessionLocal()

# #     def tearDown(self):
# #         self.db.close()
# #         Base.metadata.drop_all(bind=self.engine)

# #     def test_create_chat_session(self):
# #         session = ChatSession(title="Test Chat", owner_id="user_123")
# #         self.db.add(session)
# #         self.db.commit()
# #         self.db.refresh(session)
        
# #         self.assertIsNotNone(session.id)
# #         self.assertEqual(session.title, "Test Chat")
# #         self.assertEqual(session.owner_id, "user_123")

# #     def test_session_message_relationship(self):
# #         session = ChatSession(title="RAG Discussion", owner_id="user_456")
# #         self.db.add(session)
# #         self.db.commit()
        
# #         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
# #         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
# #         self.db.add_all([user_message, ai_message])
# #         self.db.commit()
        
# #         self.db.refresh(session)
# #         self.assertEqual(len(session.messages), 2)
# #         self.assertEqual(session.messages[0].role, "user")
# #         self.assertEqual(session.messages[1].role, "assistant")

# # class TestAPIEndpoints(unittest.TestCase):
# #     def setUp(self):
# #         self.client = TestClient(app)

# #     def test_health_check(self):
# #         response = self.client.get("/api/v1/health")
# #         self.assertEqual(response.status_code, 200)
# #         data = response.json()
# #         self.assertEqual(data["status"], "healthy")

# # if __name__ == "__main__":
# #     unittest.main()
# import unittest
# from unittest.mock import MagicMock, patch
# from langchain_core.documents import Document
# from app.rag.splitter import TextChunker
# from app.db.models import ChatSession, ChatMessage
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from app.db.database import Base
# from fastapi.testclient import TestClient
# from app.main import app

# class TestTextChunker(unittest.TestCase):
#     def setUp(self):
#         # Configure a small chunk size to guarantee text splitting
#         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

#     def test_split_text(self):
#         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
#         chunks = self.chunker.split_text(text)
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertTrue(len(chunk) <= 100)

#     def test_split_documents(self):
#         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
#         chunks = self.chunker.split_documents([doc])
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
#             self.assertIn("chunk_id", chunk.metadata)

# class TestDatabaseModels(unittest.TestCase):
#     def setUp(self):
#         # Configure an in-memory SQLite database for safe, decoupled testing
#         self.engine = create_engine("sqlite:///:memory:")
#         self.SessionLocal = sessionmaker(bind=self.engine)
#         Base.metadata.create_all(bind=self.engine)
#         self.db = self.SessionLocal()

#     def tearDown(self):
#         self.db.close()
#         Base.metadata.drop_all(bind=self.engine)

#     def test_create_chat_session(self):
#         session = ChatSession(title="Test Chat", owner_id="user_123")
#         self.db.add(session)
#         self.db.commit()
#         self.db.refresh(session)
        
#         self.assertIsNotNone(session.id)
#         self.assertEqual(session.title, "Test Chat")
#         self.assertEqual(session.owner_id, "user_123")

#     def test_session_message_relationship(self):
#         session = ChatSession(title="RAG Discussion", owner_id="user_456")
#         self.db.add(session)
#         self.db.commit()
        
#         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
#         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
#         self.db.add_all([user_message, ai_message])
#         self.db.commit()
        
#         self.db.refresh(session)
#         self.assertEqual(len(session.messages), 2)
#         self.assertEqual(session.messages[0].role, "user")
#         self.assertEqual(session.messages[1].role, "assistant")

# class TestAPIEndpoints(unittest.TestCase):
#     def setUp(self):
#         self.client = TestClient(app)

#     def test_health_check(self):
#         response = self.client.get("/api/v1/health")
#         self.assertEqual(response.status_code, 200)
#         data = response.json()
#         self.assertEqual(data["status"], "healthy")

# if __name__ == "__main__":
#     unittest.main()
# import unittest
# from unittest.mock import MagicMock, patch
# from langchain_core.documents import Document
# from app.rag.splitter import TextChunker
# from app.db.models import ChatSession, ChatMessage
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from app.db.database import Base
# from fastapi.testclient import TestClient
# from app.main import app

# class TestTextChunker(unittest.TestCase):
#     def setUp(self):
#         # Configure a small chunk size to guarantee text splitting
#         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

#     def test_split_text(self):
#         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
#         chunks = self.chunker.split_text(text)
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertTrue(len(chunk) <= 100)

#     def test_split_documents(self):
#         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
#         chunks = self.chunker.split_documents([doc])
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
#             self.assertIn("chunk_id", chunk.metadata)

# class TestDatabaseModels(unittest.TestCase):
#     def setUp(self):
#         # Configure an in-memory SQLite database for safe, decoupled testing
#         self.engine = create_engine("sqlite:///:memory:")
#         self.SessionLocal = sessionmaker(bind=self.engine)
#         Base.metadata.create_all(bind=self.engine)
#         self.db = self.SessionLocal()

#     def tearDown(self):
#         self.db.close()
#         Base.metadata.drop_all(bind=self.engine)

#     def test_create_chat_session(self):
#         session = ChatSession(title="Test Chat", owner_id="user_123")
#         self.db.add(session)
#         self.db.commit()
#         self.db.refresh(session)
        
#         self.assertIsNotNone(session.id)
#         self.assertEqual(session.title, "Test Chat")
#         self.assertEqual(session.owner_id, "user_123")

#     def test_session_message_relationship(self):
#         session = ChatSession(title="RAG Discussion", owner_id="user_456")
#         self.db.add(session)
#         self.db.commit()
        
#         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
#         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
#         self.db.add_all([user_message, ai_message])
#         self.db.commit()
        
#         self.db.refresh(session)
#         self.assertEqual(len(session.messages), 2)
#         self.assertEqual(session.messages[0].role, "user")
#         self.assertEqual(session.messages[1].role, "assistant")

# class TestAPIEndpoints(unittest.TestCase):
#     def setUp(self):
#         self.client = TestClient(app)

#     def test_health_check(self):
#         response = self.client.get("/api/v1/health")
#         self.assertEqual(response.status_code, 200)
#         data = response.json()
#         self.assertEqual(data["status"], "healthy")

# if __name__ == "__main__":
#     unittest.main()
# import unittest
# from unittest.mock import MagicMock, patch
# from langchain_core.documents import Document
# from app.rag.splitter import TextChunker
# from app.db.models import ChatSession, ChatMessage
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from app.db.database import Base
# from fastapi.testclient import TestClient
# from app.main import app

# class TestTextChunker(unittest.TestCase):
#     def setUp(self):
#         # Configure a small chunk size to guarantee text splitting
#         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

#     def test_split_text(self):
#         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
#         chunks = self.chunker.split_text(text)
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertTrue(len(chunk) <= 100)

#     def test_split_documents(self):
#         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
#         chunks = self.chunker.split_documents([doc])
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
#             self.assertIn("chunk_id", chunk.metadata)

# class TestDatabaseModels(unittest.TestCase):
#     def setUp(self):
#         # Configure an in-memory SQLite database for safe, decoupled testing
#         self.engine = create_engine("sqlite:///:memory:")
#         self.SessionLocal = sessionmaker(bind=self.engine)
#         Base.metadata.create_all(bind=self.engine)
#         self.db = self.SessionLocal()

#     def tearDown(self):
#         self.db.close()
#         Base.metadata.drop_all(bind=self.engine)

#     def test_create_chat_session(self):
#         session = ChatSession(title="Test Chat", owner_id="user_123")
#         self.db.add(session)
#         self.db.commit()
#         self.db.refresh(session)
        
#         self.assertIsNotNone(session.id)
#         self.assertEqual(session.title, "Test Chat")
#         self.assertEqual(session.owner_id, "user_123")

#     def test_session_message_relationship(self):
#         session = ChatSession(title="RAG Discussion", owner_id="user_456")
#         self.db.add(session)
#         self.db.commit()
        
#         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
#         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
#         self.db.add_all([user_message, ai_message])
#         self.db.commit()
        
#         self.db.refresh(session)
#         self.assertEqual(len(session.messages), 2)
#         self.assertEqual(session.messages[0].role, "user")
#         self.assertEqual(session.messages[1].role, "assistant")

# class TestAPIEndpoints(unittest.TestCase):
#     def setUp(self):
#         self.client = TestClient(app)

#     def test_health_check(self):
#         response = self.client.get("/api/v1/health")
#         self.assertEqual(response.status_code, 200)
#         data = response.json()
#         self.assertEqual(data["status"], "healthy")

# if __name__ == "__main__":
#     unittest.main()
# import unittest
# from unittest.mock import MagicMock, patch
# from langchain_core.documents import Document
# from app.rag.splitter import TextChunker
# from app.db.models import ChatSession, ChatMessage
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from app.db.database import Base
# from fastapi.testclient import TestClient
# from app.main import app

# class TestTextChunker(unittest.TestCase):
#     def setUp(self):
#         # Configure a small chunk size to guarantee text splitting
#         self.chunker = TextChunker(chunk_size=100, chunk_overlap=10)

#     def test_split_text(self):
#         text = "This is a long piece of text that we want to split into smaller chunks for the RAG agent to retrieve."
#         chunks = self.chunker.split_text(text)
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertTrue(len(chunk) <= 100)

#     def test_split_documents(self):
#         doc = Document(page_content="This is the page content of a test document that should exceed one hundred characters so that the chunker splits it.", metadata={"document_id": "test_doc_1"})
#         chunks = self.chunker.split_documents([doc])
#         self.assertTrue(len(chunks) > 0)
#         for chunk in chunks:
#             self.assertEqual(chunk.metadata["document_id"], "test_doc_1")
#             self.assertIn("chunk_id", chunk.metadata)

# class TestDatabaseModels(unittest.TestCase):
#     def setUp(self):
#         # Configure an in-memory SQLite database for safe, decoupled testing
#         self.engine = create_engine("sqlite:///:memory:")
#         self.SessionLocal = sessionmaker(bind=self.engine)
#         Base.metadata.create_all(bind=self.engine)
#         self.db = self.SessionLocal()

#     def tearDown(self):
#         self.db.close()
#         Base.metadata.drop_all(bind=self.engine)

#     def test_create_chat_session(self):
#         session = ChatSession(title="Test Chat", owner_id="user_123")
#         self.db.add(session)
#         self.db.commit()
#         self.db.refresh(session)
        
#         self.assertIsNotNone(session.id)
#         self.assertEqual(session.title, "Test Chat")
#         self.assertEqual(session.owner_id, "user_123")

#     def test_session_message_relationship(self):
#         session = ChatSession(title="RAG Discussion", owner_id="user_456")
#         self.db.add(session)
#         self.db.commit()
        
#         user_message = ChatMessage(session_id=session.id, role="user", content="Hello RAG assistant")
#         ai_message = ChatMessage(session_id=session.id, role="assistant", content="Hello, how can I help you?")
#         self.db.add_all([user_message, ai_message])
#         self.db.commit()
        
#         self.db.refresh(session)
#         self.assertEqual(len(session.messages), 2)
#         self.assertEqual(session.messages[0].role, "user")
#         self.assertEqual(session.messages[1].role, "assistant")

# class TestAPIEndpoints(unittest.TestCase):
#     def setUp(self):
#         self.client = TestClient(app)

#     def test_health_check(self):
#         response = self.client.get("/api/v1/health")
#         self.assertEqual(response.status_code, 200)
#         data = response.json()
#         self.assertEqual(data["status"], "healthy")

# if __name__ == "__main__":
#     unittest.main()
