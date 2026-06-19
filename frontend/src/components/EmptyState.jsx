import { MessagesSquare, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ onUploadClick, hasDocuments }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
          <MessagesSquare className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">How can I help you today?</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {hasDocuments
            ? 'Your document is ready. Ask me anything about it!'
            : 'Upload a PDF document from the sidebar to begin. You can ask questions, extract summaries, or find specific information.'}
        </p>
        {!hasDocuments && (
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-primary/20"
          >
            <Upload className="w-4 h-4" />
            Upload a PDF
          </button>
        )}
      </motion.div>
    </div>
  );
}
