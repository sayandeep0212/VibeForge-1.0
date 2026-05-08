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
      <div className="mt-6 py-4 px-8 bg-red-600/10 border border-red-600/50 rounded-2xl backdrop-blur-xl">
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl md:text-4xl font-black italic text-red-500 uppercase tracking-tighter"
        >
          Hackathon is Live..
        </motion.p>
      </div>
    );
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-red-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative px-3 py-2 bg-black border border-white/10 rounded-lg min-w-[60px] md:min-w-[80px]">
          <span className="text-2xl md:text-4xl font-black italic text-white block text-center">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-8 mt-6">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
