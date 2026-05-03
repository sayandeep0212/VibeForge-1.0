'use client';

import ScrollBackground from '@/components/ScrollBackground';
import ThreeOverlay from '@/components/ThreeOverlay';
import Navbar from '@/components/Navbar';
import Faq from '@/components/Faq';
import Preloader from '@/components/Preloader';
import Footer from '@/components/Footer';
import PrizesAndMerch from '@/components/PrizesAndMerch';
import Judges from '@/components/Judges';
import ScrollNavigation from '@/components/ScrollNavigation';
import { motion } from 'framer-motion';
import { ChevronDown, Sword, Ghost, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-[500vh] bg-black text-white selection:bg-red-500 selection:text-white">
      <Preloader />
      {/* Navigation */}
      <Navbar />

      {/* Background Layers */}
      <ScrollBackground />
      <ThreeOverlay />

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <p className="text-sm md:text-base text-red-500 font-bold tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            GAMELIMINAL'S PRESENTS
          </p>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
            GAMEJAM
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-[0.5em] text-red-500 uppercase mb-8">
            48 hour game making competition
          </p>

          <div className="flex gap-4 justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              ENTER ARENA
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold tracking-widest transition-all">
              REGISTER NOW
            </button>
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

      <PrizesAndMerch />
      <Judges />
      <Faq />

      <Footer />
      <ScrollNavigation />
    </main>
  );
}
