'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = '';
    }, 1500); // reduced time for faster entry

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-y-auto px-4 py-8"
        >
          {/* Subtle Ambient Glow */}
          <motion.div
            animate={{
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-400/5 rounded-full blur-[150px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center max-w-4xl w-full my-auto">
            {/* Logos */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center gap-4 sm:gap-6 mb-8 select-none"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
                <img src="/Logos/logo.png" alt="GameLiminals" className="w-full h-full object-contain" />
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
                <img src="/Logos/au_logo.jpg" alt="Adamas University" className="w-full h-full object-contain" />
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
                <img src="/Logos/cycoders.png" alt="Cycoders" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            {/* Presenter Text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-heading text-neutral-400 text-[10px] sm:text-sm tracking-[0.25em] uppercase text-center mb-6 px-2 select-none leading-[2] sm:leading-normal"
            >
              Adamas University Presents
            </motion.div>

            {/* Title block: GameLiminals X VibeForge 1.0 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col items-center justify-center w-full px-4"
            >
              <h1 className="font-heading text-[22px] xs:text-3xl sm:text-5xl md:text-7xl text-white tracking-wide text-center uppercase select-none">
                GameLiminals
              </h1>
              
              <div className="font-heading text-lg sm:text-2xl md:text-3xl text-red-500 my-4 sm:my-6 select-none">
                X
              </div>
              
              <div className="flex items-baseline justify-center gap-1 sm:gap-2 select-none">
                <span className="font-heading text-[22px] xs:text-3xl sm:text-5xl md:text-7xl text-yellow-300 tracking-wide uppercase">
                  VibeForge
                </span>
                <span className="font-sans font-black text-[22px] xs:text-3xl sm:text-5xl md:text-7xl text-red-600 ml-1 tracking-tight">
                  1.0
                </span>
              </div>
            </motion.div>

            {/* 12 Hrs Inter College Vibe Coding Hackathon */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 sm:mt-12 px-4 text-center select-none leading-[2] sm:leading-normal"
            >
              <span className="font-sans font-black text-xs sm:text-lg md:text-xl text-white mr-1.5 sm:mr-2">
                12
              </span>
              <span className="font-heading text-white text-[9px] xs:text-[10px] sm:text-lg md:text-xl tracking-wider sm:tracking-widest uppercase align-middle">
                Hrs Inter College Vibe Coding Hackathon
              </span>
            </motion.div>

            {/* Progress/Loading Bar */}
            <div className="w-48 h-[2px] bg-neutral-900 overflow-hidden mt-16 relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.3
                }}
                className="w-1/2 h-full bg-red-600 shadow-[0_0_15px_#dc2626] absolute left-0"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
