'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Schedule from '@/components/Schedule';
import Footer from '@/components/Footer';
import ScrollBackground from '@/components/ScrollBackground';
import ThreeOverlay from '@/components/ThreeOverlay';
import { motion } from 'framer-motion';

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      
      {/* Background Layers */}
      <ScrollBackground />
      <ThreeOverlay />

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-4">
              THE <span className="text-red-600">SCHEDULE</span>
            </h1>
            <div className="h-1 w-24 bg-red-600 mx-auto" />
            <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              48 Hours of non-stop creativity. Plan your quest, track your milestones, and master the blade of game development.
            </p>
          </motion.div>

          <Schedule />
        </div>
      </div>

      <Footer />
    </main>
  );
}
