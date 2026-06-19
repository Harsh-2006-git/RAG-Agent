import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-4 bg-zinc-900 rounded-lg max-w-fit border border-border">
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <span className="ml-2 text-sm text-muted-foreground font-medium">AI is thinking...</span>
    </div>
  );
}
