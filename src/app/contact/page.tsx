'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Send, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollBackground from '@/components/ScrollBackground';
import ThreeOverlay from '@/components/ThreeOverlay';

const ContactPage = () => {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-red-500 selection:text-white overflow-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Background Layers */}
      <ScrollBackground />
      <ThreeOverlay />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 italic">
              CONTACT <span className="text-red-600 text-shadow-glow">US</span>
            </h1>
            <p className="text-xl text-neutral-400 tracking-[0.5em] uppercase">The Ninja Network</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: Info */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-12"
            >
              {/* Coordinators Section */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <User className="w-6 h-6" /> Student Coordinators
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="font-bold">Rahul Sharma</p>
                      <p className="text-neutral-400 text-sm">+91 98765 43210</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="font-bold">Priya Das</p>
                      <p className="text-neutral-400 text-sm">+91 87654 32109</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <User className="w-6 h-6" /> Event Coordinators
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="font-bold">Amit Patel</p>
                      <p className="text-neutral-400 text-sm">+91 76543 21098</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <p className="font-bold">Sneha Roy</p>
                      <p className="text-neutral-400 text-sm">+91 65432 10987</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600 rounded-lg"><MapPin className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Venue Location</p>
                    <p className="text-neutral-400">Adamas University, Barasat, West Bengal, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600 rounded-lg"><Mail className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Official Email</p>
                    <p className="text-neutral-400">ADAMASGAMINGCLUB@GMAIL.COM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600 rounded-lg"><Globe className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Main Club Website</p>
                    <a href="https://gameliminals.vercel.app" target="_blank" className="text-red-500 hover:underline">gameliminals.vercel.app</a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-black/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
                
                <h2 className="text-3xl font-black mb-8 italic italic tracking-tight">SEND A MESSAGE</h2>
                
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="ninja@shadow.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Message</label>
                    <textarea 
                      rows={5}
                      placeholder="How can we help you on your quest?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600 transition-all resize-none"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-lg tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 transition-all"
                  >
                    SEND MESSAGE <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ContactPage;
