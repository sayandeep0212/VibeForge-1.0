'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Trophy } from 'lucide-react';

interface EventPassProps {
  passId: string;
  teamName: string;
  type: 'individual' | 'team';
  members: Array<{
    firebaseId: string;
    uid: string;
    name: string;
    email: string;
  }>;
  leaderName: string;
}

export default function EventPass({ passId, teamName, type, members, leaderName }: EventPassProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-yellow-300/10 via-black to-red-500/10 backdrop-blur-xl border border-yellow-300/20 rounded-3xl p-6 relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-red-400 to-yellow-300" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-300/5 blur-[50px] rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/5 blur-[50px] rounded-full" />

      {/* Pass Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-300" />
          <span className="text-lg font-black italic tracking-tighter text-white">
            EVENT <span className="text-yellow-300">PASS</span>
          </span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Approved</span>
        </div>
      </div>

      {/* Pass ID */}
      <div className="text-center mb-6">
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Pass ID</p>
        <p className="text-3xl font-black font-mono text-yellow-300 tracking-widest drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]">
          {passId}
        </p>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

      {/* Team Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Team Name</p>
          <p className="text-white font-bold">{teamName}</p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Type</p>
          <p className="text-white font-bold capitalize flex items-center gap-1">
            {type === 'team' ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {type}
          </p>
        </div>
      </div>

      {/* Members */}
      {members && members.length > 0 && (
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
            {type === 'team' ? 'Team Members' : 'Participant'}
          </p>
          <div className="space-y-2">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2 px-3">
                <span className="text-white text-sm">{member.name}</span>
                <span className="text-yellow-300/60 text-xs font-mono">{member.uid}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-neutral-600 text-xs tracking-widest uppercase">VIBEFORGE 1.0 • GameLiminals</p>
      </div>
    </motion.div>
  );
}
