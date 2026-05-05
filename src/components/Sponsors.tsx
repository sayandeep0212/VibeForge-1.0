'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Shield, Globe, Zap, Box, Layers } from 'lucide-react';

const SponsorCard = ({ icon: Icon, name, tier }: { icon: any, name: string, tier: string }) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.02 }}
    className="relative group p-8 rounded-3xl border border-white/5 bg-neutral-900 hover:bg-neutral-800 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 group-hover:border-red-400/50 transition-colors">
        <Icon className="w-12 h-12 text-neutral-500 group-hover:text-red-400 transition-colors" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors tracking-tighter uppercase">{name}</h3>
        <p className="text-xs font-medium text-yellow-300 tracking-[0.3em] uppercase mt-2">{tier}</p>
      </div>
    </div>
  </motion.div>
);

const Sponsors = () => {
  const sponsors = [
    { name: 'Nexus Core', tier: 'Platinum', icon: Cpu },
    { name: 'Aegis Systems', tier: 'Gold', icon: Shield },
    { name: 'Terraform', tier: 'Gold', icon: Globe },
    { name: 'Volt Dynamics', tier: 'Silver', icon: Zap },
    { name: 'Void Box', tier: 'Silver', icon: Box },
    { name: 'Layer Zero', tier: 'Silver', icon: Layers },
  ];

  return (
    <section id="sponsors" className="relative py-24 px-6 md:px-24 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 text-yellow-300"
          >
            OUR <span className="text-white">ALLIES</span>
          </motion.h2>
          <div className="w-24 h-1 bg-red-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {sponsors.map((sponsor, index) => (
            <SponsorCard key={index} {...sponsor} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-8 bg-gradient-to-b from-white/[0.05] to-transparent p-12 rounded-[3rem] border border-white/5 backdrop-blur-xl">
          <div className="text-center max-w-2xl">
            <h3 className="text-3xl font-bold mb-4 italic">WANT TO EMPOWER THE FUTURE?</h3>
            <p className="text-neutral-400">Join the elite rank of organizations shaping the next generation of ninja developers. Partner with GAMEJAM 2026.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black px-12 py-5 rounded-full font-black text-xl tracking-widest shadow-[0_0_30px_rgba(253,224,71,0.4)] transition-all"
          >
            BECOME A SPONSOR
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
