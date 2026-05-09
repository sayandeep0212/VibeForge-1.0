'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, Star, StarOff, User as UserIcon,
  Building2, Edit3, Trash2, X, Save, Loader2
} from 'lucide-react';
import { ref, get, update, remove } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import * as XLSX from 'xlsx';

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
  profileComplete: boolean;
  createdAt: number;
  shortlisted?: boolean;
}

interface AdminSession {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface EditForm {
  name: string;
  phone: string;
  college: string;
  isAdamas: boolean;
  registrationNumber: string;
  year: string;
  program: string;
}

export default function ParticipantsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'adamas' | 'other'>('all');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'shortlisted' | 'not_shortlisted'>('all');

  // Edit modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', phone: '', college: '', isAdamas: false,
    registrationNumber: '', year: '', program: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (!mounted) return;
        if (!data.isLoggedIn) { router.push('/admin'); return; }
        setAdminSession(data.user);
        fetchUsers();
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) router.push('/admin');
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, [router]);

  const fetchUsers = async () => {
    try {
      const snapshot = await get(ref(getDb(), 'users'));
      setUsers(snapshot.exists() ? snapshot.val() : {});
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return Object.entries(users).filter(([, user]) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        (user.name?.toLowerCase() || '').includes(query) ||
        (user.email?.toLowerCase() || '').includes(query) ||
        (user.uid?.toLowerCase() || '').includes(query) ||
        (user.college?.toLowerCase() || '').includes(query) ||
        (user.phone || '').includes(query);
      const matchesCollege =
        collegeFilter === 'all' ||
        (collegeFilter === 'adamas' && user.isAdamas) ||
        (collegeFilter === 'other' && !user.isAdamas);
      const matchesShortlist =
        shortlistFilter === 'all' ||
        (shortlistFilter === 'shortlisted' && user.shortlisted) ||
        (shortlistFilter === 'not_shortlisted' && !user.shortlisted);
      return matchesSearch && matchesCollege && matchesShortlist;
    });
  }, [users, searchQuery, collegeFilter, shortlistFilter]);

  const toggleShortlist = async (firebaseId: string) => {
    const current = users[firebaseId]?.shortlisted || false;
    try {
      await update(ref(getDb(), `users/${firebaseId}`), { shortlisted: !current });
      setUsers(prev => ({
        ...prev,
        [firebaseId]: { ...prev[firebaseId], shortlisted: !current }
      }));
    } catch (err) {
      console.error('Error toggling shortlist:', err);
    }
  };

  // Admin Edit Functions
  const startEdit = (firebaseId: string) => {
    const user = users[firebaseId];
    setEditingId(firebaseId);
    setEditForm({
      name: user.name,
      phone: user.phone,
      college: user.isAdamas ? 'Adamas University' : user.college,
      isAdamas: user.isAdamas,
      registrationNumber: user.registrationNumber || '',
      year: user.year,
      program: user.program,
    });
  };

  const handleCollegeChange = (value: string) => {
    if (value === 'Adamas University') {
      setEditForm(prev => ({ ...prev, college: 'Adamas University', isAdamas: true }));
    } else {
      setEditForm(prev => ({ ...prev, isAdamas: false, college: '', registrationNumber: '' }));
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      const updates: any = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        college: editForm.isAdamas ? 'Adamas University' : editForm.college.trim(),
        isAdamas: editForm.isAdamas,
        year: editForm.year,
        program: editForm.program.trim(),
        updatedAt: Date.now(),
      };
      if (editForm.isAdamas) {
        updates.registrationNumber = editForm.registrationNumber.trim();
      }
      await update(ref(getDb(), `users/${editingId}`), updates);
      setUsers(prev => ({
        ...prev,
        [editingId!]: { ...prev[editingId!], ...updates }
      }));
      setEditingId(null);
    } catch (err) {
      console.error('Error saving edit:', err);
      alert('Failed to save changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (firebaseId: string) => {
    const user = users[firebaseId];
    if (!window.confirm(`Are you sure you want to delete participant "${user.name}"? This will remove their profile data permanently.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/participants/delete?id=${firebaseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete participant');
      }

      setUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[firebaseId];
        return newUsers;
      });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete participant.');
    }
  };

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const exportUsers = filteredUsers.map(([, user]) => ({
      UID: user.uid,
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      College: user.college,
      'Is Adamas': user.isAdamas ? 'Yes' : 'No',
      'Registration Number': user.registrationNumber || 'N/A',
      Year: user.year,
      Program: user.program,
      Shortlisted: user.shortlisted ? 'Yes' : 'No',
      'Created At': new Date(user.createdAt).toLocaleString(),
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportUsers, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `participants_${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(exportUsers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Participants');
      XLSX.writeFile(wb, `participants_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`,
        format === 'csv' ? { bookType: 'csv' } : undefined);
    }
  };

  const handleLogout = () => { router.push('/admin'); };

  if (!adminSession) return null;

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name || 'Admin'} photoURL={adminSession.photoURL}>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              ALL <span className="text-yellow-300">PARTICIPANTS</span>
            </h1>
            <p className="text-neutral-500 text-sm">
              {filteredUsers.length} of {Object.keys(users).length} profiles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportData('csv')} className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-all text-xs font-medium">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => exportData('excel')} className="flex items-center gap-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-xs font-medium">
              <Download className="w-3 h-3" /> Excel
            </button>
            <button onClick={() => exportData('json')} className="flex items-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all text-xs font-medium">
              <Download className="w-3 h-3" /> JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, UID, college, phone..."
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600" />
          </div>
          <div className="flex gap-2">
            <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value as 'all' | 'adamas' | 'other')}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Colleges</option>
              <option value="adamas" className="bg-black">Adamas University</option>
              <option value="other" className="bg-black">Other Colleges</option>
            </select>
            <select value={shortlistFilter} onChange={(e) => setShortlistFilter(e.target.value as 'all' | 'shortlisted' | 'not_shortlisted')}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Status</option>
              <option value="shortlisted" className="bg-black">Shortlisted</option>
              <option value="not_shortlisted" className="bg-black">Not Shortlisted</option>
            </select>
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Edit Participant</h3>
                <button onClick={() => setEditingId(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Full Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Phone Number</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>

                {/* College Type */}
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">College Type</label>
                  <select value={editForm.isAdamas ? 'Adamas University' : 'Other'}
                    onChange={e => handleCollegeChange(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                    <option value="Adamas University" className="bg-black">Adamas University</option>
                    <option value="Other" className="bg-black">Other College</option>
                  </select>
                </div>

                {/* Conditional: Adamas Reg Number OR Other College Name */}
                {editForm.isAdamas ? (
                  <div>
                    <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">
                      Adamas Registration Number <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={editForm.registrationNumber}
                      onChange={e => setEditForm(p => ({ ...p, registrationNumber: e.target.value }))}
                      placeholder="e.g. AU/2024/1234"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-yellow-300/50" />
                  </div>
                ) : (
                  <div>
                    <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">
                      College Name <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={editForm.college}
                      onChange={e => setEditForm(p => ({ ...p, college: e.target.value }))}
                      placeholder="Enter college name"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                  </div>
                )}

                {/* Year */}
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Year</label>
                  <select value={editForm.year} onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                    <option value="1st Year" className="bg-black">1st Year</option>
                    <option value="2nd Year" className="bg-black">2nd Year</option>
                    <option value="3rd Year" className="bg-black">3rd Year</option>
                    <option value="4th Year" className="bg-black">4th Year</option>
                  </select>
                </div>

                {/* Program */}
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Program</label>
                  <input type="text" value={editForm.program} onChange={e => setEditForm(p => ({ ...p, program: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>

                <button onClick={saveEdit} disabled={editSaving || (!editForm.isAdamas && !editForm.college.trim()) || (editForm.isAdamas && !editForm.registrationNumber.trim())}
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">⭐</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">User</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">UID</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">College</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Year</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Program</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Phone</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Reg. No.</th>
                    <th className="text-left p-4 text-neutral-500 font-medium text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(([firebaseId, user], idx) => (
                    <motion.tr
                      key={firebaseId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleShortlist(firebaseId)}
                          className={`transition-colors ${user.shortlisted ? 'text-yellow-300' : 'text-neutral-600 hover:text-yellow-300'}`}
                        >
                          {user.shortlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-neutral-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{user.name}</p>
                            <p className="text-neutral-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-yellow-300/80 text-xs bg-yellow-300/5 px-2 py-1 rounded">{user.uid}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-neutral-600" />
                          <span className={`text-xs ${user.isAdamas ? 'text-purple-400' : 'text-neutral-300'}`}>{user.college}</span>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-300 text-xs">{user.year}</td>
                      <td className="p-4 text-neutral-300 text-xs">{user.program}</td>
                      <td className="p-4 text-neutral-300 text-xs">{user.phone}</td>
                      <td className="p-4 text-neutral-300 text-xs font-mono">{user.registrationNumber || '—'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => startEdit(firebaseId)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-yellow-300 rounded-lg transition-all" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(firebaseId)}
                            className="p-1.5 bg-red-500/5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-neutral-500 text-sm">
                No participants found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
