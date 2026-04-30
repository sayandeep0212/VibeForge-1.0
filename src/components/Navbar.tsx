'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sword, Zap, Ghost } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
    { name: 'Schedule', href: '/#schedule' },
    { name: 'Team', href: '/team' },
    { name: 'Sponsors', href: '/#sponsors' },
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
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: 3 Logos */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="p-2 bg-red-600/20 rounded-lg border border-red-500/30"
              >
                <Sword className="w-5 h-5 text-red-500" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-white/5 rounded-lg border border-white/10"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-2 bg-red-600/20 rounded-lg border border-red-500/30"
              >
                <Ghost className="w-5 h-5 text-red-500" />
              </motion.div>
              <div className="ml-2 hidden sm:block">
                <span className="text-xl font-black tracking-tighter italic text-white">GAMELIMINALS</span>
              </div>
            </div>

            {/* Right: Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-widest uppercase transition-colors relative group ${
                    pathname === link.href ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-600 transition-all ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                REGISTER
              </button>
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
                  className={`text-lg font-bold tracking-[0.2em] uppercase transition-colors ${
                    pathname === link.href ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              <button className="bg-red-600 text-white py-4 rounded-xl font-bold tracking-widest">
                LOGIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
