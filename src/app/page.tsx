'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sword, Ghost, Zap } from 'lucide-react';
import Link from 'next/link';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import About from '@/components/About';
import ScrollNavigation from '@/components/ScrollNavigation';
import CountdownTimer from '@/components/CountdownTimer';
import PrizesAndMerch from '@/components/PrizesAndMerch';
import Judges from '@/components/Judges';
import Faq from '@/components/Faq';

export default function Home() {
  return (
    <main className="relative min-h-[500vh] bg-black text-white selection:bg-yellow-400 selection:text-black">
      {/* Navigation */}
      <Navbar />

      {/* Static Background Images */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/backgrounds/homephone.png')] md:bg-[url('/backgrounds/Home%20Page.png')] bg-cover bg-center md:bg-top bg-no-repeat" />
      </div>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 lg:px-24 overflow-hidden z-20 bg-transparent mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-7xl relative z-30 flex flex-col items-center mt-32 md:mt-24"
        >

          {/* Countdown Timer */}
          <CountdownTimer targetDate="2026-08-22T09:00:00" />

          <div className="flex flex-col items-center mt-8 gap-4 w-full">
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-center items-center">
              <Link
                href="https://arena.vibeforge-1-0.tech/"
                className="group relative px-5 py-2.5 sm:px-8 sm:py-4 h-12 sm:h-14 flex items-center justify-center rounded-2xl font-black tracking-[0.2em] text-yellow-300 transition-all duration-500 hover:scale-105 hover:-translate-y-1 active:scale-95 text-xs sm:text-sm font-heading"
              >
                {/* Glassy Background */}
                <div className="absolute inset-0 bg-yellow-400/5 backdrop-blur-xl rounded-2xl border border-yellow-400/20 group-hover:border-yellow-400/50 transition-colors" />
                {/* Neon Glow Spread */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(253,224,71,0.2)] group-hover:shadow-[0_0_40px_rgba(253,224,71,0.45)] transition-all duration-500" />
                <span className="relative z-10">ENTER ARENA</span>
              </Link>

              <div
                className="relative px-5 py-2.5 sm:px-8 sm:py-4 h-12 sm:h-14 flex items-center justify-center rounded-2xl font-black tracking-[0.2em] text-white text-xs sm:text-sm font-heading cursor-not-allowed select-none"
              >
                {/* Red Background */}
                <div className="absolute inset-0 bg-red-600/90 backdrop-blur-xl rounded-2xl border border-red-500/50" />
                {/* Red Glow Spread */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
                <span className="relative z-10 text-white">REGISTRATION CLOSED</span>
              </div>

              {/* Desktop Discord Button */}
              <Link
                href="https://discord.gg/c5wUzCA6zN"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center gap-2 group relative px-5 py-2.5 sm:px-8 sm:py-4 h-12 sm:h-14 rounded-2xl font-black tracking-[0.2em] text-white transition-all duration-500 hover:scale-105 hover:-translate-y-1 active:scale-95 text-xs sm:text-sm font-heading"
              >
                {/* Solid Background */}
                <div className="absolute inset-0 bg-[#5865F2] group-hover:bg-[#4752C4] rounded-2xl border border-white/10 transition-colors duration-300" />
                {/* Neon Glow Spread */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(88,101,242,0.3)] group-hover:shadow-[0_0_40px_rgba(88,101,242,0.65)] transition-all duration-500" />
                <svg className="relative z-10 w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                </svg>
                <span className="relative z-10 text-white">JOIN DISCORD</span>
              </Link>
            </div>

            {/* Mobile Discord Button */}
            <Link
              href="https://discord.gg/c5wUzCA6zN"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex items-center justify-center gap-2 group relative px-5 py-2.5 sm:px-8 sm:py-4 h-12 sm:h-14 rounded-2xl font-black tracking-[0.2em] text-white transition-all duration-500 hover:scale-105 hover:-translate-y-1 active:scale-95 text-xs sm:text-sm font-heading"
            >
              {/* Solid Background */}
              <div className="absolute inset-0 bg-[#5865F2] hover:bg-[#4752C4] rounded-2xl border border-white/10 transition-colors duration-300" />
              {/* Neon Glow Spread */}
              <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(88,101,242,0.3)] group-hover:shadow-[0_0_40px_rgba(88,101,242,0.65)] transition-all duration-500" />
              <svg className="relative z-10 w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
              <span className="relative z-10 text-white">JOIN DISCORD</span>
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

        {/* Desktop Discord Button (Bottom Right Corner of Hero, left of scroll navigation) */}
        <div className="hidden">
          <span className="text-[9px] uppercase tracking-[0.22em] text-neutral-400 font-bold" style={{ fontFamily: "var(--font-orbitron), sans-serif" }}>Join the Community</span>
          <Link
            href="https://discord.gg/c5wUzCA6zN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-[10px] tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(88,101,242,0.4)] border border-white/10"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
            </svg>
            <span>JOIN DISCORD</span>
          </Link>
        </div>
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
