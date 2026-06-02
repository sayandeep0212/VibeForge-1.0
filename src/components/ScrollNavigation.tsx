'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollNavigation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-4 sm:bottom-10 sm:right-10 z-[100] flex flex-col gap-3 sm:gap-4">
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="p-2.5 sm:p-4 bg-red-600 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all hover:scale-110 active:scale-95 group border border-white/20"
            title="Scroll to Top"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-y-1" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={scrollToBottom}
        className="p-2.5 sm:p-4 bg-neutral-900 text-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-neutral-800 transition-all hover:scale-110 active:scale-95 group border border-white/10 backdrop-blur-md"
        title="Scroll to Bottom"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-y-1" />
      </motion.button>
    </div>
  );
};

export default ScrollNavigation;
