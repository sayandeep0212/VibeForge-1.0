'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Team from '@/components/Team';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-cyan-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-4">
              THE <span className="text-red-600">TEAM</span>
            </h1>
            <div className="h-1 w-24 bg-red-600 mx-auto" />
            <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              The masterminds behind GAMEJAM 2K26. A fusion of technical prowess and creative vision.
            </p>
          </motion.div>

          <Team />
        </div>
      </div>

      <Footer />
    </main>
  );
}
