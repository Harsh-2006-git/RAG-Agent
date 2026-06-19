import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import UploadModal from '../components/UploadModal';
import SettingsModal from '../components/SettingsModal';
import { useDocuments } from '../hooks/useDocuments';
import { useChat } from '../hooks/useChat';
import { useChatSessions } from '../hooks/useChatSessions';
import { speakText } from '../utils/speech';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();

  const { documents, isDeleting, deleteDoc } = useDocuments();
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
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
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('docuchat_tts_enabled') === 'true';
  });

  const handleToggleTts = () => {
    setTtsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('docuchat_tts_enabled', String(next));
      if (!next) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'ai' && lastMessage.isNew && ttsEnabled) {
      speakText(lastMessage.content, () => {
        lastMessage.isNew = false;
      });
    }
  }, [messages, ttsEnabled]);

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
    <div className="fixed inset-0 flex bg-background overflow-hidden overscroll-none">
      
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
          onClose={() => setSidebarOpen(false)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 w-full relative overflow-hidden bg-background overscroll-none">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-primary/5 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none z-0" />
        
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
          ttsEnabled={ttsEnabled}
          onToggleTts={handleToggleTts}
          hasDocuments={documents.length > 0}
          onUploadClick={() => setUploadModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedRetrievalMode={selectedRetrievalMode}
        setSelectedRetrievalMode={setSelectedRetrievalMode}
        ttsEnabled={ttsEnabled}
        onToggleTts={handleToggleTts}
      />
    </div>
  );
}
