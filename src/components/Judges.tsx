'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Judge {
  name: string;
  role: string;
  image: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

const JudgeCard = ({ judge }: { judge: Judge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="relative w-full max-w-[320px] aspect-[3/4] p-1 group"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-magenta-500/10 blur-3xl group-hover:bg-magenta-500/20 transition-all duration-500" />

      {/* Main Octagonal Card */}
      <div
        className="relative h-full w-full bg-[#0a0a1a] shadow-[0_0_30px_rgba(255,0,255,0.1)] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(255,0,255,0.2)]"
        style={{
          clipPath: "polygon(15% 0, 85% 0, 100% 12%, 100% 88%, 85% 100%, 15% 100%, 0 88%, 0 12%)"
        }}
      >
        {/* Outer Magenta Border */}
        <div
          className="absolute inset-0 bg-magenta-500/40"
          style={{
            clipPath: "polygon(15% 0, 85% 0, 100% 12%, 100% 88%, 85% 100%, 15% 100%, 0 88%, 0 12%)"
          }}
        >
          <div
            className="absolute inset-[2px] bg-[#0a0a1a]"
            style={{
              clipPath: "polygon(15% 0, 85% 0, 100% 12%, 100% 88%, 85% 100%, 15% 100%, 0 88%, 0 12%)"
            }}
          />
        </div>

        {/* Inner Cyan Border */}
        <div
          className="absolute inset-[10px] border border-cyan-400/30 opacity-60 group-hover:opacity-100 transition-opacity"
          style={{
            clipPath: "polygon(15% 0, 85% 0, 100% 12%, 100% 88%, 85% 100%, 15% 100%, 0 88%, 0 12%)"
          }}
        />

        {/* Decorative Corner Brackets */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-magenta-500 shadow-[0_0_10px_#d946ef]" />
        
        {/* Side Borders */}
        <div className="absolute top-[12%] right-0 w-[2px] h-[76%] bg-magenta-500 shadow-[0_0_15px_#d946ef]" />
        <div className="absolute top-[12%] left-0 w-[2px] h-[76%] bg-magenta-500 shadow-[0_0_15px_#d946ef]" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center pt-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full scale-125" />
            <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-magenta-500 shadow-2xl">
              <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden">
                <img
                  src={judge.image}
                  alt={judge.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto w-full px-8 pb-8 flex flex-col items-center">
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-0 bg-[#05050a] border border-white/10"
                style={{ clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)" }}
              />
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />

              <div className="relative py-3 px-4 text-center">
                <h3 className="text-xl font-black tracking-widest text-white uppercase italic leading-none">
                  {judge.name}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-neutral-300 font-medium text-xs tracking-[0.2em] uppercase text-center">
              {judge.role}
            </p>
            
            <div className="relative z-10 flex gap-4 mt-4">
              {/* Reuse social icons SVGs */}
              <a href="#" className="p-2 bg-white/5 rounded-full border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full border border-white/10 hover:border-magenta-500 hover:text-magenta-500 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Judges = () => {
  const judges: Judge[] = [
    {
      name: "Sarah Jenkins",
      role: "Senior Unity Developer",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "David Chen",
      role: "Art Director @ Ubisoft",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
    },
    {
      name: "Elena Rodriguez",
      role: "Indie Game Consultant",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
    }
  ];

  return (
    <section id="judges" className="py-24 bg-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-4"
          >
            THE <span className="text-red-600">JUDGES</span>
          </motion.h2>
          <div className="h-1 w-24 bg-red-600 mx-auto" />
          <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg font-medium tracking-wide">
            Industry experts and veterans set to evaluate the next generation of game developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
          {judges.map((judge, i) => (
            <JudgeCard key={i} judge={judge} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Judges;
