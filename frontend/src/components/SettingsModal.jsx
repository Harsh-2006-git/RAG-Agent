import React from 'react';
import { X, Sparkles, Cpu, Zap, Search, MessageSquare, Layers, Volume2, VolumeX, Bot, Brain } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModel,
  setSelectedModel,
  selectedRetrievalMode,
  setSelectedRetrievalMode,
  ttsEnabled,
  onToggleTts
}) {
  if (!isOpen) return null;

  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, balanced model for most tasks.', icon: <Bot className="w-5 h-5 text-violet-400" /> },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', desc: 'High intelligence versatile model.', icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { id: 'llama3.2:latest', name: 'Llama 3.2 (Local)', desc: 'Run locally on your device.', icon: <Cpu className="w-5 h-5 text-blue-500" /> }
  ];

  const retrievalModes = [
    { id: 'simple', name: 'Simple Vector Search', desc: 'Standard semantic document search.', icon: <Search className="w-4 h-4 text-zinc-400" /> },
    { id: 'history_aware', name: 'History-Aware RAG', desc: 'Maintains context across follow-up queries.', icon: <MessageSquare className="w-4 h-4 text-indigo-400" /> },
    { id: 'multi_query', name: 'Multi-Query RRF', desc: 'Searches multiple query variations.', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'advanced', name: 'Advanced RAG Hybrid', desc: 'Combines Standalone rewrite + RRF.', icon: <Brain className="w-4 h-4 text-violet-400" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm select-none">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={onClose} 
      />
      
      <div className="bg-zinc-900 border border-zinc-800/85 w-full max-w-[92%] sm:max-w-md rounded-xl p-4 sm:p-5 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4 shrink-0">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          
          {/* AI Model Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              AI Chat Model
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`flex items-start gap-2.5 w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedModel === model.id
                      ? 'bg-primary/10 border-primary/40 shadow-sm shadow-primary/5'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{model.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-100">{model.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{model.desc}</div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RAG Strategy Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Retrieval Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {retrievalModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedRetrievalMode(mode.id)}
                  className={`flex flex-col justify-between w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedRetrievalMode === mode.id
                      ? 'bg-indigo-600/10 border-indigo-500/40 shadow-sm shadow-indigo-500/5'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="shrink-0">{mode.icon}</div>
                    <div className="text-xs font-semibold text-zinc-100 truncate">{mode.name}</div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 leading-normal flex-1">
                    {mode.desc}
                  </div>
                  {selectedRetrievalMode === mode.id && (
                    <div className="w-1 h-1 rounded-full bg-indigo-400 self-end mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Preferences */}
          <div className="space-y-2 pt-2 border-t border-border/30">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Voice Assistant
            </label>
            <div 
              onClick={onToggleTts}
              className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-800/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded ${ttsEnabled ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                  {ttsEnabled ? <Volume2 className="w-4.5 h-4.5 animate-pulse" /> : <VolumeX className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Auto Read-Aloud</div>
                  <div className="text-[10px] text-zinc-500">Read AI answers aloud automatically</div>
                </div>
              </div>
              
              {/* Toggle switch */}
              <div className={`w-8 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${ttsEnabled ? 'bg-primary' : 'bg-zinc-700'}`}>
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${ttsEnabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/40 mt-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 active:scale-[0.99] text-white font-semibold rounded-lg shadow-lg shadow-primary/25 transition-all text-xs cursor-pointer"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
