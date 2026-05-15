'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { getDb } from '@/lib/firebase';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  displayOrder?: number;
  socials?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

const MemberCard = ({ member }: { member: TeamMember }) => {
  const [active, setActive] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      onClick={() => setActive(!active)}
      className="relative w-full aspect-[3/4] group cursor-pointer"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-500" />

      {/* Main Card Container with Clip Path */}
      <div 
        className="relative h-full w-full bg-neutral-900 overflow-hidden transition-all duration-500 shadow-2xl"
        style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}
      >
        {/* Full Card Image */}
        <div className="absolute inset-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-tr from-magenta-500/20 to-cyan-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500" />
        </div>

        {/* Inner Border SVG (Matches Clip Path) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none" viewBox="0 0 320 426">
          <polygon 
            points="48,2 318,2 318,364 272,424 2,424 2,62" 
            fill="none" 
            stroke="url(#neon-grad)" 
            strokeWidth="3" 
            className="opacity-40 group-hover:opacity-100 transition-opacity duration-500"
          />
          <defs>
            <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
        </svg>

        {/* Top Right Tech Detail */}
        <div className="absolute top-4 right-4 flex gap-1 z-20">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          <div className="w-1.5 h-1.5 bg-magenta-500 rounded-full animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-150" />
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-6 z-20">
          <div className={`w-full sm:transform sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500 ${active ? 'sm:translate-y-0' : ''}`}>
            {/* Title Block with Left Border */}
            <div className="border-l-2 sm:border-l-4 border-yellow-400 pl-1.5 sm:pl-4 mb-0.5 sm:mb-2">
              <h3 className="text-[10px] sm:text-base md:text-xl font-black font-sans tracking-widest text-white uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)] leading-tight line-clamp-1 sm:line-clamp-none">
                {member.name}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-cyan-400 font-bold text-[7px] sm:text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,1)] leading-tight line-clamp-1 sm:line-clamp-none">
                {member.role}
              </p>
            </div>

            {/* Social Icons Container */}
            <div 
              className={`flex gap-2 sm:gap-3 mt-2 sm:mt-4 md:mt-6 transition-all duration-500 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 ${active ? 'sm:opacity-100 sm:translate-y-0' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {member.socials?.linkedin && (
                <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 bg-black/60 backdrop-blur-md rounded border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all hover:-translate-y-1">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              )}
              {member.socials?.facebook && (
                <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 bg-black/60 backdrop-blur-md rounded border border-white/10 hover:border-magenta-500 hover:text-magenta-500 transition-all hover:-translate-y-1">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
              )}
              {member.socials?.instagram && (
                <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-1 sm:p-2 bg-black/60 backdrop-blur-md rounded border border-white/10 hover:border-yellow-400 hover:text-yellow-400 transition-all hover:-translate-y-1">
                  <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.558.217.957.477 1.377.896.419.42.679.819.896 1.377.164.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.217.558-.477.957-.896 1.377-.42.419-.819.679-1.377.896-.422.164-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.558-.217-.957-.477-1.377-.896-.419-.42-.679-.819-.896-1.377-.164-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.217-.558.477-.957.896-1.377.42-.419.819-.679 1.377-.896.422-.164 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.152.26-2.917.557-.79.307-1.459.718-2.126 1.384-.666.667-1.077 1.335-1.384 2.126-.297.765-.499 1.637-.557 2.917-.058 1.28-.071 1.688-.071 4.947s.013 3.667.072 4.947c.058 1.28.26 2.152.557 2.917.307.79.718 1.459 1.384 2.126.667.666 1.335-1.077 2.126-1.384.765-.297 1.637-.499 2.917-.557 1.28-.058-1.688-.071-4.947-.071zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Team() {
  const [faculty, setFaculty] = useState<TeamMember[]>([]);
  const [management, setManagement] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [facultySnap, teamSnap] = await Promise.all([
          get(ref(getDb(), 'faculty')),
          get(ref(getDb(), 'coreTeam'))
        ]);

        if (facultySnap.exists()) {
          const list = Object.values(facultySnap.val()) as TeamMember[];
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setFaculty(list);
        }
        
        if (teamSnap.exists()) {
          const list = Object.values(teamSnap.val()) as TeamMember[];
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setManagement(list);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <section id="team" className="relative py-24 bg-transparent overflow-hidden flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-yellow-300 animate-spin" />
      </section>
    );
  }

  return (
    <section id="team" className="relative py-24 bg-transparent overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Faculty Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-10 w-2 bg-gradient-to-b from-purple-600 to-cyan-400 rounded-full" />
            <h2 className="text-3xl md:text-5xl font-heading italic text-yellow-300 uppercase tracking-wider">
              The <span className="text-white">Spectator</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 md:gap-10 max-w-5xl mx-auto">
            {faculty.map((member, i) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* Core Management Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-10 w-2 bg-gradient-to-b from-red-600 to-orange-500 rounded-full" />
            <h2 className="text-3xl md:text-5xl font-heading italic text-yellow-300 uppercase tracking-wider">
              Core <span className="text-white">Management</span>
            </h2>
          </motion.div>

          {/* Mobile Auto-Scrolling Marquee */}
          <div className="sm:hidden relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
            <div className="flex gap-4 animate-marquee w-max">
              {[...management, ...management].map((member, i) => (
                <div key={i} className="flex-none w-[180px]">
                  <MemberCard member={member} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Static Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
            {management.map((member, i) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
