import { motion } from 'framer-motion';
import { ArrowRight, Upload, Sparkles, Database, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Database className="w-6 h-6 text-primary" />,
      title: "ChromaDB Vector Storage",
      description: "Fast, local vector database for storing document embeddings."
    },
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: "Semantic Search",
      description: "Find exactly what you need based on meaning and context."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "Gemini 2.5 AI",
      description: "State-of-the-art language model for generating accurate answers."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      title: "Source Citations",
      description: "Every answer includes citations mapping back to the exact PDF page."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full px-6 py-20 flex flex-col items-center text-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-border mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-zinc-300">Powered by Retrieval-Augmented Generation</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent"
        >
          Chat With Your PDFs <br /> Using AI
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Upload your documents, ask questions, and get accurate answers instantly. Stop reading through hundreds of pages—let AI do the heavy lifting for you.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:-translate-y-1"
          >
            Start Chatting <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/chat?upload=true')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold border border-border transition-all hover:-translate-y-1"
          >
            <Upload className="w-5 h-5" /> Upload PDF
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {features.map((f, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 text-left hover:border-primary/30 transition-colors">
              <div className="bg-zinc-900/80 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
