'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Utensils, Check } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface FoodCouponProps {
  userName: string;
  userUid: string;
}

export default function FoodCoupon({ userName, userUid }: FoodCouponProps) {
  const couponRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!couponRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(couponRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        width: 1000,
        height: 500,
        style: {
          width: '1000px',
          height: '500px',
          transform: 'none',
        }
      });
      
      const link = document.createElement('a');
      link.download = `food-coupon-${userUid}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error('Error downloading coupon:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Coupon Preview Container */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div 
          ref={couponRef}
          className="relative w-full aspect-[2/1] min-h-[200px] overflow-hidden bg-neutral-900 flex items-center justify-center"
        >
          {/* Background Image */}
          <img 
            src="/media/foodcoupon.png" 
            alt="Coupon Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark Overlay for Readability if needed (Subtle) */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Dynamic Content Overlays - Positioned at Bottom Right per user request */}
          <div className="absolute bottom-6 right-8 md:bottom-10 md:right-12 text-right z-10 pointer-events-none">
            <div className="space-y-0">
              <p className="text-white text-xl md:text-3xl font-black uppercase tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight">
                {userName}
              </p>
              <p className="text-white/90 font-mono text-[10px] md:text-lg font-bold tracking-[0.2em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                UID : {userUid}
              </p>
            </div>
          </div>

          {/* Security Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold tracking-widest text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            DOWNLOAD NOW
          </button>
        </div>
      </div>

      {/* Download Action for Mobile/Static */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${
            downloaded 
              ? 'bg-green-500 text-white' 
              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
          }`}
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              GENERATING COUPON...
            </>
          ) : downloaded ? (
            <>
              <Check className="w-4 h-4" />
              COUPON DOWNLOADED
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              DOWNLOAD FOOD COUPON (PNG)
            </>
          )}
        </button>
        
        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest text-center sm:text-left">
          * This coupon is unique to your UID. Do not share.
        </p>
      </div>
    </div>
  );
}
