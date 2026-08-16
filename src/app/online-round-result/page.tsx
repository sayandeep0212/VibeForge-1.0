"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import teamsData from "@/data/teams.json";

export default function OnlineRoundResultPage() {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Target date: August 17, 2026 19:30:00 IST
  const targetDate = new Date("2026-08-17T19:30:00+05:30").getTime();

  useEffect(() => {
    setIsClient(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft(null); // Time is up
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isClient) return null; // Hydration fix

  const showResults = timeLeft === null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 pb-16 relative overflow-hidden font-sans">
      {/* Background hexagon or subtle grid can go here if needed */}
      <div className="absolute inset-0 bg-[url('/images/hexagon-pattern.png')] bg-repeat opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Banner Section */}
        <div className="w-full max-w-5xl mx-auto mb-16 relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,100,0,0.2)] border border-orange-500/20">
          {/* Decorative Corner Borders for Banner */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-xl z-10" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500 rounded-br-xl z-10" />
          
          <Image
            src="/images/online-round.png"
            alt="Online Round Banner"
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto">
          
          {!showResults ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 bg-[#0a0a0a] border border-cyan-500/30 rounded-2xl relative shadow-[0_0_30px_rgba(0,255,255,0.1)]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
              
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Phase One Results
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-medium tracking-widest uppercase">
                Revealing in
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8 px-2">
                {[
                  { label: "Days", value: timeLeft?.days },
                  { label: "Hours", value: timeLeft?.hours },
                  { label: "Minutes", value: timeLeft?.minutes },
                  { label: "Seconds", value: timeLeft?.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 bg-black border border-cyan-500/40 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,255,255,0.15)] mb-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 border-b border-white/10" />
                      <span className="text-3xl sm:text-4xl md:text-6xl font-black text-white z-10 font-mono tracking-tighter">
                        {item.value?.toString().padStart(2, "0") || "00"}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm text-cyan-400 uppercase tracking-widest font-semibold">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-12">
                <div className="h-px bg-cyan-900 flex-grow" />
                <h3 className="px-6 text-cyan-400 tracking-[0.2em] uppercase text-sm font-bold flex items-center gap-3">
                  <span className="text-cyan-400">+</span>
                  SELECTED
                  <span className="text-cyan-400">+</span>
                </h3>
                <div className="h-px bg-cyan-900 flex-grow" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamsData.map((team: any, index: number) => (
                  <div 
                    key={index} 
                    className="relative bg-[#080808] border border-cyan-900/50 rounded-xl p-6"
                  >
                    {/* Corner decorative borders */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br-lg" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-cyan-800 text-sm font-mono font-bold">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-700/80 bg-cyan-950/30">
                        <Check size={14} className="text-cyan-400" />
                        <span className="text-cyan-400 text-[10px] font-bold tracking-wider uppercase">
                          Selected
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-orbitron font-bold text-white uppercase tracking-wide truncate">
                        {team.teamName}
                      </h4>
                      
                      {/* Members List */}
                      {team.members && team.members.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-white/5 flex flex-wrap gap-1">
                          <p className="w-full text-[10px] text-cyan-600 uppercase mb-1 font-semibold">Members</p>
                          {team.members.map((m: string, i: number) => (
                            <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300 whitespace-nowrap">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
