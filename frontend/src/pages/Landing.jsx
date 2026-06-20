import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Brain, Database, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from '../components/ui/shader-background';

export default function Landing() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const isInteracting = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isDesktop && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [isDesktop]);

  const features = [
    {
      icon: <Database className="w-5 h-5 text-violet-400" />,
      title: "ChromaDB Vector Storage",
      description: "Local vector database that securely stores and indexes your document embeddings.",
      hoverClass: "hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]",
      iconBg: "bg-violet-950/35 border-violet-500/10"
    },
    {
      icon: <Search className="w-5 h-5 text-blue-400" />,
      title: "Semantic Search",
      description: "Find answers based on semantic meaning and context, rather than simple keyword matches.",
      hoverClass: "hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]",
      iconBg: "bg-blue-950/35 border-blue-500/10"
    },
    {
      icon: <Brain className="w-5 h-5 text-amber-400" />,
      title: "Multi-Model AI",
      description: "Leverage state-of-the-art LLMs like Gemini, Groq, or private local Ollama models.",
      hoverClass: "hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
      iconBg: "bg-amber-950/35 border-amber-500/10"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      title: "Source Citations",
      description: "Verify response accuracy with transparent page citations linking to the exact source PDF.",
      hoverClass: "hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-950/35 border-emerald-500/10"
    }
  ];

  const handleMouseDown = (e) => {
    const container = scrollRef.current;
    if (!container) return;
    isDown.current = true;
    container.style.cursor = 'grabbing';
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftVal.current = container.scrollLeft;
    isInteracting.current = true;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed multiplier
    container.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleTouchStart = () => {
    isInteracting.current = true;
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  useEffect(() => {
    if (isDesktop) return;

    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId;
    const scrollSpeed = 0.6; // Autoscroll speed in pixels per frame

    const step = () => {
      if (!isInteracting.current && !isDown.current) {
        container.scrollLeft += scrollSpeed;
        
        // Loop back seamlessly
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDesktop]);

  return (
    <div className="min-h-screen md:h-screen flex flex-col items-center justify-center relative overflow-hidden py-12 md:py-0">
      <ShaderBackground />
      {/* Right middle blue glow blob */}
      <div className="absolute right-[-10%] top-[30%] w-[250px] h-[250px] md:w-[450px] md:h-[450px] bg-blue-600/15 md:bg-blue-600/40 blur-[100px] md:blur-[120px] rounded-full pointer-events-none z-0" />
      {/* Left middle purple glow blob */}
      <div className="absolute left-[-10%] top-[30%] w-[250px] h-[250px] md:w-[450px] md:h-[450px] bg-violet-600/15 md:bg-violet-600/40 blur-[100px] md:blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative max-w-7xl w-full px-6 py-4 md:py-10 flex flex-col items-center text-center z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur border border-border mb-6 md:mb-8"
        >
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-zinc-300">Powered by Retrieval-Augmented Generation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-serif text-[8vw] sm:text-5xl md:text-6xl lg:text-7xl text-zinc-100 tracking-normal mb-4 md:mb-5 leading-[1.1] flex flex-col items-center px-4"
        >
          <span className="whitespace-nowrap">Chat With Your PDFs</span>
          <span className="font-serif font-normal text-violet-300 text-[6.5vw] sm:text-4xl md:text-5xl lg:text-6xl block mt-2 pb-2 leading-normal tracking-wide normal-case whitespace-nowrap">
            using AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mb-8 md:mb-10 px-2"
        >
          Upload your documents, ask questions, and get accurate answers instantly. Stop reading through hundreds of pages—let AI do the heavy lifting for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md sm:max-w-none"
        >
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:-translate-y-1"
          >
            Start Chatting <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/chat?upload=true')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3.5 text-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold border border-border transition-all hover:-translate-y-1"
          >
            <Upload className="w-4 h-4" /> Upload PDF
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 md:mt-16 lg:mt-20 w-full overflow-hidden relative py-2"
        >
          {/* Gradient fade masks at both edges */}
          {!isDesktop && (
            <>
              <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
            </>
          )}

          <div
            ref={scrollRef}
            onMouseDown={isDesktop ? undefined : handleMouseDown}
            onMouseLeave={isDesktop ? undefined : handleMouseLeave}
            onMouseUp={isDesktop ? undefined : handleMouseUp}
            onMouseMove={isDesktop ? undefined : handleMouseMove}
            onTouchStart={isDesktop ? undefined : handleTouchStart}
            onTouchEnd={isDesktop ? undefined : handleTouchEnd}
            className={`flex gap-4 md:gap-6 py-1 ${
              isDesktop 
                ? 'justify-center overflow-x-hidden cursor-default' 
                : 'overflow-x-auto scrollbar-none cursor-grab select-none'
            }`}
          >
            {(isDesktop ? features : [...features, ...features]).map((f, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-[255px] md:w-[280px] bg-card/45 backdrop-blur-md border border-border/80 rounded-xl p-5 text-left transition-all duration-300 cursor-default select-none ${f.hoverClass}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3.5 border ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm md:text-sm text-zinc-100 mb-1.5 line-clamp-1">{f.title}</h3>
                <p className="text-xs md:text-xs text-zinc-400 leading-relaxed line-clamp-2 md:line-clamp-3">{f.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
