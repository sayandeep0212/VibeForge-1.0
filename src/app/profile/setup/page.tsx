'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, GraduationCap, Building2, Hash, Camera,
  AlertCircle, Loader2, CheckCircle, BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { uploadToImgBB } from '@/lib/imgbb';
import { nanoid } from 'nanoid';

export default function ProfileSetupPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [otherCollege, setOtherCollege] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [year, setYear] = useState('');
  const [program, setProgram] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [adamasRegPrefix] = useState('AU/');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-fill from Firebase Auth user
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || '');
      setPhotoPreview(user.photoURL || '');
    }
  }, [user]);

  // If profile already completed, redirect
  useEffect(() => {
    if (userProfile?.profileComplete) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB.');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUID = (): string => {
    const id = nanoid(6).toUpperCase();
    return `GL-${id}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in.');
      return;
    }

    if (!college) {
      setError('Please select your college.');
      return;
    }

    if (college === 'Adamas University' && (registrationNumber.trim() === '' || registrationNumber.trim() === 'AU/')) {
      setError('Please enter your complete Adamas University registration number.');
      return;
    }

    if (college === 'Other' && !otherCollege.trim()) {
      setError('Please enter your college name.');
      return;
    }

    // Block typing "Adamas" in Other college field
    if (college === 'Other' && otherCollege.trim().toLowerCase().includes('adamas')) {
      setError('If you are from Adamas University, please select "Adamas University" from the dropdown instead of typing it.');
      return;
    }

    if (!year) {
      setError('Please select your year.');
      return;
    }

    if (!program.trim()) {
      setError('Please enter your program.');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Starting profile submission...');

    try {
      // Check for duplicate phone/registration number via secure server-side API
      const duplicateRes = await fetch('/api/profile/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          registrationNumber: college === 'Adamas University' ? registrationNumber.trim() : undefined,
          currentUserId: user.uid,
        }),
      });
      const duplicateData = await duplicateRes.json();
      if (duplicateData.duplicate) {
        setError(duplicateData.message);
        setLoading(false);
        return;
      }

      // Upload profile picture if a new file was selected
      let finalPhotoURL = photoURL;
      if (photoFile) {
        console.log('Uploading photo...');
        finalPhotoURL = await uploadToImgBB(photoFile);
      }

      // Generate a longer, high-entropy UID to ensure uniqueness without a DB check
      // nanoid(10) has 22 trillion+ combinations, safe for this scale
      const publicUID = `GL-${nanoid(10).toUpperCase()}`;
      console.log('Generated Public UID:', publicUID);

      const collegeName = college === 'Adamas University' ? 'Adamas University' : otherCollege;

      const profileData = {
        uid: publicUID,
        name: name.trim(),
        email: email.trim(),
        photoURL: finalPhotoURL,
        college: collegeName,
        isAdamas: college === 'Adamas University',
        registrationNumber: registrationNumber.trim(),
        year,
        program: program.trim(),
        phone: phone.trim(),
        profileComplete: true,
        createdAt: Date.now(),
      };

      console.log('Saving to database path:', `users/${user.uid}`);
      if (!db) throw new Error('Database not initialized');
      
      // Perform the save
      await set(ref(db, `users/${user.uid}`), profileData);
      console.log('Save successful!');

      // Refresh profile and redirect
      await refreshProfile();
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('CRITICAL SUBMISSION ERROR:', err);
      // Detailed error message for the user
      let friendlyError = 'Failed to save profile. ';
      if (err.code === 'PERMISSION_DENIED') {
        friendlyError += 'Permission denied. Please log in again.';
      } else if (err.message?.includes('network')) {
        friendlyError += 'Network error. Check your connection.';
      } else {
        friendlyError += err.message || 'Unknown error occurred.';
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />

      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          {/* Desktop Background */}
          <img 
            src="/backgrounds/signinbgpc.png" 
            alt="Profile Setup Background PC" 
            className="hidden md:block w-full h-full object-cover object-center opacity-85 brightness-90"
          />
          {/* Mobile Background */}
          <img 
            src="/backgrounds/signinbgphone.png" 
            alt="Profile Setup Background Phone" 
            className="block md:hidden w-full h-full object-cover object-top opacity-85 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <div className="relative z-10 pt-32 pb-20 w-full max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(253,224,71,0.08)] relative overflow-hidden">
              {/* Ambient glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-300/8 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full pointer-events-none" />

              <h1 className="text-3xl font-black italic tracking-tighter text-white mb-2 text-center">
                COMPLETE YOUR <span className="text-red-400">PROFILE</span>
              </h1>
              <p className="text-neutral-400 text-center mb-8 text-sm">
                Fill in your details to get your unique Warrior ID
              </p>

              {/* Success State */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Profile Created!</h2>
                  <p className="text-neutral-400 text-sm">Redirecting to your dashboard...</p>
                </motion.div>
              )}

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

              {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-yellow-300/50 transition-colors cursor-pointer group overflow-hidden"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Camera className="w-8 h-8 text-neutral-500 group-hover:text-yellow-300 transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-neutral-500 text-xs mt-2">Click to upload photo (max 5MB)</p>
                  </div>

                  {/* Name (auto-filled) */}
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
                    {user?.displayName && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-400/60 uppercase tracking-wider">Auto-filled</span>
                    )}
                  </div>

                  {/* Email (auto-filled, readonly) */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full bg-black/30 border border-white/5 text-neutral-400 rounded-xl py-3 pl-12 pr-4 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-400/60 uppercase tracking-wider">Auto-filled</span>
                  </div>

                  {/* College Dropdown */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <select
                      required
                      value={college}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCollege(val);
                        if (val === 'Adamas University') {
                          setRegistrationNumber('AU/');
                        } else {
                          setRegistrationNumber('');
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-black text-neutral-600">Select College</option>
                      <option value="Adamas University" className="bg-black">Adamas University</option>
                      <option value="Other" className="bg-black">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Adamas Registration Number */}
                  {college === 'Adamas University' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                        <Hash className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={registrationNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith(adamasRegPrefix)) {
                            setRegistrationNumber(val);
                          } else if (val.length < adamasRegPrefix.length) {
                            setRegistrationNumber(adamasRegPrefix);
                          }
                        }}
                        placeholder="Registration Number (e.g., 2025/0001123)"
                        disabled={loading}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50 font-mono"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-yellow-300/50 uppercase tracking-widest font-bold">Fixed Prefix</span>
                    </motion.div>
                  )}

                  {/* Other College Name */}
                  {college === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={otherCollege}
                        onChange={(e) => setOtherCollege(e.target.value)}
                        placeholder="Enter your College Name"
                        disabled={loading}
                        className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
                      />
                    </motion.div>
                  )}

                  {/* Year Dropdown */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      disabled={loading}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-black text-neutral-600">Select Year</option>
                      <option value="1st Year" className="bg-black">1st Year</option>
                      <option value="2nd Year" className="bg-black">2nd Year</option>
                      <option value="3rd Year" className="bg-black">3rd Year</option>
                      <option value="4th Year" className="bg-black">4th Year</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Program */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      placeholder="Program (e.g., B.Tech CSE)"
                      disabled={loading}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      disabled={loading}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-3 rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(253,224,71,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        SAVING...
                      </>
                    ) : (
                      'SUBMIT & GET YOUR UID'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
