'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sword, Ghost, Zap } from 'lucide-react';
import Link from 'next/link';

// Components
import Navbar from '@/components/Navbar';
import ScrollBackground from '@/components/ScrollBackground';
import ThreeOverlay from '@/components/ThreeOverlay';
import PrizesAndMerch from '@/components/PrizesAndMerch';
import Judges from '@/components/Judges';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';
import About from '@/components/About';
import ScrollNavigation from '@/components/ScrollNavigation';
import ShuffleText from '@/components/ShuffleText';
import CountdownTimer from '@/components/CountdownTimer';

export default function Home() {
  return (
    <main className="relative min-h-[500vh] bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <Navbar />

      <ScrollBackground />
      <ThreeOverlay />

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex flex-col items-start justify-center text-left px-6 md:px-24 overflow-hidden z-20 bg-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-7xl relative z-30"
        >
          <p className="text-xs md:text-base text-cyan-400 font-heading tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            GAMELIMINAL'S PRESENTS
          </p>
          <ShuffleText
            text="VIBEFORGE"
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading tracking-tighter mb-4 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent leading-none pr-8 block"
            delay={10}
          />
          <p
            className="text-sm sm:text-lg md:text-2xl font-light tracking-[0.2em] md:tracking-[0.3em] text-yellow-300 uppercase mb-2 md:mb-10"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            5-Hrs Vibe Coding Inter College Hackathon
          </p>

          {/* Event Date */}
          <div className="mb-6">
            <span className="text-xl md:text-3xl font-orbitron font-black italic text-red-500 tracking-widest uppercase">
              21-ST AUGUST
            </span>
          </div>

          {/* Countdown Timer */}
          <CountdownTimer targetDate="2026-08-21T09:00:00" />

          <div className="flex flex-wrap gap-6 justify-start mt-4">
            <Link href="/dashboard" className="group relative px-10 py-5 rounded-2xl font-black tracking-[0.2em] text-yellow-300 transition-all duration-500 hover:scale-105 active:scale-95">
              {/* Glassy Background */}
              <div className="absolute inset-0 bg-yellow-400/5 backdrop-blur-xl rounded-2xl border border-yellow-400/20 group-hover:border-yellow-400/50 transition-colors" />
              {/* Neon Spread */}
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(253,224,71,0.2)] group-hover:shadow-[0_0_40px_rgba(253,224,71,0.4)] transition-all duration-500" />
              <span className="relative z-10">ENTER ARENA</span>
            </Link>

            <Link href="/register" className="group relative px-10 py-5 rounded-2xl font-black tracking-[0.2em] text-red-500 transition-all duration-500 hover:scale-105 active:scale-95">
              {/* Glassy Background */}
              <div className="absolute inset-0 bg-red-600/5 backdrop-blur-xl rounded-2xl border border-red-600/20 group-hover:border-red-600/50 transition-colors" />
              {/* Neon Spread */}
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all duration-500" />
              <span className="relative z-10">REGISTER NOW</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10"
        >
          <ChevronDown className="w-10 h-10 text-neutral-500" />
        </motion.div>
      </section>

      {/* About Section */}
      <About />

      <PrizesAndMerch />
      <Judges />
      <Faq />

      <Footer />
      <ScrollNavigation />
    </main>
  );
}
