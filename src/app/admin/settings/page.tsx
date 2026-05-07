'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Mail, Phone, Lock, Camera, UserPlus,
  AlertCircle, CheckCircle, Loader2, Shield
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface AdminSession {
  id: string;
  email: string;
  name: string;
  phone: string;
  photoURL: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Add admin states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminSuccess, setAddAdminSuccess] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }
        setAdminSession(data.user);
        setProfileName(data.user.name || '');
        setProfilePhone(data.user.phone || '');
        setProfilePhoto(data.user.photoURL || '');
      })
      .catch(() => {
        router.push('/admin');
      });
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    if (!adminSession) return;
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      let finalPhoto = adminSession.photoURL || '';
      if (photoFile) {
        finalPhoto = await uploadToImgBB(photoFile);
      }

      const res = await fetch('/api/admin/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim(),
          photoURL: finalPhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setAdminSession(data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!adminSession) return;
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    setAddAdminError('');
    setAddAdminSuccess(false);

    if (!newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) {
      setAddAdminError('All fields are required.');
      return;
    }

    if (newAdminPassword.length < 6) {
      setAddAdminError('Password must be at least 6 characters.');
      return;
    }

    setAddAdminLoading(true);

    try {
      const res = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName.trim(),
          email: newAdminEmail.trim(),
          password: newAdminPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add admin');

      setAddAdminSuccess(true);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setTimeout(() => setAddAdminSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setAddAdminError(err.message || 'Failed to add admin.');
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/admin');
  };

  if (!adminSession) return null;

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1">
          ADMIN <span className="text-yellow-300">SETTINGS</span>
        </h1>
        <p className="text-neutral-500 text-sm mb-8">Manage your profile, password, and admin access</p>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-yellow-300" />
            Edit Profile
          </h2>

          {profileError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          {/* Photo */}
          <div className="flex items-center gap-4 mb-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-yellow-300/50 cursor-pointer group overflow-hidden"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Camera className="w-6 h-6 text-neutral-500 group-hover:text-yellow-300" />
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div>
              <p className="text-white text-sm font-medium">{adminSession.email}</p>
              <p className="text-neutral-500 text-xs">Click photo to change</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Admin Name"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
              />
            </div>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="mt-4 px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-300" />
            Change Password
          </h2>

          {passwordError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Password changed successfully!
            </div>
          )}

          <div className="space-y-3">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 chars)"
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading}
            className="mt-4 px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>
        </motion.div>

        {/* Add Admin Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-white/5 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-300" />
            Add New Admin
          </h2>

          {addAdminError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {addAdminError}
            </div>
          )}
          {addAdminSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> New admin added successfully!
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Admin Name"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Admin Email"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Admin Password (min 6 chars)"
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
              />
            </div>
          </div>

          <button
            onClick={handleAddAdmin}
            disabled={addAdminLoading}
            className="mt-4 px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {addAdminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Admin'}
          </button>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
