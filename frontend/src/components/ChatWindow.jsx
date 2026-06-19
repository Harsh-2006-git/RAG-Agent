import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

export default function ChatWindow({ messages, isTyping, onUploadClick, documents = [] }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState onUploadClick={onUploadClick} hasDocuments={documents.length > 0} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      <div className="flex flex-col pb-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="py-6 flex w-full bg-zinc-900/30">
            <div className="max-w-4xl mx-auto flex w-full px-4 gap-6">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <span className="w-5 h-5 block i-lucide-bot text-secondary" />
                </div>
              </div>
              <div className="flex-1">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
