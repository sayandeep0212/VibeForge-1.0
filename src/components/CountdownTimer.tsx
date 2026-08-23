'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="mt-6 py-6 px-4 md:px-8 text-center max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-4 md:gap-6"
          style={{ fontFamily: 'var(--font-orbitron)' }}
        >
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
            Thank You For Joining<br className="hidden sm:block" /> VibeForge 1.0
          </div>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white px-2">
              We hope you had an amazing time! Stay tuned for more exciting events.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white font-semibold italic">
              We will be back next year with something new and exciting.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-red-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative px-2 py-1.5 sm:px-3 sm:py-2 bg-black border border-white/10 rounded-lg min-w-[48px] sm:min-w-[60px] md:min-w-[80px]">
          <span className="text-xl sm:text-2xl md:text-4xl font-black italic text-white block text-center">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest mt-2">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 sm:gap-4 md:gap-8 mt-6">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
