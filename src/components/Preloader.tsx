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

  const text = "VIBEFORGE 1.0";
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/5 rounded-full blur-[150px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logos */}
            <div className="flex items-center gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/logo.png" alt="Logo 1" className="w-full h-full object-contain" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/au_logo.jpg" alt="Logo 2" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/cycoders.png" alt="Logo 3" className="w-full h-full object-cover" />
              </motion.div>
            </div>
 
            {/* Presenter Text */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-neutral-500 uppercase text-[10px] md:text-xs mb-6 font-medium tracking-[0.6em]"
            >
              GameLiminals Presents
            </motion.div>

            <p 
              className="text-xl md:text-2xl font-light tracking-[0.3em] text-yellow-300 uppercase mb-8"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              5Hrs Vibe Coding Hackathon
            </p>
            
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-8xl font-heading italic tracking-tighter flex px-4"
            >
              {letters.map((letter, index) => (
                <motion.span
                  variants={child}
                  key={index}
                  className={`${letter === " " ? "mr-4" : "inline-block"} ${/[\d.]/.test(letter) ? 'font-sans font-black' : ''}`}
                  style={{
                    color: index >= 8 ? "#dc2626" : "#fde047", // Yellow for GAMEJAM, Deep Red for 2K26 house
                    textShadow: index >= 8 ? "0 0 25px rgba(220,38,38,0.6)" : "0 0 25px rgba(253,224,71,0.3)"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>



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
                className="w-1/2 h-full bg-red-600 shadow-[0_0_15px_#dc2626]"
              />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
