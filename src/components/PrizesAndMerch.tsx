'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, ShoppingBag, Star, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

const PrizesAndMerch = () => {
  const [prices, setPrices] = useState<any>({ 
    tshirtPrice: 699, 
    capPrice: 499, 
    merchEnabled: true,
    stock: {
      tshirt: { black: true, white: true, lavender: true },
      cap: { black: true, white: true, lavender: true }
    }
  });

  const [tshirtIndex, setTshirtIndex] = useState(0);
  const [capIndex, setCapIndex] = useState(0);

  const tshirtImages = [
    "/Merch/t-shirts/black polo shirt/1.png",
    "/Merch/t-shirts/white polo shirt/1.png",
    "/Merch/t-shirts/lavender for girls polo/1.png"
  ];

  const capImages = [
    "/Merch/caps/blackcap.png",
    "/Merch/caps/whitecap.png",
    "/Merch/caps/lavendercap.png"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTshirtIndex((prev) => (prev + 1) % tshirtImages.length);
      setCapIndex((prev) => (prev + 1) % capImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/merch/settings')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && !data.error) setPrices(data);
      })
      .catch(err => {
        console.error('Error fetching prices:', err);
        // Silently fail or use defaults already in state
      });
  }, []);

  const prizes = [
    {
      rank: "2ND RUNNER UP",
      amount: "TROPHY",
      color: "from-orange-400 to-red-600",
      icon: <Star className="w-12 h-12 text-orange-500" />,
      benefits: [
        "Official 3rd Place Trophy",
        "Certificate of Achievement",
        "Website Feature (Team Name, Picture & College)"
      ]
    },
    {
      rank: "WINNER",
      amount: "TROPHY",
      color: "from-cyan-400 to-blue-600",
      icon: <Trophy className="w-16 h-16 text-cyan-400" />,
      featured: true,
      benefits: [
        "Official 1st Place Trophy",
        "Certificate of Excellence",
        "Website Feature (Team Name, Picture & College)"
      ]
    },
    {
      rank: "1ST RUNNER UP",
      amount: "TROPHY",
      color: "from-yellow-400 to-amber-600",
      icon: <Crown className="w-12 h-12 text-yellow-500" />,
      benefits: [
        "Official 2nd Place Trophy",
        "Certificate of Merit",
        "Website Feature (Team Name, Picture & College)"
      ]
    },
    {
      rank: "UI/UX EXCELLENCE",
      amount: "CERTIFICATE",
      color: "from-purple-400 to-magenta-600",
      icon: <Zap className="w-12 h-12 text-purple-400" />,
      fullWidth: true,
      benefits: ["Special Excellence Certificate"]
    }
  ];

  const merch = [
    { 
      name: "Vibeforge polo T shirt", 
      price: `₹${prices.tshirtPrice}`, 
      image: tshirtImages[tshirtIndex],
      type: "t-shirt",
      id: "tshirt"
    },
    { 
      name: "Cyber Cap", 
      price: `₹${prices.capPrice}`, 
      image: capImages[capIndex],
      type: "cap",
      id: "cap"
    }
  ];

  return (
    <section id="prizes" className="py-32 relative overflow-hidden bg-transparent">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.05),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading italic tracking-wider text-yellow-300 mb-4"
          >
            THE <span className="text-white">PRIZES</span>
          </motion.h2>
          <p className="text-neutral-400 text-lg uppercase tracking-widest font-bold">🏆 Trophies & Certificates</p>
        </div>

        {/* Prizes Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-40 items-end">
          {prizes.map((prize, idx) => (
            <motion.div
              key={prize.rank}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`relative group w-full md:w-[calc(33.33%-2rem)] min-w-[300px] ${prize.featured ? 'md:scale-110 z-20' : ''} ${prize.fullWidth ? 'md:w-full max-w-2xl' : ''}`}
            >
              <div className={`absolute -inset-1 bg-gradient-to-b ${prize.color} rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000`} />
              <div className="relative bg-neutral-900/40 backdrop-blur-lg rounded-3xl border border-white/10 p-8 h-full">
                <div className="flex justify-center mb-8">
                  {prize.icon}
                </div>
                <h3 className="text-center text-neutral-400 font-black font-sans text-sm tracking-[0.3em] mb-2">{prize.rank}</h3>
                <p className={`text-center text-4xl md:text-5xl font-black font-sans bg-gradient-to-r ${prize.color} bg-clip-text text-transparent mb-8`}>
                  {prize.amount}
                </p>
                <ul className="space-y-4 mb-8">
                  {prize.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-neutral-300 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${prize.color}`} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Merch Section */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading italic tracking-wider text-yellow-300 mb-4"
          >
            LIMITED <span className="text-white">EDITION</span> SWAGS
          </motion.h2>
          <p className="text-neutral-400 text-lg uppercase tracking-widest font-bold">Official GameLiminals Merchandise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {merch.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative border border-white/10 bg-neutral-900">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={item.image}
                    src={item.image} 
                    alt={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 pt-0 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-yellow-300 transition-colors uppercase leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-1">
                          <div className="w-3 h-3 rounded-full bg-black border border-white/20" title="Black" />
                          <div className="w-3 h-3 rounded-full bg-white border border-white/20" title="White" />
                          <div className="w-3 h-3 rounded-full bg-[#B57EDC] border border-white/20" title="Lavender" />
                        </div>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Other colors available</span>
                      </div>
                      <p className="text-xl font-black italic text-yellow-300 mt-1 mb-4">{item.price}</p>
                    </div>
                  </div>
                  <Link 
                    href={prices.merchEnabled ? `/merch?type=${item.type}` : '#'}
                    className={`w-full py-3 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                      prices.merchEnabled 
                      ? 'bg-white text-black hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 hover:text-black' 
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {prices.merchEnabled ? 'BUY MERCH' : 'STORE CLOSED'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrizesAndMerch;
