'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, ArrowRight, Github, 
  ShieldCheck, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name);
      router.push('/profile/setup');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setError('');
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGitHub();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <main className="min-h-screen bg-black flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/backgrounds/auth-bg.jpg" 
          alt="Background" 
          fill 
          className="object-cover opacity-40 brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-2xl font-black italic tracking-tighter text-white">
                VIBE<span className="text-red-500">FORGE</span>
              </h1>
            </Link>
            <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">Join the Forge</h2>
            <p className="text-neutral-500 text-sm mt-2">Create your warrior profile today</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-yellow-300 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-yellow-300 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  placeholder="warrior@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-yellow-300 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-300/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-[0_0_30px_rgba(253,224,71,0.2)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  SIGN UP NOW
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#0a0a0a] px-4 text-neutral-600 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialSignIn('google')}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-2xl transition-all"
            >
              <Image src="/icons/google.svg" width={18} height={18} alt="Google" />
              <span className="text-white text-sm font-bold">Google</span>
            </button>
            <button
              onClick={() => handleSocialSignIn('github')}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-2xl transition-all"
            >
              <Github className="w-[18px] h-[18px] text-white" />
              <span className="text-white text-sm font-bold">GitHub</span>
            </button>
          </div>

          <p className="text-center mt-8 text-neutral-500 text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="text-yellow-300 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            SECURE ACCESS
          </div>
          <div className="w-1 h-1 bg-neutral-800 rounded-full" />
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED FORGE
          </div>
        </div>
      </div>
    </main>
  );
}
