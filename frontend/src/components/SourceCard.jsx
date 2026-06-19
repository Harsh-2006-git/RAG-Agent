import { FileText, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-sm border border-border rounded-md overflow-hidden bg-background shrink-0 w-[400px] max-w-[90vw]">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="truncate text-xs font-medium text-zinc-300">
            {source.filename}
          </span>
          <span className="text-xs text-muted-foreground shrink-0 px-1.5 py-0.5 bg-zinc-800 rounded">
            Pg {source.page || 1}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      
      {expanded && (
        <div className="p-3 border-t border-border bg-zinc-950/50">
          <p className="text-xs text-zinc-400 font-mono leading-relaxed break-words">
            "{source.content}"
          </p>
          {source.score !== undefined && (
            <div className="mt-2 text-[10px] text-muted-foreground flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
              Relevance: {((1 - source.score) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
