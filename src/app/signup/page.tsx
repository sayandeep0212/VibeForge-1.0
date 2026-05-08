'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  const handleRedirect = () => {
    router.push('/profile/setup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      handleRedirect();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(firebaseError.message || 'Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      handleRedirect();
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGitHub();
      handleRedirect();
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || 'Failed to sign up with GitHub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />

      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="fixed top-24 sm:top-0 left-0 w-full h-[55vh] sm:h-full z-0 pointer-events-none">
          <img 
            src="/backgrounds/signup.png" 
            alt="Auth Background" 
            className="w-full h-full object-cover object-center opacity-80 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 pt-32 pb-20 w-full max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(253,224,71,0.1)] relative overflow-hidden">
              {/* Ambient glows inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300/10 blur-[50px] rounded-full pointer-events-none" />
              
              <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 text-center">
                CREATE <span className="text-red-400">ACCOUNT</span>
              </h1>
              <p className="text-neutral-400 text-center mb-8 text-sm">Join the ranks for VibeForge 1.0</p>

              {/* Error Display */}
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
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    disabled={loading}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
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
                    placeholder="Password (min 6 characters)"
                    disabled={loading}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-3 rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(253,224,71,0.4)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SIGN UP'}
                </button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-xs text-neutral-500 font-bold tracking-widest">OR</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium tracking-wide transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </button>
                
                <button 
                  onClick={handleGitHubSignUp}
                  disabled={loading}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium tracking-wide transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white group-hover:text-yellow-300 transition-colors">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign up with GitHub
                </button>
              </div>

              <p className="text-center text-sm text-neutral-500 mt-8">
                Already a warrior?{' '}
                <Link href="/signin" className="text-white hover:text-yellow-300 font-bold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
