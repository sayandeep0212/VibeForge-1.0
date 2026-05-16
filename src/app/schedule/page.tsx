'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Schedule from '@/components/Schedule';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />
      
      {/* Background Image with Focused Panning */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.img 
          src="/backgrounds/schedulebg.png" 
          alt="Schedule Background" 
          initial={{ x: "0%" }}
          animate={{ x: ["0%", "-5%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse", 
            ease: "easeInOut" 
          }}
          className="w-[110%] h-full object-cover object-left opacity-90 max-w-none"
        />
        {/* Subtle Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-black/20" />
      </div>


      <div className="relative z-10">
        <Schedule />
      </div>

      <Footer />
    </main>
  );
}
