import { MessagesSquare, Plus, FileText, Trash2, Settings, Loader2, X, MessageSquare, Home } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ documents, isDeleting, onDelete, onNewChat, selectedDocuments, setSelectedDocuments, sessions = [], currentSessionId, onSelectSession, onDeleteSession, onClose, onSettingsClick }) {
  const navigate = useNavigate();
  
  const toggleDocument = (docId) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [docId]
    );
  };

  return (
    <div className="w-64 flex-shrink-0 bg-zinc-950/80 backdrop-blur-md border-r border-border/50 flex flex-col h-full z-30">
      {/* App Logo */}
      <div className="p-4 mb-4 flex items-center justify-between">
        <div 
          onClick={() => {
            navigate('/');
            onClose();
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="Back to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <MessagesSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent group-hover:from-zinc-50 group-hover:to-zinc-200 transition-colors">
            DocuChat AI
          </span>
        </div>
        
        {/* Close Button on Mobile */}
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 hover:bg-zinc-800/80 rounded-lg text-muted-foreground hover:text-zinc-200 transition-all cursor-pointer"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors group"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            New Chat
          </span>
          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-zinc-200 transition-colors" />
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Knowledge Base
        </div>
        
        <div className="space-y-1 mb-6">
          {documents.length === 0 ? (
            <div className="text-xs text-center p-4 text-zinc-500 border border-dashed border-border rounded-lg mt-2">
              No documents yet.<br/>Upload a PDF to begin.
            </div>
          ) : (
            documents.map((doc) => (
              <div 
                key={doc.id}
                className={`group flex flex-col rounded-lg transition-colors p-2 cursor-pointer
                  ${selectedDocuments.includes(doc.id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-zinc-900 border border-transparent'}
                `}
                onClick={() => toggleDocument(doc.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    <FileText className={`w-4 h-4 shrink-0 ${selectedDocuments.includes(doc.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm truncate text-zinc-300 font-medium">
                      {doc.filename}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-muted-foreground hover:text-destructive transition-all shrink-0 ml-1"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="pl-6 text-[10px] text-zinc-500 flex justify-between items-center mt-1">
                  <span>{formatRelativeTime(doc.upload_date)}</span>
                  <span className={`w-2 h-2 rounded-full ${doc.status === 'processed' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} title={doc.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Chats Section */}
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Chats
        </div>
        
        <div className="space-y-1 pb-4">
          {sessions.length === 0 ? (
            <div className="text-xs text-center p-4 text-zinc-600 italic">
              No chat history.
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                className={`group flex items-center justify-between rounded-lg transition-colors p-2 cursor-pointer
                  ${currentSessionId === session.id ? 'bg-zinc-800 border-zinc-700' : 'hover:bg-zinc-900 border-transparent'}
                  border
                `}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden w-full">
                  <span className="text-sm truncate text-zinc-300 font-medium">
                    {session.title}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-muted-foreground hover:text-destructive transition-all shrink-0 ml-1"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings / Footer */}
      <div className="p-4 border-t border-border mt-auto space-y-1">
        <button 
          onClick={() => {
            navigate('/');
            onClose();
          }}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors w-full p-2 hover:bg-zinc-900 rounded-lg cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
        <button 
          onClick={onSettingsClick}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors w-full p-2 hover:bg-zinc-900 rounded-lg cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
