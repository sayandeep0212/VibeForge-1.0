'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, ShoppingBag, Star, Crown } from 'lucide-react';

const PrizesAndMerch = () => {
  const prizes = [
    {
      rank: "1ST RUNNER UP",
      amount: "₹25,000",
      color: "from-yellow-400 to-amber-600",
      icon: <Crown className="w-12 h-12 text-yellow-500" />,
      benefits: ["Cash Prize", "Internship Opportunity", "Hardware Kit", "Winners Trophy"]
    },
    {
      rank: "WINNER",
      amount: "₹50,000",
      color: "from-cyan-400 to-blue-600",
      icon: <Trophy className="w-16 h-16 text-cyan-400" />,
      featured: true,
      benefits: ["Mega Cash Prize", "Sponsor Special Gift", "Full Hardware Kit", "Golden Trophy", "Certificate of Excellence"]
    },
    {
      rank: "2ND RUNNER UP",
      amount: "₹15,000",
      color: "from-orange-400 to-red-600",
      icon: <Star className="w-12 h-12 text-orange-500" />,
      benefits: ["Cash Prize", "Swag Bag", "Certificate", "Bronze Trophy"]
    }
  ];

  const merch = [
    { name: "Ninja Hoodie", price: "₹1,499", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" },
    { name: "GameJam T-Shirt", price: "₹699", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
    { name: "Cyber Cap", price: "₹499", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop" }
  ];

  return (
    <section id="prizes" className="py-32 relative overflow-hidden bg-black">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-4"
          >
            PRIZE <span className="text-red-600">POOL</span>
          </motion.h2>
          <p className="text-neutral-400 text-lg uppercase tracking-widest font-bold">Total Pool worth ₹1,00,000+</p>
        </div>

        {/* Prizes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40 items-end">
          {prizes.map((prize, idx) => (
            <motion.div
              key={prize.rank}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className={`relative group ${prize.featured ? 'md:scale-110 z-20 order-1 md:order-2' : idx === 0 ? 'order-2 md:order-1' : 'order-3'}`}
            >
              <div className={`absolute -inset-1 bg-gradient-to-b ${prize.color} rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000`} />
              <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 h-full">
                <div className="flex justify-center mb-8">
                  {prize.icon}
                </div>
                <h3 className="text-center text-neutral-400 font-black text-sm tracking-[0.3em] mb-2">{prize.rank}</h3>
                <p className={`text-center text-4xl md:text-5xl font-black bg-gradient-to-r ${prize.color} bg-clip-text text-transparent mb-8`}>
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
            className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-4"
          >
            LIMITED <span className="text-red-600">EDITION</span> SWAGS
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
                  <p className="text-red-500 font-bold mb-4">{item.price}</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
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
