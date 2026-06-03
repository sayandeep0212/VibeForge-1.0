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

  const shuffle = useCallback(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
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

  // Shuffle on mount (page load / refresh)
  useEffect(() => {
    const timeout = setTimeout(() => {
      shuffle();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [shuffle, delay]);

  // Auto shuffle every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      shuffle();
    }, 10000);
    return () => clearInterval(interval);
  }, [shuffle]);

  return (
    <motion.span className={className}>
      {displayText.split('').map((char, i) => (
        <span 
          key={i} 
          className={/[\d.]/.test(char) ? 'font-sans font-black' : ''}
        >
          {char}
        </span>
      ))}
    </motion.span>
  );
}
