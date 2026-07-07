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
        <div className="fixed inset-0 w-full h-full">
          {/* Desktop Background */}
          <img 
            src="/backgrounds/teambgpc.png" 
            alt="Team Background PC" 
            className="hidden md:block w-full h-full object-cover object-[50%_25%] opacity-90"
          />
          {/* Mobile Background */}
          <img 
            src="/backgrounds/teambgphone.png" 
            alt="Team Background Phone" 
            className="block md:hidden w-full h-full object-cover object-top opacity-90"
          />
          <div className="absolute inset-0 bg-black/10" />
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
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-yellow-300 mb-4">
              THE <span className="text-red-400">TEAM</span>
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
