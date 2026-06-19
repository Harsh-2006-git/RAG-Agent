import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot, BarChart3, ChevronDown, ChevronUp, Cpu, Layers, Compass, Brain, Code2, Search } from 'lucide-react';
import { useState } from 'react';
import { formatRelativeTime } from '../utils/helpers';
import SourceCard from './SourceCard';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const [copied, setCopied] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-6 flex w-full ${isUser ? 'bg-transparent' : 'bg-zinc-900/30'}`}>
      <div className="max-w-4xl mx-auto flex w-full px-4 gap-6">
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <User className="w-5 h-5 text-primary" />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded flex items-center justify-center border ${isError ? 'bg-destructive/20 border-destructive/30' : 'bg-secondary/20 border-secondary/30'}`}>
              <Bot className={`w-5 h-5 ${isError ? 'text-destructive' : 'text-secondary'}`} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-zinc-200">
              {isUser ? 'You' : isError ? 'Error' : 'AI Assistant'}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(message.timestamp)}
              </span>
              {!isUser && !isError && (
                <button 
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-zinc-200 transition-colors"
                  title="Copy message"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <div className={`prose prose-invert max-w-none ${isError ? 'text-destructive-foreground' : 'text-zinc-300'}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {message.sources && message.sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-zinc-400 mb-3">Sources</p>
              <div className="flex gap-2 overflow-x-auto pb-2 items-start scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {message.sources.map((source, idx) => (
                  <SourceCard key={`${source.id}-${idx}`} source={source} index={idx} />
                ))}
              </div>
            </div>
          )}
          
          {message.processingTime && (
            <div className="mt-2 text-xs text-muted-foreground">
              Generated in {(message.processingTime / 1000).toFixed(2)}s
            </div>
          )}

          {message.analytics && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-wider bg-zinc-800/40 hover:bg-zinc-800/80 px-3 py-1.5 rounded border border-border/50 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
                {showAnalytics ? 'Hide RAG Analytics' : 'Show RAG Analytics'}
                {showAnalytics ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </button>

              {showAnalytics && (
                <div className="mt-4 p-4 rounded-lg bg-zinc-950/60 border border-border/50 space-y-4 animate-in fade-in duration-200">
                  {/* Grid of Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Model */}
                    <div className="p-3 rounded bg-zinc-900/50 border border-border/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                        <span>Model</span>
                        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <span className="text-sm font-medium text-zinc-300 mt-1 truncate" title={message.analytics.model}>
                        {message.analytics.model}
                      </span>
                    </div>

                    {/* Retrieval Strategy */}
                    <div className="p-3 rounded bg-zinc-900/50 border border-border/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                        <span>Strategy</span>
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-zinc-300 mt-1 capitalize">
                        {message.analytics.retrieval_mode?.replace('_', ' ') || 'Simple'}
                      </span>
                    </div>

                    {/* Avg Similarity / Distance */}
                    <div className="p-3 rounded bg-zinc-900/50 border border-border/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                        <span>Similarity</span>
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="mt-1 flex flex-col">
                        <span className="text-sm font-semibold text-emerald-400">
                          {(message.analytics.avg_similarity * 100).toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-zinc-500 italic mt-0.5">
                          {message.analytics.distance_metric} distance
                        </span>
                      </div>
                    </div>

                    {/* Precision & Accuracy */}
                    <div className="p-3 rounded bg-zinc-900/50 border border-border/30 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                        <span>Precision / Acc</span>
                        <Brain className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500">Precision</span>
                          <span className="text-xs font-semibold text-zinc-300">
                            {(message.analytics.precision * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-6 w-[1px] bg-border/40" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500">Accuracy</span>
                          <span className="text-xs font-semibold text-zinc-300">
                            {(message.analytics.accuracy * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Executed Queries */}
                  {message.analytics.retrieved_queries && message.analytics.retrieved_queries.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-zinc-400" /> DB Search Queries
                      </h4>
                      <div className="flex flex-col gap-1">
                        {message.analytics.retrieved_queries.map((query, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-mono bg-zinc-900/80 px-2.5 py-1.5 rounded border border-border/20 text-zinc-300 flex items-start gap-2"
                          >
                            <span className="text-zinc-500 shrink-0 select-none">Q{idx + 1}:</span>
                            <span className="break-all">{query}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sanitized System Prompt Template */}
                  {message.analytics.prompt_template && (
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-zinc-400" /> System Prompt Template
                      </h4>
                      <pre className="text-xs font-mono bg-zinc-950 p-3 rounded border border-border/30 text-zinc-400 max-h-48 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                        {message.analytics.prompt_template}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
