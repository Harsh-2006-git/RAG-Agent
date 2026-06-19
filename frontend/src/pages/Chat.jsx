import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import UploadModal from '../components/UploadModal';
import { useDocuments } from '../hooks/useDocuments';
import { useChat } from '../hooks/useChat';
import { useChatSessions } from '../hooks/useChatSessions';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const location = useLocation();

  const { documents, isDeleting, deleteDoc } = useDocuments();
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [selectedRetrievalMode, setSelectedRetrievalMode] = useState('history_aware');
  const { 
    messages, 
    sendMessage, 
    isTyping, 
    selectedDocuments, 
    setSelectedDocuments,
    clearChat,
    currentSessionId,
    loadChat
  } = useChat();

  const { sessions, fetchSessions, deleteSession } = useChatSessions();

  const handleSendMessage = async (content) => {
    const sessionId = await sendMessage(content, selectedModel, selectedRetrievalMode);
    if (sessionId) {
      fetchSessions(); // Refresh sidebar to show the new chat
    }
  };

  // Open upload modal if passed in query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('upload') === 'true') {
      setUploadModalOpen(true);
      // Remove query param without reloading
      window.history.replaceState({}, '', '/chat');
    }
  }, [location]);

  useEffect(() => {
    setSelectedDocuments(documents.length > 0 ? [documents[0].id] : []);
  }, [documents, setSelectedDocuments]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          documents={documents}
          isDeleting={isDeleting}
          onDelete={deleteDoc}
          onNewChat={clearChat}
          selectedDocuments={selectedDocuments}
          setSelectedDocuments={setSelectedDocuments}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={loadChat}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        <Header 
          onUploadClick={() => setUploadModalOpen(true)} 
          toggleSidebar={toggleSidebar} 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedRetrievalMode={selectedRetrievalMode}
          setSelectedRetrievalMode={setSelectedRetrievalMode}
        />
        
        <ChatWindow 
          messages={messages} 
          isTyping={isTyping}
          onUploadClick={() => setUploadModalOpen(true)}
          documents={documents}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isTyping={isTyping} 
        />
      </div>

      {/* Modals */}
      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
      />
    </div>
  );
}
