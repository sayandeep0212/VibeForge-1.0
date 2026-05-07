'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sword, Zap, Ghost, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Safely try to access auth context (may not be available on admin pages)
  let authData: { user: { photoURL: string | null; displayName: string | null } | null; userProfile: { photoURL: string; name: string } | null } | null = null;
  try {
    authData = useAuth();
  } catch {
    // Auth context not available (e.g., on admin pages without provider)
  }

  const user = authData?.user || null;
  const userProfile = authData?.userProfile || null;

  // Handle scroll for navbar background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Team', href: '/team' },
    { name: 'Sponsors', href: '/sponsors' },
    { name: 'Contact us', href: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-500 ${scrolled ? 'shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]' : ''
          }`}>
          {/* Glassy Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: 3 Logos */}
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/logo.png" alt="Logo 1" className="w-full h-full object-contain" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/au_logo.jpg" alt="Logo 2" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10"
              >
                <img src="/Logos/acm.jpeg" alt="Logo 3" className="w-full h-full object-cover" />
              </motion.div>
              <div className="ml-2 hidden lg:block">
                <span className="text-xl font-heading tracking-tighter italic text-white">GAMELIMINALS</span>
              </div>
            </div>

            {/* Right: Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-widest uppercase transition-colors relative group ${pathname === link.href ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-300 transition-all ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              ))}

              {/* Auth Section */}
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-300/30 group-hover:border-yellow-300/60 transition-colors">
                    {(userProfile?.photoURL || user.photoURL) ? (
                      <img
                        src={userProfile?.photoURL || user.photoURL || ''}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-yellow-300/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-yellow-300/50" />
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <Link href="/signup" className="bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black px-6 py-2 rounded-full font-bold text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(253,224,71,0.3)]">
                  SIGN UP
                </Link>
              )}
            </div>

            {/* Mobile: Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-6 right-6 mt-4 p-6 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl md:hidden z-50 shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-bold tracking-[0.2em] uppercase transition-colors ${pathname === link.href ? 'text-yellow-300' : 'text-neutral-400 hover:text-yellow-300'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black text-center py-4 rounded-xl font-bold tracking-widest uppercase"
                >
                  DASHBOARD
                </Link>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black text-center py-4 rounded-xl font-bold tracking-widest uppercase"
                >
                  SIGN UP
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
