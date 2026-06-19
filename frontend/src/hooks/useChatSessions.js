import { useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';

export function useChatSessions() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatAPI.list();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const deleteSession = async (sessionId) => {
    try {
      await chatAPI.delete(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete chat session:", error);
    }
  };

  return {
    sessions,
    isLoading,
    fetchSessions,
    deleteSession
  };
}
