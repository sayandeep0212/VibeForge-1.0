'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ref, get } from 'firebase/database';
import { getDb } from '@/lib/firebase';

interface Sponsor {
  name: string;
  brandingType: string;
  image: string;
  displayOrder?: number;
  websiteUrl?: string;
}

const SponsorCard = ({ image, name, brandingType, websiteUrl }: Sponsor) => {
  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 group-hover:border-red-400/50 transition-colors cursor-pointer">
          <img src={image} alt={name} className="w-16 h-16 object-contain" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold font-sans text-white group-hover:text-yellow-400 transition-colors tracking-wider uppercase">{name}</h3>
          {brandingType && <p className="text-xs font-medium text-yellow-300 tracking-[0.3em] uppercase mt-2">{brandingType}</p>}
        </div>
      </div>
    </>
  );

  return websiteUrl ? (
    <motion.a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative block group p-8 rounded-3xl border border-white/5 bg-neutral-900 hover:bg-neutral-800 transition-all duration-500 overflow-hidden cursor-pointer"
    >
      {content}
    </motion.a>
  ) : (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group p-8 rounded-3xl border border-white/5 bg-neutral-900 hover:bg-neutral-800 transition-all duration-500 overflow-hidden"
    >
      {content}
    </motion.div>
  );
};

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const snap = await get(ref(getDb(), 'sponsors'));
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.values(data) as Sponsor[];
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setSponsors(list);
        }
      } catch (error) {
        console.error('Error fetching sponsors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  if (loading) {
    return (
      <section id="sponsors" className="relative py-24 flex items-center justify-center min-h-[50vh] overflow-hidden bg-transparent">
        <Loader2 className="w-10 h-10 text-yellow-300 animate-spin" />
      </section>
    );
  }

  return (
    <section id="sponsors" className="relative py-16 sm:py-24 px-4 sm:px-6 md:px-24 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-wider mb-4 text-yellow-300"
          >
            OUR <span className="text-white">ALLIES</span>
          </motion.h2>
          <div className="w-24 h-1 bg-red-400 mx-auto rounded-full" />
        </div>

        {sponsors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {sponsors.map((sponsor, index) => (
              <SponsorCard key={index} {...sponsor} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 mb-20">
            <div className="text-center p-10 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md max-w-md">
              <p className="text-2xl md:text-3xl font-black italic text-yellow-300 uppercase tracking-wider mb-2">To Be Revealed Soon</p>
              <p className="text-neutral-500 text-sm font-sans">Stay tuned for the official announcement.</p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Sponsors;
