import os
import time
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.rag.retriever import Retriever
from app.models.schemas import ChatRequest, ChatResponse, SourceChunk, RAGAnalytics

class ChatService:
    def __init__(self, retriever: Retriever, api_key: str, groq_key: str = ""):
        self.retriever = retriever
        self.api_key_configured = False
        self.groq_key = groq_key
        
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                self.api_key_configured = True
            except Exception as e:
                print(f"Error configuring Gemini Generative Model: {e}")

    def generate_answer(self, request: ChatRequest) -> ChatResponse:
        start_time = time.time()
        
        # 0. Check for simple greetings to bypass retrieval and LLM call
        clean_question = request.question.strip().lower().rstrip("?.!")
        if clean_question in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]:
            return ChatResponse(
                answer="Hello! How can I help you today?",
                sources=[],
                processing_time_ms=0
            )
        
        # 1. Determine retrieval mode and execute search
        retrieval_mode = request.retrieval_mode or "history_aware"
        model_name = request.model or "gemini-2.5-flash"
        
        search_query = request.question
        retrieved_queries = []
        
        # Build history log for query rewriting if history is present
        history_log = ""
        if request.history:
            history_log = "Previous Conversation History:\n"
            for msg in request.history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                role_name = "Assistant" if role in ["assistant", "ai"] else "User"
                history_log += f"{role_name}: {content}\n"
            history_log += "\n"
            
        # STEP A: Standalone Query Rewriting (if mode is history_aware or advanced, and history is present)
        if retrieval_mode in ["history_aware", "advanced"] and request.history:
            print(f"Rewriting query to be standalone...")
            search_query = self._rewrite_query(request.question, history_log, model_name)
            print(f"Rewritten standalone query: {search_query}")
            retrieved_queries.append(search_query)
        else:
            retrieved_queries.append(request.question)
            
        # STEP B: Retrieve relevant contexts
        if retrieval_mode in ["multi_query", "advanced"]:
            # Generate 3 variations using standalone/original query
            print(f"Generating search variations for: {search_query}...")
            variations = self._generate_query_variations(search_query, model_name)
            print(f"Generated variations: {variations}")
            retrieved_queries.extend(variations)
            
            # Retrieve for all variations + search_query
            all_lists = []
            # Add original standalone query
            all_lists.append(self.retriever.retrieve(
                query=search_query,
                document_ids=request.document_ids,
                top_k=5,
                owner_id=request.owner_id
            ))
            # Add other variations
            for var in variations:
                all_lists.append(self.retriever.retrieve(
                    query=var,
                    document_ids=request.document_ids,
                    top_k=5,
                    owner_id=request.owner_id
                ))
                
            # Merge using Reciprocal Rank Fusion (RRF)
            sources = self._reciprocal_rank_fusion(all_lists)
            # Take top 5
            sources = sources[:5]
        else:
            # Simple or History-Aware retrieval
            sources = self.retriever.retrieve(
                query=search_query,
                document_ids=request.document_ids,
                top_k=5,
                owner_id=request.owner_id
            )
        
        # 2. Build context string
        context_text = ""
        for i, source in enumerate(sources):
            context_text += f"\n--- Source {i+1} ({source.filename}, Page {source.page}) ---\n"
            context_text += source.content + "\n"
            
        # 3. Construct structured messages for Chat API (Ollama / Groq)
        system_content = f"""You are a helpful, professional QA assistant. Answer the user's question using the retrieved context.
CRITICAL RULES:
1. Do NOT include preambles, meta-commentary, introductions, or transitions in your response (e.g. do NOT say "Based on the context...", "According to the files...", "Here is what I found:").
2. Focus purely on giving a complete, rich, detailed, and comprehensive answer to the user's question. Do NOT make it overly concise or leave out important facts.
3. Do NOT mention page numbers, source IDs, or document names in your text response (citations are already displayed by the UI).

Context information:
{context_text}"""

        messages = [
            {"role": "system", "content": system_content}
        ]
        
        # Add conversation history
        if request.history:
            for msg in request.history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                api_role = "assistant" if role in ["assistant", "ai"] else "user"
                messages.append({"role": api_role, "content": content})
                
        # Add current question
        messages.append({"role": "user", "content": request.question})
 
        # 4. Construct prompt for Gemini (which uses a single text generation prompt)
        history_log = ""
        if request.history:
            history_log = "Previous Conversation History:\n"
            for msg in request.history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                role_name = "Assistant" if role in ["assistant", "ai"] else "User"
                history_log += f"{role_name}: {content}\n"
            history_log += "\n"

        prompt = f"""You are a helpful, professional QA assistant. Answer the user's question using the retrieved context.

CRITICAL RULES:
1. Do NOT include preambles, meta-commentary, introductions, or transitions in your response (e.g. do NOT say "Based on the context...", "According to the files...", "Here is what I found:").
2. Focus purely on giving a complete, rich, detailed, and comprehensive answer to the user's question. Do NOT make it overly concise or leave out important facts.
3. Do NOT mention page numbers, source IDs, or document names in your text response (citations are already displayed by the UI).

Context information:
{context_text}

{history_log}Current User Question: {request.question}

Answer:"""
  
        # 5. Call API (Groq, Ollama or Gemini)
        answer = ""
        model_name = request.model or "gemini-2.5-flash"
        
        if "groq" in model_name.lower() or model_name == "llama-3.3-70b-versatile":
            # Call Groq API
            if not self.groq_key:
                answer = "Groq API key is not configured. Please set GROQ_API_KEY in the backend .env file."
            else:
                try:
                    import httpx
                    print(f"Sending chat messages to Groq model {model_name}...")
                    response = httpx.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.groq_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": messages,
                            "temperature": 0.2
                        },
                        timeout=30.0
                    )
                    response.raise_for_status()
                    answer = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                except Exception as e:
                    print(f"Groq API Error: {e}")
                    answer = f"I'm sorry, I encountered an error while trying to generate an answer with Groq: {str(e)}"
        elif "llama" in model_name.lower() or "ollama" in model_name.lower():
            # Call Ollama local API
            try:
                import httpx
                ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                print(f"Sending chat messages to Ollama model {model_name} at {ollama_url}...")
                response = httpx.post(
                    f"{ollama_url}/api/chat",
                    json={
                        "model": "llama3.2:latest",
                        "messages": messages,
                        "stream": False
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                answer = response.json().get("message", {}).get("content", "")
            except Exception as e:
                print(f"Ollama API Error: {e}")
                answer = f"I'm sorry, I encountered an error while trying to generate an answer with Ollama: {str(e)}"
        else:
            # Call Gemini API
            if not self.api_key_configured:
                answer = "Gemini API key is not configured. Please select Llama 3.2 (Local) or Groq in the model dropdown, or configure GEMINI_API_KEY in the backend .env file."
            else:
                try:
                    response = self.model.generate_content(prompt)
                    answer = response.text
                except Exception as e:
                    print(f"Gemini API Error: {e}")
                    answer = f"I'm sorry, I encountered an error while trying to generate an answer: {str(e)}"
 
        # Calculate RAG Analytics
        if not sources:
            avg_similarity = 0.0
            precision = 0.0
            accuracy = 0.0
        else:
            # Cosine distance
            avg_dist = sum(s.score for s in sources) / len(sources)
            avg_similarity = max(0.0, 1.0 - avg_dist)
            
            # Precision: percentage of sources with score < 0.6
            relevant_sources = sum(1 for s in sources if s.score < 0.6)
            precision = relevant_sources / len(sources)
            
            # Accuracy heuristic
            if "cannot find" in answer.lower() or "don't know" in answer.lower() or "not specified" in answer.lower():
                accuracy = 0.15
            else:
                accuracy = (avg_similarity * 0.7) + (precision * 0.3)
                
        # Clean prompt for display by replacing large context block with placeholder
        clean_context_placeholder = "[Retrieved document chunks content injected here]"
        display_prompt = prompt.replace(context_text, clean_context_placeholder)
        
        analytics_data = RAGAnalytics(
            model=model_name,
            retrieval_mode=retrieval_mode,
            distance_metric="cosine",
            avg_similarity=round(avg_similarity, 3),
            accuracy=round(accuracy, 3),
            precision=round(precision, 3),
            retrieved_queries=retrieved_queries,
            prompt_template=display_prompt
        )

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
 
        # 6. Return structured response
        return ChatResponse(
            answer=answer,
            sources=sources,
            processing_time_ms=processing_time,
            analytics=analytics_data
        )

    def _call_llm(self, prompt: str, model_name: str, max_tokens: Optional[int] = None) -> str:
        """Helper to invoke the correct LLM API based on model name."""
        if "groq" in model_name.lower() or model_name == "llama-3.3-70b-versatile":
            if not self.groq_key:
                raise ValueError("Groq API key is not configured.")
            import httpx
            json_payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0
            }
            if max_tokens:
                json_payload["max_tokens"] = max_tokens
            response = httpx.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json=json_payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            
        elif "llama" in model_name.lower() or "ollama" in model_name.lower():
            import httpx
            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            json_payload = {
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.0}
            }
            if max_tokens:
                json_payload["options"]["num_predict"] = max_tokens
            response = httpx.post(
                f"{ollama_url}/api/generate",
                json=json_payload,
                timeout=60.0
            )
            response.raise_for_status()
            return response.json().get("response", "")
            
        else:
            if not self.api_key_configured:
                raise ValueError("Gemini API key is not configured.")
            gen_config = {}
            if max_tokens:
                gen_config["max_output_tokens"] = max_tokens
            response = self.model.generate_content(prompt, generation_config=gen_config)
            return response.text

    def _rewrite_query(self, original_query: str, history_log: str, model_name: str) -> str:
        """Rewrite the user question to be standalone and searchable using the conversation history."""
        prompt = f"""Given the following conversation history, rewrite the new user question to be a standalone, search-optimized query.
Do NOT include any introduction, conversational filler, or explanations. Just output the rewritten search query.

{history_log}
New User Question: {original_query}

Standalone Query:"""
        
        try:
            rewritten = self._call_llm(prompt, model_name, max_tokens=100)
            return rewritten.strip().strip('"\'')
        except Exception as e:
            print(f"Error rewriting query: {e}")
            return original_query

    def _generate_query_variations(self, original_query: str, model_name: str) -> List[str]:
        """Generate 3 different search variations for the query."""
        prompt = f"""Generate exactly 3 different search query variations for the following question to help retrieve relevant documents.
Each variation should approach the question from a different angle or use different synonyms.
Output each query on a new line. Do NOT include numbers, bullets, or introduction text.

Question: {original_query}"""
        
        try:
            response_text = self._call_llm(prompt, model_name, max_tokens=150)
            lines = [line.strip().lstrip("1234567890. -*").strip('"\'') for line in response_text.split("\n")]
            variations = [line for line in lines if line]
            if not variations:
                return [original_query]
            return variations[:3]
        except Exception as e:
            print(f"Error generating variations: {e}")
            return [original_query]

    def _reciprocal_rank_fusion(self, chunk_lists: List[List[SourceChunk]], k: int = 60) -> List[SourceChunk]:
        """Combine multiple lists of retrieved chunks using Reciprocal Rank Fusion (RRF)."""
        from collections import defaultdict
        
        rrf_scores = defaultdict(float)
        all_unique_chunks = {}
        
        for chunk_list in chunk_lists:
            for position, chunk in enumerate(chunk_list, 1):
                chunk_key = chunk.content
                if chunk_key not in all_unique_chunks:
                    all_unique_chunks[chunk_key] = chunk
                rrf_scores[chunk_key] += 1.0 / (k + position)
                
        sorted_keys = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        fused_chunks = []
        for key in sorted_keys:
            chunk = all_unique_chunks[key]
            chunk.score = rrf_scores[key]
            fused_chunks.append(chunk)
            
        return fused_chunks
