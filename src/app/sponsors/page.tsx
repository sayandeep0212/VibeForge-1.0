'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Sponsors from '@/components/Sponsors';
import Footer from '@/components/Footer';
import ScrollBackground from '@/components/ScrollBackground';
import ThreeOverlay from '@/components/ThreeOverlay';
import { motion } from 'framer-motion';

export default function SponsorsPage() {
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
              OUR <span className="text-red-600">SPONSORS</span>
            </h1>
            <div className="h-1 w-24 bg-red-600 mx-auto" />
            <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              The legendary guilds and visionaries powering GAMEJAM 2K26. Join the ranks of those who forge the future of gaming.
            </p>
          </motion.div>

          <Sponsors />
        </div>
      </div>

      <Footer />
    </main>
  );
}
