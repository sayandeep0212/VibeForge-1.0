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

            {/* Download Brochure Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <a 
                href="https://drive.google.com/file/d/1E7ooXBVS4u8mNm2NVJKtrCPZmEaU3Pe3/view?usp=sharing" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-red-400/50 transition-all duration-300 backdrop-blur-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg 
                  className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm font-black tracking-widest text-white uppercase italic">Download Brochure</span>
              </a>
            </motion.div>
          </motion.div>



          <Sponsors />
        </div>
      </div>

      <Footer />
    </main>
  );
}
