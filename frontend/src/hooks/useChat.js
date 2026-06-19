import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatAPI } from '../services/api';

// Simple ID generator since we didn't install uuid
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const chatMutation = useMutation({
    mutationFn: (data) => chatAPI.send(data.question, data.documentIds, data.sessionId, data.model, data.retrievalMode),
  });

  const loadChat = useCallback(async (sessionId) => {
    try {
      const data = await chatAPI.get(sessionId);
      setCurrentSessionId(data.id);
      
      // Map backend messages to frontend format
      const formattedMessages = data.messages.map(msg => ({
        id: msg.id,
        role: msg.role === 'assistant' ? 'ai' : 'user',
        content: msg.content,
        sources: msg.sources || [],
        analytics: msg.analytics || null,
        timestamp: msg.created_at
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  }, []);

  const sendMessage = useCallback(async (content, selectedModel, selectedRetrievalMode = "history_aware") => {
    // 1. Add user message instantly
    const userMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // 2. Send to API
      const response = await chatMutation.mutateAsync({
        question: content,
        documentIds: selectedDocuments.length > 0 ? selectedDocuments : undefined,
        sessionId: currentSessionId,
        model: selectedModel,
        retrievalMode: selectedRetrievalMode
      });

      // Update session ID if it was newly created
      if (!currentSessionId && response.session_id) {
        setCurrentSessionId(response.session_id);
      }

      // 3. Add AI response
      const aiMessage = {
        id: generateId(), // The backend has an ID too, but we can generate one here to show instantly
        role: 'ai',
        content: response.answer,
        sources: response.sources,
        processingTime: response.processing_time_ms,
        analytics: response.analytics || null,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      return response.session_id; // Return the session ID to possibly refresh sidebar
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: generateId(),
        role: 'error',
        content: error.response?.data?.detail || "An error occurred while generating the answer.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
    }
  }, [messages, selectedDocuments, currentSessionId, chatMutation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
  }, []);

  return {
    messages,
    sendMessage,
    isTyping: chatMutation.isPending,
    selectedDocuments,
    setSelectedDocuments,
    clearChat,
    currentSessionId,
    loadChat
  };
}
