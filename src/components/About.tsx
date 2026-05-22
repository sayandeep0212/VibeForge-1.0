'use client';

import { motion } from 'framer-motion';
import { Info, Users, Zap, Shield } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="relative py-32 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Side: Club Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex-shrink-0">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic text-yellow-300 uppercase tracking-wider">
                THE <span className="text-white">GUILD</span>
              </h2>
            </div>

            <p className="text-xl text-neutral-300 leading-relaxed font-medium font-sans">
              <span className="text-cyan-400 font-black">GAMELIMINALS</span> is not just a club; it's a brotherhood of digital architects. Based at Adamas University, we are a collective of developers, artists, and storytellers dedicated to the art of game creation.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group hover:border-cyan-400/50 transition-all">
                <Shield className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="font-bold text-white uppercase mb-2">OUR MISSION</h3>
                <p className="text-sm text-neutral-400 font-sans">To push the limits of interactive storytelling and technical innovation.</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group hover:border-yellow-300/50 transition-all">
                <Zap className="w-8 h-8 text-yellow-300 mb-3" />
                <h3 className="font-bold text-white uppercase mb-2">OUR LEGACY</h3>
                <p className="text-sm text-neutral-400 font-sans">Hosting the most intense development challenges in the region.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">TEAM SIZE</p>
                <p className="text-lg font-black text-white italic">UP TO 3</p>
              </div>
              <div className="text-center border-x border-white/10 px-2">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">REG FEE</p>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-yellow-300 italic uppercase">₹150 <span className="text-[8px] text-neutral-500 font-sans not-italic">ADAMAS</span></p>
                  <p className="text-[10px] font-black text-yellow-300 italic uppercase">₹250 <span className="text-[8px] text-neutral-500 font-sans not-italic">OTHERS</span></p>
                </div>
              </div>
              <div className="text-center border-r border-white/10">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">DURATION</p>
                <p className="text-lg font-black text-white italic">12 HRS</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">THEME</p>
                <p className="text-[10px] font-black text-red-500 italic uppercase leading-tight">ON SPOT<br />DECLARATION</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Event Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-red-600/20 to-cyan-500/20 blur-3xl opacity-30" />
            <div className="relative bg-neutral-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl" />

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex-shrink-0">
                  <Info className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-yellow-300 uppercase tracking-wider">
                  THE <span className="text-white">GAUNTLET</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
                  <p className="text-lg text-neutral-200 font-sans leading-relaxed">
                    <span className="text-red-500 font-black">VIBEFORGE 1.0</span> is a fast-paced vibe coding hackathon presented by GameLiminals club of Adamas University built around innovation, creativity, collaboration, and real-time problem solving.
                  </p>
                </div>

                <p className="text-neutral-400 font-sans leading-relaxed">
                  Participants will work individually or in teams to brainstorm concepts, design experiences, develop prototypes, and showcase their creativity through technology. It is a total <span className="text-white font-bold">web development and UI/UX hackathon</span> designed to push creative thinking and hands-on execution.
                </p>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-cyan-400 font-sans font-bold italic">
                    "People will vibe-code working websites and deploy in a timeframe of 12 hours."
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">EVENT FORMAT</p>
                      <p className="text-2xl font-black text-white italic">FAST-PACED ARENA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-red-500">2K26</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
