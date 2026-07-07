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
      
      {/* Static Background Images */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Desktop Background */}
        <img 
          src="/backgrounds/schedulepc.png" 
          alt="Schedule Background PC" 
          className="hidden md:block w-full h-full object-cover object-center opacity-90"
        />
        {/* Mobile Background */}
        <img 
          src="/backgrounds/schedulephone.png" 
          alt="Schedule Background Phone" 
          className="block md:hidden w-full h-full object-cover object-center opacity-90"
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
