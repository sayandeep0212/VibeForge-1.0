'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Team from '@/components/Team';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="fixed top-24 sm:top-0 left-0 w-full h-[55vh] sm:h-full">
          <img 
            src="/backgrounds/teambg.png" 
            alt="Team Background" 
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-yellow-300 mb-4 drop-shadow-[0_0_20px_rgba(253,224,71,0.3)]">
              THE <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">TEAM</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-300 to-red-500 mx-auto rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <p className="mt-6 text-neutral-300 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              The masterminds behind VIBEFORGE 1.0. A fusion of technical prowess and creative vision.
            </p>
          </motion.div>

          <Team />
        </div>
      </div>

      <Footer />
    </main>
  );
}
