'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface ShuffleTextProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export default function ShuffleText({ text, className, duration = 0.35, delay = 0 }: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  const shuffle = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      shuffle();
    }, 10000); // 10 seconds house
    return () => clearInterval(interval);
  }, [shuffle]);

  return (
    <motion.span 
      onMouseEnter={() => {
        setIsHovered(true);
        shuffle();
      }}
      className={className}
    >
      {displayText}
    </motion.span>
  );
}
