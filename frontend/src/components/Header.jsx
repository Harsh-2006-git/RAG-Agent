import { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Home, Bot, Brain, Cpu, Zap, Search, MessageSquare, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ toggleSidebar, selectedModel, setSelectedModel, selectedRetrievalMode, setSelectedRetrievalMode }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [retrievalDropdownOpen, setRetrievalDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const retrievalDropdownRef = useRef(null);

  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', icon: <Bot className="w-4 h-4 text-violet-400" /> },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'llama3.2:latest', name: 'Llama 3.2 (Local)', icon: <Cpu className="w-4 h-4 text-blue-500" /> }
  ];

  const retrievalModes = [
    { id: 'simple', name: 'Simple Vector Search', icon: <Search className="w-4 h-4 text-zinc-400" /> },
    { id: 'history_aware', name: 'History-Aware RAG', icon: <MessageSquare className="w-4 h-4 text-indigo-400" /> },
    { id: 'multi_query', name: 'Multi-Query RRF', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'advanced', name: 'Advanced RAG Hybrid', icon: <Brain className="w-4 h-4 text-violet-400" /> }
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  const currentRetrievalMode = retrievalModes.find(m => m.id === selectedRetrievalMode) || retrievalModes[1];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (retrievalDropdownRef.current && !retrievalDropdownRef.current.contains(event.target)) {
        setRetrievalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-zinc-950/60 border-b border-border/50 flex items-center justify-between px-4 shrink-0 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 md:hidden text-muted-foreground hover:text-foreground hover:bg-zinc-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-border hover:border-zinc-700 transition-colors text-zinc-100"
            title="Select AI Model"
          >
            {currentModel.icon}
            <span className="text-sm font-medium hidden sm:inline">{currentModel.name}</span>
            <ChevronDown 
              className="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} 
            />
          </button>
          
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl border border-border bg-zinc-950 p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedModel === model.id 
                      ? 'bg-zinc-800 text-white font-medium' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  {model.icon}
                  {model.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RAG Mode Selector Dropdown */}
        <div className="relative" ref={retrievalDropdownRef}>
          <button 
            onClick={() => setRetrievalDropdownOpen(!retrievalDropdownOpen)}
            className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-border hover:border-zinc-700 transition-colors text-zinc-100"
            title="Select RAG Retrieval Strategy"
          >
            {currentRetrievalMode.icon}
            <span className="text-sm font-medium hidden sm:inline">{currentRetrievalMode.name}</span>
            <ChevronDown 
              className="w-4 h-4 text-muted-foreground transition-transform duration-200" 
              style={{ transform: retrievalDropdownOpen ? 'rotate(180deg)' : 'none' }} 
            />
          </button>
          
          {retrievalDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-zinc-950 p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              {retrievalModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedRetrievalMode(mode.id);
                    setRetrievalDropdownOpen(false);
                  }}
                  className={`flex items-start gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedRetrievalMode === mode.id 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  <div className="mt-0.5">{mode.icon}</div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-xs text-zinc-100">{mode.name}</div>
                    <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      {mode.id === 'simple' && 'Standard query semantic lookup.'}
                      {mode.id === 'history_aware' && 'Resolves references using chat history.'}
                      {mode.id === 'multi_query' && 'Generates variations + fusion ranking.'}
                      {mode.id === 'advanced' && 'Standalone rewrite + variations + RRF.'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>

      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-900 px-3 py-1.5 rounded-lg border border-border cursor-pointer font-medium"
        title="Back to Landing Page"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>
    </header>
  );
}
