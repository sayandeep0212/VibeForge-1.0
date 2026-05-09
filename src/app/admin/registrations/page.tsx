'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, CheckCircle, XCircle, Clock, Users,
  User as UserIcon, CreditCard, Shield, Star, Trash2, Edit3, X, Save, Building2, RefreshCw
} from 'lucide-react';
import { ref, get, update, remove } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { nanoid } from 'nanoid';
import * as XLSX from 'xlsx';

interface Member {
  firebaseId: string;
  uid: string;
  name: string;
  email: string;
}

interface Registration {
  teamName: string;
  type: 'individual' | 'team';
  leaderId: string;
  leaderUid: string;
  members: Member[];
  payment: {
    razorpayId: string;
    orderId?: string;
    amount: number;
    status: string;
    receipt: string;
    paidAt: number;
  };
  status: 'pending_approval' | 'approved' | 'rejected';
  passId: string;
  bookingId?: string;
  shortlisted?: boolean;
  isAdamas?: boolean;
  createdAt: number;
}

type StatusFilter = 'all' | 'pending_approval' | 'approved' | 'rejected' | 'shortlisted';
type TypeFilter = 'all' | 'individual' | 'team';
type CollegeFilter = 'all' | 'adamas' | 'external';

export default function RegistrationsPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [collegeFilter, setCollegeFilter] = useState<CollegeFilter>('all');

  // Edit modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ teamName: '', status: '' as string });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (!data.isLoggedIn) { router.push('/admin'); return; }
        setAdminName(data.user.name);
        setPhotoURL(data.user.photoURL);
        fetchData();
      } catch { router.push('/admin'); }
    };
    checkSession();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regSnap, usersSnap] = await Promise.all([
        get(ref(getDb(), 'registrations')),
        get(ref(getDb(), 'users'))
      ]);
      if (regSnap.exists()) setRegistrations(regSnap.val());
      if (usersSnap.exists()) setUserProfiles(usersSnap.val());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if a registration's leader is from Adamas
  const isAdamasTeam = (reg: Registration): boolean => {
    if (reg.isAdamas !== undefined) return reg.isAdamas;
    const leaderProfile = Object.values(userProfiles).find((u: any) => u.uid === reg.leaderUid);
    return leaderProfile?.isAdamas || false;
  };

  const filteredRegistrations = useMemo(() => {
    return Object.entries(registrations).filter(([, reg]) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        reg.teamName.toLowerCase().includes(query) ||
        reg.leaderUid.toLowerCase().includes(query) ||
        reg.members?.some(m => m.name.toLowerCase().includes(query) || m.uid.toLowerCase().includes(query)) ||
        reg.passId?.toLowerCase().includes(query) ||
        reg.payment?.razorpayId?.toLowerCase().includes(query) ||
        reg.payment?.receipt?.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'shortlisted' ? reg.shortlisted === true : reg.status === statusFilter);
      const matchesType = typeFilter === 'all' || reg.type === typeFilter;
      const matchesCollege = collegeFilter === 'all' ||
        (collegeFilter === 'adamas' ? isAdamasTeam(reg) : !isAdamasTeam(reg));

      return matchesSearch && matchesStatus && matchesType && matchesCollege;
    });
  }, [registrations, userProfiles, searchQuery, statusFilter, typeFilter, collegeFilter]);

  const toggleShortlist = async (regId: string) => {
    const current = registrations[regId]?.shortlisted || false;
    try {
      await update(ref(getDb(), `registrations/${regId}`), { shortlisted: !current });
      setRegistrations(prev => ({ ...prev, [regId]: { ...prev[regId], shortlisted: !current } }));
    } catch (err) { console.error('Error toggling shortlist:', err); }
  };

  const handleApprove = async (regId: string) => {
    const passId = `PASS-${nanoid(6).toUpperCase()}`;
    const bookingId = `BOOK-${nanoid(8).toUpperCase()}`;
    try {
      await update(ref(getDb(), `registrations/${regId}`), { status: 'approved', passId, bookingId });
      setRegistrations(prev => ({ ...prev, [regId]: { ...prev[regId], status: 'approved', passId, bookingId } }));
    } catch (err) { console.error('Error approving:', err); }
  };

  const handleReject = async (regId: string) => {
    try {
      await update(ref(getDb(), `registrations/${regId}`), { status: 'rejected', passId: '' });
      setRegistrations(prev => ({ ...prev, [regId]: { ...prev[regId], status: 'rejected', passId: '' } }));
    } catch (err) { console.error('Error rejecting:', err); }
  };

  const handleDelete = async (regId: string) => {
    if (!confirm(`Delete team "${registrations[regId]?.teamName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/registrations/delete?id=${regId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete registration');
      }

      setRegistrations(prev => { const n = { ...prev }; delete n[regId]; return n; });
    } catch (err: any) { 
      console.error('Error deleting:', err); 
      alert(err.message || 'Failed to delete registration');
    }
  };

  const startEdit = (regId: string) => {
    const reg = registrations[regId];
    setEditingId(regId);
    setEditForm({ teamName: reg.teamName, status: reg.status });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const updates: any = { teamName: editForm.teamName, status: editForm.status };
      if (editForm.status === 'approved' && !registrations[editingId].passId) {
        updates.passId = `PASS-${nanoid(6).toUpperCase()}`;
        updates.bookingId = `BOOK-${nanoid(8).toUpperCase()}`;
      }
      if (editForm.status === 'rejected') { updates.passId = ''; }
      await update(ref(getDb(), `registrations/${editingId}`), updates);
      setRegistrations(prev => ({ ...prev, [editingId!]: { ...prev[editingId!], ...updates } }));
      setEditingId(null);
    } catch (err) { console.error('Error saving edit:', err); }
  };

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const rows = filteredRegistrations.map(([regId, reg]) => ({
      'Registration ID': regId,
      'Team Name': reg.teamName,
      'Type': reg.type,
      'University': isAdamasTeam(reg) ? 'Adamas' : 'External',
      'Leader UID': reg.leaderUid,
      'Members': reg.members?.map(m => `${m.name} (${m.uid})`).join(', ') || '',
      'Member Count': reg.members?.length || 0,
      'Member Emails': reg.members?.map(m => m.email).join(', ') || '',
      'Payment ID': reg.payment?.razorpayId || '',
      'Amount': reg.payment?.amount || 0,
      'Receipt': reg.payment?.receipt || '',
      'Payment Status': reg.payment?.status || '',
      'Status': reg.status,
      'Shortlisted': reg.shortlisted ? 'Yes' : 'No',
      'Pass ID': reg.passId || 'N/A',
      'Booking ID': reg.bookingId || 'N/A',
      'Registered At': new Date(reg.createdAt).toLocaleString(),
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `registrations_${Date.now()}.json`; a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
      XLSX.writeFile(wb, `registrations_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`, format === 'csv' ? { bookType: 'csv' } : undefined);
    }
  };

  const stats = useMemo(() => {
    const all = Object.values(registrations);
    const totalMembers = all.reduce((sum, r) => sum + (r.members?.length || 0), 0);
    return {
      total: all.length,
      totalMembers,
      approved: all.filter(r => r.status === 'approved').length,
      pending: all.filter(r => r.status === 'pending_approval').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      shortlisted: all.filter(r => r.shortlisted).length,
      adamas: all.filter(r => isAdamasTeam(r)).length,
      external: all.filter(r => !isAdamasTeam(r)).length,
      totalRevenue: all.reduce((sum, r) => sum + (r.payment?.amount || 0), 0),
    };
  }, [registrations, userProfiles]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
      approved: { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-green-500/10 border-green-500/20 text-green-400', label: 'Approved' },
      pending_approval: { icon: <Clock className="w-3 h-3" />, cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', label: 'Pending' },
      rejected: { icon: <XCircle className="w-3 h-3" />, cls: 'bg-red-500/10 border-red-500/20 text-red-400', label: 'Rejected' },
    };
    const s = map[status];
    if (!s) return null;
    return <span className={`flex items-center gap-1 px-2 py-1 border text-xs font-bold rounded-full ${s.cls}`}>{s.icon} {s.label}</span>;
  };

  return (
    <AdminLayout onLogout={() => router.push('/admin')} adminName={adminName} photoURL={photoURL}>
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
          {[
            { label: 'Teams', value: stats.total, color: 'text-white' },
            { label: 'Members', value: stats.totalMembers, color: 'text-blue-400' },
            { label: 'Approved', value: stats.approved, color: 'text-green-400' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
            { label: 'Shortlisted', value: stats.shortlisted, color: 'text-cyan-400' },
            { label: 'Adamas', value: stats.adamas, color: 'text-purple-400' },
            { label: 'External', value: stats.external, color: 'text-orange-400' },
            { label: 'Revenue', value: `₹${stats.totalRevenue}`, color: 'text-yellow-300' },
          ].map(s => (
            <div key={s.label} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
              <p className="text-neutral-600 text-[10px] uppercase tracking-wider">{s.label}</p>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              EVENT <span className="text-yellow-300">REGISTRATIONS</span>
            </h1>
            <p className="text-neutral-500 text-sm">
              {filteredRegistrations.length} of {Object.keys(registrations).length} registrations
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => fetchData()} className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-all text-xs font-medium">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
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
              placeholder="Search by team name, UID, pass ID, payment ID..."
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Status</option>
              <option value="pending_approval" className="bg-black">Pending</option>
              <option value="approved" className="bg-black">Approved</option>
              <option value="rejected" className="bg-black">Rejected</option>
              <option value="shortlisted" className="bg-black">Shortlisted</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Types</option>
              <option value="individual" className="bg-black">Individual</option>
              <option value="team" className="bg-black">Team</option>
            </select>
            <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value as CollegeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Colleges</option>
              <option value="adamas" className="bg-black">Adamas University</option>
              <option value="external" className="bg-black">External Colleges</option>
            </select>
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold">Edit Registration</h3>
                <button onClick={() => setEditingId(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Team Name</label>
                  <input type="text" value={editForm.teamName} onChange={e => setEditForm(p => ({ ...p, teamName: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                    <option value="pending_approval" className="bg-black">Pending</option>
                    <option value="approved" className="bg-black">Approved</option>
                    <option value="rejected" className="bg-black">Rejected</option>
                  </select>
                </div>
                <button onClick={saveEdit} className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map(([regId, reg], idx) => (
              <motion.div key={regId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reg.type === 'team' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {reg.type === 'team' ? <Users className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{reg.teamName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-neutral-500 text-xs capitalize">{reg.type}</span>
                        <span className="text-neutral-700">•</span>
                        <span className={`text-xs font-medium ${isAdamasTeam(reg) ? 'text-purple-400' : 'text-orange-400'}`}>
                          {isAdamasTeam(reg) ? '🎓 Adamas' : '🌐 External'}
                        </span>
                        <span className="text-neutral-700">•</span>
                        <span className="text-neutral-500 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleShortlist(regId)} title={reg.shortlisted ? 'Un-shortlist' : 'Shortlist'}
                      className={`p-2 rounded-lg transition-all ${reg.shortlisted ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300/30' : 'bg-white/5 text-neutral-600 hover:text-white border border-transparent'}`}>
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    {getStatusBadge(reg.status)}
                    {reg.status === 'pending_approval' && (
                      <div className="flex gap-1 ml-1">
                        <button onClick={() => handleApprove(regId)} className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-xs font-bold">Approve</button>
                        <button onClick={() => handleReject(regId)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all text-xs font-bold">Reject</button>
                      </div>
                    )}
                    <button onClick={() => startEdit(regId)} className="p-2 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white rounded-lg transition-all" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(regId)} className="p-2 bg-red-500/5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Leader UID</p>
                    <p className="text-yellow-300/80 text-xs font-mono">{reg.leaderUid}</p>
                  </div>
                  {reg.passId && (
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Pass ID</p>
                      <p className="text-green-400 text-xs font-mono font-bold">{reg.passId}</p>
                    </div>
                  )}
                  {reg.bookingId && (
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Booking ID</p>
                      <p className="text-cyan-400 text-xs font-mono font-bold">{reg.bookingId}</p>
                    </div>
                  )}
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Payment</p>
                    <p className="text-white text-xs font-bold flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-neutral-600" /> ₹{reg.payment?.amount || 0}
                    </p>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Receipt</p>
                    <p className="text-neutral-300 text-xs font-mono">{reg.payment?.receipt || '—'}</p>
                  </div>
                </div>

                {/* Members */}
                {reg.members && reg.members.length > 0 && (
                  <div>
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-2">Members ({reg.members.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {reg.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-xs">
                          <div className="w-5 h-5 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-[10px] font-bold">{member.name.charAt(0)}</div>
                          <span className="text-white">{member.name}</span>
                          <span className="text-neutral-500 font-mono">{member.uid}</span>
                          <span className="text-neutral-600">{member.email}</span>
                          {member.firebaseId === reg.leaderId && <Shield className="w-3 h-3 text-yellow-300" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                {reg.payment?.razorpayId && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-neutral-600 text-[10px]">
                      Razorpay ID: <span className="text-neutral-400 font-mono">{reg.payment.razorpayId}</span>
                      {reg.payment.orderId && <>{' • '}Order: <span className="text-neutral-400 font-mono">{reg.payment.orderId}</span></>}
                      {' • '}Paid: <span className="text-neutral-400">{new Date(reg.payment.paidAt).toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12 text-neutral-500 text-sm bg-black/40 border border-white/5 rounded-2xl">
                No registrations found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
