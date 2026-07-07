'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Sponsors from '@/components/Sponsors';
import Partners from '@/components/Partners';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        {/* Desktop Background */}
        <img 
          src="/backgrounds/sponsorsbgpc.png" 
          alt="Sponsors Background PC" 
          className="hidden md:block w-full h-full object-cover object-center opacity-95 brightness-90"
        />
        {/* Mobile Background */}
        <img 
          src="/backgrounds/sponsorsbgphone.png" 
          alt="Sponsors Background Phone" 
          className="block md:hidden w-full h-full object-cover object-top opacity-95 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
      </div>
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-yellow-300 mb-4">
              OUR <span className="text-red-400">SPONSORS</span>
            </h1>
            <div className="h-1 w-24 bg-red-400 mx-auto" />
            <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
              The legendary guilds and visionaries powering VIBEFORGE 1.0. Join the ranks of those who forge the future of gaming.
            </p>
          </motion.div>



          <Sponsors />
          <Partners />
        </div>
      </div>

      <Footer />
    </main>
  );
}
