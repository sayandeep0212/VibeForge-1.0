'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data.isLoggedIn) {
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response. Please check your terminal for errors.');
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300/3 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/3 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(253,224,71,0.08)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-300/10 rounded-2xl border border-yellow-300/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-300" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              ADMIN <span className="text-red-400">ACCESS</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">VIBEFORGE 1.0 Control Panel</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                disabled={loading}
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                disabled={loading}
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-3 rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(253,224,71,0.4)] mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ACCESS PANEL'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
