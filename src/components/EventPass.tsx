'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Loader2, Info } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface EventPassProps {
  teamName: string;
  leaderName: string;
  bookingId: string;
  passId: string;
  type: 'individual' | 'team';
  members: any[];
}

const EventPass: React.FC<EventPassProps> = ({
  teamName,
  leaderName,
  bookingId,
  passId,
  type,
  members
}) => {
  const passRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(passRef.current, {
        pixelRatio: 3,
        quality: 1,
      });

      const link = document.createElement('a');
      link.download = `VibeForge-Pass-${bookingId || passId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating pass image:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl max-w-md">
        <Info className="w-5 h-5 text-blue-400 shrink-0" />
        <p className="text-blue-200 text-xs leading-relaxed">
          Your official event pass is ready. Show this QR code at the entry gate for check-in.
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        {downloading ? 'GENERATING...' : 'SAVE TO GALLERY'}
      </button>

      {/* Actual Pass for Capture */}
      <div
        ref={passRef}
        className="relative w-[400px] h-[560px] bg-black overflow-hidden select-none"
      >
        {/* Physical Card Background */}
        <img
          src="/media/eventpass.png"
          alt="Event Pass Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* QR Code Container - Matches Reference Image Exactly */}
        <div className="absolute left-[6%] top-[10%] w-[30%] aspect-square bg-white p-[6px] rounded-[5px]">
          <QRCodeSVG
            value={bookingId || passId}
            size={512}
            level="H"
            includeMargin={false}
            className="w-full h-full"
          />
        </div>

        {/* Dynamic Values Overlay - Mapped to your visual guide */}
        <div className="absolute left-[14.5%] top-[42.2%] w-[32%]">
          {/* Team Name Slot */}
          <div className="h-[48px] flex flex-col justify-end pb-1">
            <p className="text-white text-[12.5px] font-black uppercase tracking-tight leading-none drop-shadow-lg truncate">
              {teamName}
            </p>
          </div>

          {/* Team ID Slot */}
          <div className="h-[48px] mt-[4px] flex flex-col justify-end pb-1">
            <p className="text-white text-[12px] font-bold font-mono tracking-widest leading-none drop-shadow-lg truncate">
              {bookingId || passId}
            </p>
          </div>

          {/* Team Captain Slot */}
          <div className="h-[55px] mt-[7px] flex flex-col justify-end pb-1">
            <p className="text-white text-[12.5px] font-black uppercase tracking-tight leading-none drop-shadow-lg truncate">
              {leaderName}
            </p>
          </div>

          {/* Members Slot */}
          <div className="h-[50px] mt-[7px] flex flex-col justify-end pb-1">
            <p className="text-white text-[12.5px] font-black uppercase tracking-tight leading-none drop-shadow-lg">
              {type === 'team' ? `${members?.length || 1} MEMBERS` : '1 MEMBER'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPass;
