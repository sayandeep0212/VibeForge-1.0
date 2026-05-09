'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ArenaPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-yellow-400/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              filter: ["drop-shadow(0 0 10px rgba(220,38,38,0.3))", "drop-shadow(0 0 30px rgba(220,38,38,0.6))", "drop-shadow(0 0 10px rgba(220,38,38,0.3))"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-red-600/10 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-10 backdrop-blur-xl"
          >
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </motion.div>

          {/* Heading */}
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6">
            ARENA <span className="text-red-500">LOCKED</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-yellow-400 font-orbitron text-xs tracking-[0.5em] uppercase font-bold">
              Initializing Protocols
            </span>
            <div className="h-px w-12 bg-white/20" />
          </div>

          <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            The VibeForge Arena is currently under construction. Final shards are being forged to provide the ultimate coding showdown experience.
          </p>

          {/* Progress Bar (Visual only) */}
          <div className="w-full max-w-md mx-auto h-1.5 bg-white/5 rounded-full mb-12 overflow-hidden border border-white/10">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/" className="group flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-widest uppercase text-sm">Return Home</span>
            </Link>
            
            <div className="flex items-center gap-2 px-8 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl cursor-wait opacity-80">
              <Zap className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-bold tracking-widest uppercase text-sm text-red-400">Forging Shards...</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Text */}
      <div className="relative z-10 p-10 text-center">
        <p className="text-neutral-600 font-mono text-xs uppercase tracking-widest">
          Systems Online // Awaiting Authorization // GameLiminals v1.0
        </p>
      </div>
    </main>
  );
}
