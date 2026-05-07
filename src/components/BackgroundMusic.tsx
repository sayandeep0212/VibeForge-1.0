'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundMusicProps {
  audioUrl: string;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();

  // Remove music player from admin panel
  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Prevent creating multiple audio instances if component re-renders
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Default volume (30%)
    } else {
      audioRef.current.src = audioUrl; // Update src if audioUrl prop changes
    }

    const audio = audioRef.current;

    // Try to auto-play (browsers often block this without interaction)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Auto-play prevented by browser. Wait for user interaction.
          setIsPlaying(false);
          
          const handleInteraction = () => {
            if (audio && audio.paused) {
              audio.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.log("Audio play failed:", e));
              
              // Remove listeners after first interaction
              document.removeEventListener('click', handleInteraction);
              document.removeEventListener('keydown', handleInteraction);
            }
          };
          
          document.addEventListener('click', handleInteraction);
          document.addEventListener('keydown', handleInteraction);
          
          return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
          };
        });
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audioUrl]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Could not play audio", e));
      }
    }
  };

  return (
    <div 
      className="fixed bottom-10 left-10 z-[100]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleMute}
        className={`relative p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${isPlaying ? 'bg-neutral-900/80 backdrop-blur-md' : 'bg-red-900/80 backdrop-blur-md'}`}
        title={isPlaying ? "Mute Music" : "Play Music"}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-red-500" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
        
        {/* Pulsing ring when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping" />
        )}
      </motion.button>
      
      {/* Tooltip to show status to the user */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            className="absolute left-16 top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-md border border-white/10"
          >
            {isPlaying ? "Music Playing" : "Music Paused"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackgroundMusic;
