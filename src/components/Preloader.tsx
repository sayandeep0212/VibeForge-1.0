'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = 'unset';
    }, 4000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [loading]);

  const text = "GAMEJAM 2K26";
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.4 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logos */}
            <div className="flex items-center gap-6 mb-8">
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                src="https://gameliminals.vercel.app/assets/logo.png" 
                alt="Logo 1" 
                className="w-12 h-12 object-contain" 
              />
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                src="https://gameliminals.vercel.app/assets/au_logo.jpg" 
                alt="Logo 2" 
                className="w-12 h-12 object-cover rounded-full" 
              />
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                src="https://gameliminals.vercel.app/assets/acm.jpeg" 
                alt="Logo 3" 
                className="w-12 h-12 object-cover rounded-full" 
              />
            </div>

            {/* Presenter Text */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-neutral-500 uppercase text-[10px] md:text-xs mb-6 font-medium tracking-[0.6em]"
            >
              The Ninja Collective Presents
            </motion.div>
            
            {/* Main Title with Staggered Animation */}
            <motion.div
              style={{ display: "flex", overflow: "hidden" }}
              variants={container}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-8xl font-black italic tracking-tighter"
            >
              {letters.map((letter, index) => (
                <motion.span
                  variants={child}
                  key={index}
                  className={letter === " " ? "mr-4" : "text-white inline-block"}
                  style={{
                    color: index >= 8 ? "#dc2626" : "white", // Color "2K26" red
                    textShadow: index >= 8 ? "0 0 20px rgba(220,38,38,0.5)" : "none"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Bottom Accent Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
              className="h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent mt-8 w-64 md:w-96"
            />

            {/* Progress/Loading Bar */}
            <div className="absolute -bottom-24 w-48 h-[2px] bg-neutral-900 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  repeatDelay: 0.5
                }}
                className="w-1/2 h-full bg-red-600 blur-[1px]"
              />
            </div>
          </div>

          {/* Grain/Noise Overlay for Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
