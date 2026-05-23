'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Sponsors from '@/components/Sponsors';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      {/* Background Image */}
      <div className="fixed top-24 sm:top-0 left-0 w-full h-[55vh] sm:h-full z-0 pointer-events-none">
        <img 
          src="/backgrounds/sponsorsbg.jpg" 
          alt="Sponsors Background" 
          className="w-full h-full object-cover object-center opacity-80 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-yellow-300 mb-4">
              OUR <span className="text-red-400">SPONSORS</span>
            </h1>
            <div className="h-1 w-24 bg-red-400 mx-auto" />
            <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              The legendary guilds and visionaries powering VIBEFORGE 1.0. Join the ranks of those who forge the future of gaming.
            </p>
          </motion.div>



          <Sponsors />
        </div>
      </div>

      <Footer />
    </main>
  );
}
