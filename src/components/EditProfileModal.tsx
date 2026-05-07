'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, Building2, GraduationCap, BookOpen, 
  Hash, Camera, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { uploadToImgBB } from '@/lib/imgbb';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  college: string;
  isAdamas: boolean;
  registrationNumber?: string;
  year: string;
  program: string;
  phone: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  firebaseUid: string;
  onSuccess: () => void;
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  profile, 
  firebaseUid,
  onSuccess 
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [college, setCollege] = useState(profile.isAdamas ? 'Adamas University' : 'Other');
  const [otherCollege, setOtherCollege] = useState(!profile.isAdamas ? profile.college : '');
  const [registrationNumber, setRegistrationNumber] = useState(profile.registrationNumber || '');
  const [year, setYear] = useState(profile.year);
  const [program, setProgram] = useState(profile.program);
  const [photoPreview, setPhotoPreview] = useState(profile.photoURL);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [adamasRegPrefix] = useState('AU/');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalPhotoURL = profile.photoURL;
      if (photoFile) {
        finalPhotoURL = await uploadToImgBB(photoFile);
      }

      const collegeName = college === 'Adamas University' ? 'Adamas University' : otherCollege;

      const updates: any = {
        name: name.trim(),
        phone: phone.trim(),
        college: collegeName,
        isAdamas: college === 'Adamas University',
        year,
        program: program.trim(),
        photoURL: finalPhotoURL,
        updatedAt: Date.now(),
      };

      if (college === 'Adamas University') {
        updates.registrationNumber = registrationNumber.trim();
      }

      await update(ref(db!, `users/${firebaseUid}`), updates);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-8 overflow-y-auto max-h-[90vh] shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black italic tracking-tighter text-white mb-6">
          EDIT <span className="text-red-400">PROFILE</span>
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div className="flex flex-col items-center mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-yellow-300/50 transition-colors cursor-pointer group overflow-hidden"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-neutral-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
            <p className="text-neutral-500 text-[10px] mt-2 uppercase tracking-widest">Update Photo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="relative group col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
              />
            </div>

            {/* Phone */}
            <div className="relative group col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
              />
            </div>

            {/* College */}
            <div className="relative group col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm appearance-none"
              >
                <option value="Adamas University">Adamas University</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {college === 'Other' && (
              <div className="relative group col-span-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={otherCollege}
                  onChange={(e) => setOtherCollege(e.target.value)}
                  placeholder="College Name"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
                />
              </div>
            )}

            {college === 'Adamas University' && (
              <div className="relative group col-span-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => {
                    if (e.target.value.startsWith(adamasRegPrefix)) {
                      setRegistrationNumber(e.target.value);
                    }
                  }}
                  placeholder="Registration Number"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm font-mono"
                />
              </div>
            )}

            {/* Year */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <GraduationCap className="w-4 h-4" />
              </div>
              <select
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm appearance-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Program */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="Program"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-3 rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                UPDATING...
              </>
            ) : (
              'SAVE CHANGES'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
