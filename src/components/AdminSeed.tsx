'use client';

import React, { useState } from 'react';
import { ref, push, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

/**
 * Admin Seed Component — Place this on any page temporarily to create the first admin.
 * Remove it after creating the initial admin account.
 * 
 * Usage: Add <AdminSeed /> to any page, fill the form, click "Create First Admin"
 */
export default function AdminSeed() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    if (!email || !password || !name) {
      setStatus('All fields required');
      return;
    }

    setLoading(true);
    try {
      // Check if any admin exists
      const adminsSnap = await get(ref(db, 'admins'));
      if (adminsSnap.exists()) {
        setStatus('Admins already exist. Use the admin panel to add more.');
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newRef = push(ref(db, 'admins'));
      await set(newRef, {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        phone: '',
        photoURL: '',
        createdAt: Date.now(),
      });
      setStatus('✅ First admin created! You can now log in at /admin');
    } catch (err) {
      console.error(err);
      setStatus('Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black border border-yellow-300/30 rounded-2xl p-4 w-80 shadow-2xl">
      <h3 className="text-yellow-300 font-bold text-sm mb-3">🔧 Seed First Admin</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Admin Name"
        className="w-full bg-neutral-900 text-white rounded-lg py-2 px-3 mb-2 text-sm border border-white/10"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Admin Email"
        className="w-full bg-neutral-900 text-white rounded-lg py-2 px-3 mb-2 text-sm border border-white/10"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin Password"
        className="w-full bg-neutral-900 text-white rounded-lg py-2 px-3 mb-2 text-sm border border-white/10"
      />
      <button
        onClick={createAdmin}
        disabled={loading}
        className="w-full bg-yellow-300 text-black py-2 rounded-lg font-bold text-sm disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create First Admin'}
      </button>
      {status && <p className="text-xs text-neutral-400 mt-2">{status}</p>}
    </div>
  );
}
