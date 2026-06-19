import { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX } from 'lucide-react';

export default function ChatInput({ onSendMessage, isTyping, ttsEnabled, onToggleTts, hasDocuments, onUploadClick }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Hide warning automatically if documents are uploaded
  useEffect(() => {
    if (hasDocuments) {
      setShowWarning(false);
    }
  }, [hasDocuments]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isTyping) return;

    if (!hasDocuments) {
      setShowWarning(true);
      return;
    }

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="p-4 bg-background/40 backdrop-blur-md border-t border-border/40 shrink-0">
      {showWarning && !hasDocuments && (
        <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-violet-950/40 border border-violet-500/20 text-violet-200 text-xs sm:text-sm shadow-[0_0_15px_rgba(124,58,237,0.05)] animate-pulse">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
            <span className="font-medium text-zinc-300">
              Please upload a document to begin asking questions.
            </span>
          </div>
          <button
            type="button"
            onClick={onUploadClick}
            className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 transition-colors cursor-pointer text-xs shrink-0"
          >
            Upload PDF
          </button>
        </div>
      )}

      <div className={`max-w-4xl mx-auto flex items-center gap-2 bg-zinc-900/60 backdrop-blur-sm border rounded-2xl pl-4 pr-2.5 py-2.5 shadow-md transition-all
        ${isFocused ? 'border-primary/60 ring-2 ring-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]' : 'border-zinc-800'}
      `}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (showWarning) setShowWarning(false); // Clear warning on typing
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none overflow-hidden max-h-[160px] py-1 leading-relaxed align-middle"
          rows={1}
          disabled={isTyping}
        />
        
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Global TTS Toggle */}
          <button
            type="button"
            onClick={onToggleTts}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer ${
              ttsEnabled
                ? 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700 shadow-sm'
                : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
            }`}
            title={ttsEnabled ? 'Disable Text-to-Speech (Auto-Speak)' : 'Enable Text-to-Speech (Auto-Speak)'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Send / Stop Buttons */}
          {isTyping ? (
            <button className="p-2 bg-zinc-800 text-zinc-400 rounded-xl cursor-not-allowed flex items-center justify-center" disabled>
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center mt-2 hidden md:block">
        <p className="text-[10px] text-muted-foreground">
          AI can make mistakes. Consider verifying important information. Use Shift + Enter for new line.
        </p>
      </div>
    </div>
  );
}
