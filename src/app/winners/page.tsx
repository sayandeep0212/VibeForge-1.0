'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Trophy, Star, Medal, Sparkles, Loader2 } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { getDb } from '@/lib/firebase';

interface Winner {
  id: string;
  title: string;
  rank: string;
  teamName: string;
  college: string;
  members: string[];
  imageUrl: string;
  displayOrder: number;
}

const WinnersPage = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const snap = await get(ref(getDb(), 'winners'));
        if (snap.exists()) {
          const list = Object.values(snap.val()) as Winner[];
          list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setWinners(list);
        }
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  const getIconForRank = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('1st') || lowerRank.includes('champion')) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (lowerRank.includes('2nd') || lowerRank.includes('runner')) return <Medal className="w-8 h-8 text-gray-300" />;
    if (lowerRank.includes('3rd')) return <Medal className="w-8 h-8 text-amber-700" />;
    return <Sparkles className="w-8 h-8 text-cyan-400" />;
  };

  const getColorForRank = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('1st') || lowerRank.includes('champion')) return "from-yellow-400 to-yellow-600";
    if (lowerRank.includes('2nd') || lowerRank.includes('runner up')) return "from-gray-300 to-gray-500";
    if (lowerRank.includes('3rd')) return "from-amber-600 to-amber-800";
    return "from-cyan-400 to-blue-600";
  };

  const getShadowForRank = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('1st') || lowerRank.includes('champion')) return "shadow-[0_0_40px_rgba(250,204,21,0.4)]";
    if (lowerRank.includes('2nd') || lowerRank.includes('runner up')) return "shadow-[0_0_30px_rgba(209,213,219,0.3)]";
    if (lowerRank.includes('3rd')) return "shadow-[0_0_30px_rgba(180,83,9,0.3)]";
    return "shadow-[0_0_30px_rgba(34,211,238,0.3)]";
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-yellow-300 selection:text-black overflow-x-hidden">
      <Navbar />

      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-20 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="uppercase tracking-widest text-sm font-bold text-neutral-300 font-sans">VibeForge 1.0 Hall of Fame</span>
            <Star className="w-5 h-5 text-yellow-300" />
          </div>
          <h1
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 mb-6 drop-shadow-2xl"
            style={{ fontFamily: 'var(--font-casual-passion), sans-serif' }}
          >
            THE CHAMPIONS
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 leading-relaxed font-sans">
            A massive congratulations to the brilliant minds who conquered the ultimate quest!
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-yellow-300 animate-spin" />
          </div>
        ) : winners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900/50 backdrop-blur-xl ${getShadowForRank(winner.rank)} group`}
              >
                {/* Animated Gradient Border */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${getColorForRank(winner.rank)}`} />

                <div className="p-6 sm:p-8 flex flex-col h-full">
                  {/* Header: Award Title & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs sm:text-sm uppercase tracking-widest text-neutral-400 mb-1 font-sans">{winner.rank}</p>
                      {/* Fixed font to font-sans to prevent Orbitron weird rendering on numbers/hyphens */}
                      <h2 className={`text-2xl sm:text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r ${getColorForRank(winner.rank)} font-sans`}>
                        {winner.title}
                      </h2>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      {getIconForRank(winner.rank)}
                    </div>
                  </div>

                  {/* Image Frame */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 border border-white/5 bg-black/50">
                    <img
                      src={winner.imageUrl}
                      alt={winner.teamName}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Team Details */}
                  <div className="mt-auto space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-wide font-sans">{winner.teamName}</h3>
                      <p className="text-sm text-cyan-400 mt-1 font-sans">{winner.college}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2 font-sans">Team Roster</p>
                      <div className="flex flex-wrap gap-2">
                        {winner.members?.map((member, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-medium bg-white/5 border border-white/10 rounded-full text-neutral-300 font-sans">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl mx-auto p-12 text-center border border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-md"
          >
            <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-wider font-sans">
              Results Pending!
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed font-sans">
              The epic hackathon concludes soon, and the legendary champions are yet to be crowned.
              Keep grinding, keep coding, and stay tuned!
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default WinnersPage;
