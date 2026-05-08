'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Send, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ref, push, set } from 'firebase/database';
import { getDb } from '@/lib/firebase';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const inquiryRef = ref(getDb(), 'inquiries');
      const newInquiryRef = push(inquiryRef);
      await set(newInquiryRef, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        status: 'new',
        createdAt: Date.now()
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-yellow-300 selection:text-black overflow-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Background Image */}
      <div className="fixed top-24 sm:top-0 left-0 w-full h-[55vh] sm:h-full z-0 pointer-events-none">
        <img 
          src="/backgrounds/contactbg.png" 
          alt="Contact Background" 
          className="w-full h-full object-cover object-center opacity-80 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
      <div className="relative z-20 pt-32 pb-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 italic text-yellow-300">
              CONTACT <span className="text-red-400 text-shadow-glow">US</span>
            </h1>
            <p className="text-sm sm:text-xl text-neutral-400 tracking-[0.5em] uppercase">The Ninja Network</p>
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
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2 sm:gap-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" /> <span className="text-yellow-300">Student</span> <span className="text-white">Coordinators</span>
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
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2 sm:gap-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" /> <span className="text-yellow-300">Event</span> <span className="text-white">Coordinators</span>
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
                  <div className="p-3 bg-red-400 rounded-lg"><MapPin className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Venue Location</p>
                    <p className="text-neutral-400">Adamas University, Barasat, West Bengal, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-400 rounded-lg"><Mail className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Official Email</p>
                    <p className="text-neutral-400">ADAMASGAMINGCLUB@GMAIL.COM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-400 rounded-lg"><Globe className="w-5 h-5 text-white" /></div>
                  <div>
                    <p className="font-bold uppercase tracking-wider">Main Club Website</p>
                    <a href="https://gameliminals.vercel.app" target="_blank" className="text-yellow-300 hover:underline">gameliminals.vercel.app</a>
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
                
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-neutral-400 mb-8">We've received your inquiry and will get back to you soon.</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="text-yellow-300 font-bold tracking-widest hover:underline uppercase text-sm"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Your Name</label>
                      <div className="relative group/input">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within/input:text-yellow-300 transition-colors" />
                        <input 
                          type="text" 
                          required
                          placeholder="What should we call you?"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-yellow-300 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group/input">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within/input:text-yellow-300 transition-colors" />
                        <input 
                          type="email" 
                          required
                          placeholder="ninja@shadow.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-yellow-300 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Message</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="How can we help you on your quest?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-300 transition-all resize-none disabled:opacity-50"
                      />
                    </div>

                    <motion.button 
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-5 rounded-2xl font-black text-lg tracking-widest shadow-[0_0_30px_rgba(253,224,71,0.3)] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>SEND MESSAGE <Send className="w-5 h-5" /></>
                      )}
                    </motion.button>
                  </form>
                )}
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
