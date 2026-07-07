'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { getDb } from '@/lib/firebase';

interface Partner {
  name: string;
  brandingType: string;
  image: string;
  displayOrder?: number;
  websiteUrl?: string;
  communityType?: string;
}

const PartnerCard = ({ image, name, brandingType, websiteUrl, communityType }: Partner) => {
  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 group-hover:border-blue-400/50 transition-colors cursor-pointer">
          <img src={image} alt={name} className="w-16 h-16 object-contain" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-wider uppercase">{name}</h3>
          {brandingType && <p className="text-xs font-medium text-blue-300 tracking-[0.2em] uppercase mt-2">{brandingType}</p>}
          {communityType && (
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mt-1">{communityType}</p>
          )}
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

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const snap = await get(ref(getDb(), 'partners'));
        if (snap.exists()) {
          const data = snap.val();
          const list = Object.values(data) as Partner[];
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setPartners(list);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="relative py-24 flex items-center justify-center min-h-[30vh] overflow-hidden bg-transparent">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-24">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-black italic tracking-wider mb-4 text-cyan-400"
          >
            OUR <span className="text-white">PARTNERS</span>
          </motion.h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {partners.map((partner, index) => (
            <PartnerCard key={index} {...partner} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
