'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon, Mail, Phone, Lock, Camera, UserPlus,
  AlertCircle, CheckCircle, Loader2, Shield, CalendarClock, ToggleLeft, ToggleRight, Trash2
} from 'lucide-react';
import { uploadToImgBB } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { ref, get, set } from 'firebase/database';
import { getDb } from '@/lib/firebase';

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

  // Admins list states
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  // Registration control states
  const [regOpen, setRegOpen] = useState(true);
  const [regDeadline, setRegDeadline] = useState('');
  const [regSaving, setRegSaving] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

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
    // Fetch registration settings
    fetchRegSettings();
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/list');
      const data = await res.json();
      if (data.admins) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const fetchRegSettings = async () => {
    try {
      const snap = await get(ref(getDb(), 'eventSettings/registration'));
      if (snap.exists()) {
        const data = snap.val();
        setRegOpen(data.isOpen ?? true);
        if (data.deadline) {
          const d = new Date(data.deadline);
          setRegDeadline(d.toISOString().slice(0, 16));
        }
      }
    } catch (err) {
      console.error('Error fetching reg settings:', err);
    }
  };

  const saveRegSettings = async () => {
    setRegSaving(true);
    try {
      await set(ref(getDb(), 'eventSettings/registration'), {
        isOpen: regOpen,
        deadline: regDeadline ? new Date(regDeadline).getTime() : null,
        updatedAt: Date.now(),
      });
      setRegSuccess(true);
      setTimeout(() => setRegSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving reg settings:', err);
      alert('Failed to save registration settings.');
    } finally {
      setRegSaving(false);
    }
  };

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
      fetchAdmins(); // Refresh the list
      setTimeout(() => setAddAdminSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setAddAdminError(err.message || 'Failed to add admin.');
    } finally {
      setAddAdminLoading(false);
    }
  };
  const handleDeleteAdmin = async (id: string, name: string) => {
    if (id === adminSession?.id) return;
    if (!confirm(`Are you sure you want to delete admin "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');
      fetchAdmins(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting admin:', err);
      alert(err.message || 'Failed to delete admin.');
    }
  };

  const handleLogout = () => {
    router.push('/admin');
  };

  if (!adminSession) return null;

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name} photoURL={adminSession.photoURL}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1">
          ADMIN <span className="text-yellow-300">SETTINGS</span>
        </h1>
        <p className="text-neutral-500 text-sm mb-8">Manage registration controls, profile, password, and admin access</p>

        {/* Registration Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-yellow-300" />
            Registration Control
          </h2>

          {regSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Settings saved!
            </div>
          )}

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <p className="text-white font-medium text-sm">Registration Status</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  {regOpen ? 'New teams can register' : 'Registration is closed for all new users'}
                </p>
              </div>
              <button onClick={() => setRegOpen(!regOpen)} className="transition-all">
                {regOpen ? (
                  <ToggleRight className="w-10 h-10 text-green-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-red-400" />
                )}
              </button>
            </div>

            {/* Status Badge */}
            <div className={`p-3 rounded-xl text-center text-sm font-bold uppercase tracking-wider ${
              regOpen ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {regOpen ? '🟢 REGISTRATION OPEN' : '🔴 REGISTRATION CLOSED'}
            </div>

            {/* Deadline */}
            <div>
              <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Auto-Close Deadline (Date & Time)</label>
              <input
                type="datetime-local"
                value={regDeadline}
                onChange={(e) => setRegDeadline(e.target.value)}
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-yellow-300/50 text-sm"
              />
              <p className="text-neutral-600 text-[10px] mt-1">
                Registration will automatically close after this date & time. Leave empty for no auto-close.
              </p>
            </div>

            {regDeadline && (
              <div className="p-3 bg-yellow-300/5 border border-yellow-300/20 rounded-xl text-yellow-300 text-xs">
                ⏰ Auto-closes: {new Date(regDeadline).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            )}
          </div>

          <button
            onClick={saveRegSettings}
            disabled={regSaving}
            className="mt-4 px-6 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {regSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Registration Settings'}
          </button>
        </motion.div>

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

        {/* All Admins List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 border border-white/5 rounded-2xl p-6 mt-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-300" />
            All Administrators
          </h2>

          {adminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-yellow-300 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-yellow-300/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-300/10 border border-white/10 flex items-center justify-center text-yellow-300 font-bold">
                      {admin.photoURL ? (
                        <img src={admin.photoURL} alt={admin.name} className="w-full h-full object-cover" />
                      ) : (
                        admin.name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{admin.name}</p>
                      <p className="text-neutral-500 text-xs">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {admin.email === adminSession.email ? (
                      <span className="text-[10px] bg-yellow-300/10 text-yellow-300 px-2 py-1 rounded-full border border-yellow-300/20 uppercase font-black tracking-tighter">
                        You
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
