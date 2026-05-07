'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, ShoppingBag, Star, Crown, Zap } from 'lucide-react';

const PrizesAndMerch = () => {
  const prizes = [
    {
      rank: "2ND RUNNER UP",
      amount: "TROPHY",
      color: "from-orange-400 to-red-600",
      icon: <Star className="w-12 h-12 text-orange-500" />,
      benefits: ["Official 3rd Place Trophy", "Certificate of Achievement", "GameLiminals Swag Bag", "Exclusive Community Access"]
    },
    {
      rank: "WINNER",
      amount: "TROPHY",
      color: "from-cyan-400 to-blue-600",
      icon: <Trophy className="w-16 h-16 text-cyan-400" />,
      featured: true,
      benefits: ["Official 1st Place Trophy", "Certificate of Excellence", "Mega Swag Kit", "Direct Entry to Next Level", "Hall of Fame Feature"]
    },
    {
      rank: "1ST RUNNER UP",
      amount: "TROPHY",
      color: "from-yellow-400 to-amber-600",
      icon: <Crown className="w-12 h-12 text-yellow-500" />,
      benefits: ["Official 2nd Place Trophy", "Certificate of Merit", "Pro Swag Bag", "Hardware Kit Extras"]
    },
    {
      rank: "UI/UX EXCELLENCE",
      amount: "CERTIFICATE",
      color: "from-purple-400 to-magenta-600",
      icon: <Zap className="w-12 h-12 text-purple-400" />,
      fullWidth: true,
      benefits: ["Special Excellence Certificate", "UI/UX Mastery Badge", "Creative Design Feature"]
    }
  ];

  const merch = [
    { name: "Ninja Hoodie", price: "₹1,499", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" },
    { name: "VibeForge 1.0 T-Shirt", price: "₹699", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
    { name: "Cyber Cap", price: "₹499", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop" }
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
            PRIZE <span className="text-white">POOL</span>
          </motion.h2>
          <p className="text-neutral-400 text-lg uppercase tracking-widest font-bold">Grand Trophies & Recognition</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {merch.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative border border-white/10">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8">
                  <h3 className="text-2xl font-black italic text-white mb-1 uppercase">{item.name}</h3>
                  <p className="text-yellow-300 font-bold mb-4">{item.price}</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    BUY MERCH
                  </motion.button>
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
