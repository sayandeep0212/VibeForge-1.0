'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Shield, Users, Trophy } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface EventPassProps {
  passId: string;
  bookingId?: string;
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

export default function EventPass({ 
  passId, 
  bookingId, 
  teamName, 
  type, 
  members, 
  leaderName 
}: EventPassProps) {
  const passRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!passRef.current) return;
    try {
      // Small delay to ensure any pending renders are settled
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await htmlToImage.toPng(passRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        skipFonts: false,
        cacheBust: true,
        // Force the element to be captured at its intended size
        style: {
          width: '500px',
          height: '700px',
          transform: 'none',
          margin: '0',
        }
      });
      
      const link = document.createElement('a');
      link.download = `VibeForge_Pass_${teamName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating pass image:', err);
      alert('Failed to download pass. Please try using a screenshot instead.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-300" />
          Official Event Pass
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all"
        >
          <Download className="w-4 h-4" /> Download Pass
        </button>
      </div>

      <div
        className="relative w-full max-w-[500px] mx-auto aspect-[3/4.2] overflow-hidden rounded-[2rem] shadow-2xl bg-black"
        ref={passRef}
        id="event-pass-card"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/media/eventpass.png')" }}
        />

        {/* QR Code Area (Top Left White Box) */}
        <div className="absolute top-[8.5%] left-[5.5%] w-[33.5%] aspect-square bg-white flex items-center justify-center p-[2%] rounded-lg">
          <QRCodeSVG 
            value={bookingId || passId} 
            size={512}
            level="H"
            includeMargin={false}
            className="w-full h-full"
          />
        </div>

        {/* Left Side Content - Labels Area */}
        <div className="absolute left-[14.5%] top-[44.5%] w-[28%] space-y-[10.5%]">
          {/* Team Name */}
          <div className="h-[7%] flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-tighter opacity-0">TEAM NAME</p>
            <p className="text-[16px] font-black text-white truncate drop-shadow-lg leading-tight">
              {teamName}
            </p>
          </div>

          {/* Team ID */}
          <div className="h-[7%] flex flex-col justify-center mt-[22%]">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-tighter opacity-0">TEAM ID</p>
            <p className="text-[13px] font-mono font-bold text-white truncate drop-shadow-lg leading-tight">
              {bookingId || passId}
            </p>
          </div>

          {/* Team Captain */}
          <div className="h-[7%] flex flex-col justify-center mt-[22%]">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-tighter opacity-0">TEAM CAPTAIN</p>
            <p className="text-[16px] font-black text-white truncate drop-shadow-lg leading-tight mt-[3px]">
              {leaderName}
            </p>
          </div>

          {/* Members */}
          <div className="h-[7%] flex flex-col justify-center mt-[22%]">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-tighter opacity-0">MEMBERS</p>
            <p className="text-[16px] font-black text-white drop-shadow-lg leading-tight mt-[3px]">
              {members?.length || 1} {members?.length === 1 ? 'PERSON' : 'PEOPLE'}
            </p>
          </div>
        </div>

        {/* Bottom Status (Optional Overlay) */}
        <div className="absolute top-[2%] right-[5%] flex items-center gap-1 px-3 py-1 bg-black/60 border border-green-500/40 rounded-full scale-75 origin-right">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-green-400 text-[10px] font-black uppercase tracking-wider">Verified Pass</span>
        </div>
      </div>
    </div>
  );
}
