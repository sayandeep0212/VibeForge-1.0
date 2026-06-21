'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, CheckCircle, XCircle, Clock, Users,
  User as UserIcon, CreditCard, Shield, Star, Trash2, Edit3, X, Save, Building2, RefreshCw, Plus,
  UserPlus, UserMinus, Calendar
} from 'lucide-react';
import { ref, get, update, remove, push, set } from 'firebase/database';
import { getDb, getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { nanoid } from 'nanoid';
import * as XLSX from 'xlsx';

interface Member {
  firebaseId: string;
  uid: string;
  name: string;
  email: string;
  college?: string;
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
type PaymentModeFilter = 'all' | 'online' | 'offline' | 'free';

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
  const [paymentModeFilter, setPaymentModeFilter] = useState<PaymentModeFilter>('all');

  // Edit modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    teamName: string;
    status: string;
    members: Member[];
    payment: {
      razorpayId: string;
      orderId?: string;
      amount: number;
      status: string;
      receipt: string;
      paidAt: number;
    };
  }>({
    teamName: '',
    status: '',
    members: [],
    payment: { razorpayId: '', amount: 0, status: '', receipt: '', paidAt: Date.now() },
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Manual Registration Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    teamName: '',
    type: 'individual' as 'individual' | 'team',
    leaderUid: '',
    memberUids: [''] as string[],
    amount: 0,
    initialStatus: 'pending_approval' as 'pending_approval' | 'approved' | 'rejected',
  });
  const [manualError, setManualError] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (!data.isLoggedIn) { router.push('/admin'); return; }
        
        setAdminName(data.user.name);
        setPhotoURL(data.user.photoURL);

        // Ensure Firebase Auth is synced with the session
        const auth = getFirebaseAuth();
        if (!auth.currentUser && data.token) {
          try {
            await signInWithCustomToken(auth, data.token);
          } catch (signInErr) {
            console.error('Firebase sync error:', signInErr);
          }
        }

        fetchData();
      } catch (err) { 
        console.error('Session error:', err);
        router.push('/admin'); 
      }
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

  const findUserByUid = (uid: string) => {
    const entry = Object.entries(userProfiles).find(([_, profile]) => profile.uid === uid);
    if (entry) {
      return { firebaseId: entry[0], ...entry[1] };
    }
    return null;
  };

  const handleManualSubmit = async () => {
    setManualError('');
    if (!manualForm.teamName) return setManualError('Team Name is required');
    if (!manualForm.leaderUid) return setManualError('Leader UID is required');

    const leaderUser = findUserByUid(manualForm.leaderUid);
    if (!leaderUser) return setManualError(`User with UID ${manualForm.leaderUid} not found`);

    const members = [{
      firebaseId: leaderUser.firebaseId,
      uid: leaderUser.uid,
      name: leaderUser.name,
      email: leaderUser.email,
      college: leaderUser.college || '',
    }];

    if (manualForm.type === 'team') {
      const validMemberUids = manualForm.memberUids.filter(uid => uid.trim() !== '');
      if (validMemberUids.length === 0) return setManualError('At least one valid member UID is required for a team');
      
      for (const uid of validMemberUids) {
        if (uid === manualForm.leaderUid) return setManualError('Leader cannot be added as a member again');
        const memberUser = findUserByUid(uid);
        if (!memberUser) return setManualError(`Member with UID ${uid} not found`);
        members.push({
          firebaseId: memberUser.firebaseId,
          uid: memberUser.uid,
          name: memberUser.name,
          email: memberUser.email,
          college: memberUser.college || '',
        });
      }
    }

    setIsSubmittingManual(true);
    try {
      const newRegData = {
        teamName: manualForm.teamName,
        type: manualForm.type,
        leaderId: leaderUser.firebaseId,
        leaderUid: leaderUser.uid,
        isAdamas: leaderUser.isAdamas || false,
        members,
        payment: {
          razorpayId: 'OFFLINE_PAYMENT',
          amount: manualForm.amount,
          status: 'paid',
          receipt: `RCPT-${nanoid(8).toUpperCase()}`,
          paidAt: Date.now(),
        },
        status: manualForm.initialStatus,
        passId: '',
        bookingId: '',
        createdAt: Date.now(),
      };

      const newRegRef = push(ref(getDb(), 'registrations'));
      await set(newRegRef, newRegData);

      // Only call the approve API (which generates passes + sends emails) if admin chose "Selected"
      if (manualForm.initialStatus === 'approved') {
        const res = await fetch('/api/admin/registrations/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId: newRegRef.key }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to approve manual registration');
        }
      }

      setShowManualModal(false);
      setManualForm({ teamName: '', type: 'individual', leaderUid: '', memberUids: [''], amount: 0, initialStatus: 'pending_approval' });
      fetchData(); // refresh data
    } catch (err: any) {
      console.error(err);
      setManualError(err.message || 'Failed to create manual registration');
    } finally {
      setIsSubmittingManual(false);
    }
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
        
      const matchesPaymentMode = paymentModeFilter === 'all' ||
        (paymentModeFilter === 'offline' ? reg.payment?.razorpayId === 'OFFLINE_PAYMENT' : 
         paymentModeFilter === 'free' ? reg.payment?.razorpayId === 'FREE-ADAMAS' :
         reg.payment?.razorpayId !== 'OFFLINE_PAYMENT' && reg.payment?.razorpayId !== 'FREE-ADAMAS');

      return matchesSearch && matchesStatus && matchesType && matchesCollege && matchesPaymentMode;
    });
  }, [registrations, userProfiles, searchQuery, statusFilter, typeFilter, collegeFilter, paymentModeFilter]);

  const toggleShortlist = async (regId: string) => {
    const current = registrations[regId]?.shortlisted || false;
    try {
      await update(ref(getDb(), `registrations/${regId}`), { shortlisted: !current });
      setRegistrations(prev => ({ ...prev, [regId]: { ...prev[regId], shortlisted: !current } }));
    } catch (err) { console.error('Error toggling shortlist:', err); }
  };

  const handleApprove = async (regId: string) => {
    try {
      const res = await fetch('/api/admin/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve');
      }

      const data = await res.json();
      setRegistrations(prev => ({ 
        ...prev, 
        [regId]: { 
          ...prev[regId], 
          status: 'approved', 
          shortlisted: true,
          passId: data.passId, 
          bookingId: data.bookingId 
        } 
      }));
    } catch (err: any) { 
      console.error('Error approving:', err); 
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (regId: string) => {
    try {
      await update(ref(getDb(), `registrations/${regId}`), { status: 'rejected', passId: '' });
      setRegistrations(prev => ({ ...prev, [regId]: { ...prev[regId], status: 'rejected', passId: '' } }));
    } catch (err) { console.error('Error rejecting:', err); }
  };

  const handleBulkApproveAll = async () => {
    const pendingIds = Object.entries(registrations)
      .filter(([, reg]) => reg.status === 'pending_approval')
      .map(([id]) => id);
    if (pendingIds.length === 0) { alert('No pending teams to select.'); return; }
    if (!confirm(`Select & approve all ${pendingIds.length} pending team(s)? This will generate passes and send emails for each.`)) return;
    setBulkProcessing('approving');
    let successCount = 0;
    let failCount = 0;
    for (const regId of pendingIds) {
      try {
        await handleApprove(regId);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setBulkProcessing(null);
    alert(`Bulk select complete: ${successCount} selected, ${failCount} failed.`);
  };

  const handleBulkRejectAll = async () => {
    const pendingIds = Object.entries(registrations)
      .filter(([, reg]) => reg.status === 'pending_approval')
      .map(([id]) => id);
    if (pendingIds.length === 0) { alert('No pending teams to eliminate.'); return; }
    if (!confirm(`Eliminate all ${pendingIds.length} pending team(s)? They will NOT receive event passes.`)) return;
    setBulkProcessing('rejecting');
    let successCount = 0;
    let failCount = 0;
    for (const regId of pendingIds) {
      try {
        await handleReject(regId);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setBulkProcessing(null);
    alert(`Bulk eliminate complete: ${successCount} eliminated, ${failCount} failed.`);
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
    setEditError('');
    setEditForm({
      teamName: reg.teamName,
      status: reg.status,
      members: reg.members ? reg.members.map(m => ({ ...m })) : [],
      payment: {
        razorpayId: reg.payment?.razorpayId || '',
        orderId: reg.payment?.orderId || '',
        amount: reg.payment?.amount || 0,
        status: reg.payment?.status || '',
        receipt: reg.payment?.receipt || '',
        paidAt: reg.payment?.paidAt || Date.now(),
      },
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditError('');
    setEditSaving(true);
    try {
      // Validate at least one member
      const validMembers = editForm.members.filter(m => m.name.trim() && m.email.trim() && m.uid.trim());
      if (validMembers.length === 0) {
        setEditError('At least one member with name, email, and UID is required.');
        setEditSaving(false);
        return;
      }

      // If status changed to approved, use the approval API first
      if (editForm.status === 'approved' && registrations[editingId].status !== 'approved') {
        // Save other changes first
        const res = await fetch('/api/admin/registrations/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: editingId,
            updates: {
              teamName: editForm.teamName,
              members: validMembers,
              payment: editForm.payment,
            },
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to save changes');
        }
        // Then trigger approval (generates pass + sends email)
        await handleApprove(editingId);
      } else {
        const res = await fetch('/api/admin/registrations/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: editingId,
            updates: {
              teamName: editForm.teamName,
              status: editForm.status,
              members: validMembers,
              payment: editForm.payment,
            },
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to save changes');
        }
      }

      // Refresh data to get the updated state
      await fetchData();
      setEditingId(null);
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setEditError(err.message || 'Failed to save changes');
    } finally {
      setEditSaving(false);
    }
  };

  const addEditMember = () => {
    if (editForm.members.length >= 3) return; // Max 3 members (1 leader + 2 members)
    setEditForm(prev => ({
      ...prev,
      members: [...prev.members, { firebaseId: '', uid: '', name: '', email: '', college: '' }],
    }));
  };

  const removeEditMember = (idx: number) => {
    setEditForm(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== idx),
    }));
  };

  const updateEditMember = (idx: number, field: keyof Member, value: string) => {
    setEditForm(prev => {
      const newMembers = [...prev.members];
      newMembers[idx] = { ...newMembers[idx], [field]: value };
      return { ...prev, members: newMembers };
    });
  };

  // Helper: convert timestamp to datetime-local input value
  const timestampToLocal = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const localToTimestamp = (val: string) => new Date(val).getTime();

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
      approved: { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-green-500/10 border-green-500/20 text-green-400', label: 'Selected' },
      pending_approval: { icon: <Clock className="w-3 h-3" />, cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', label: 'Pending Selection' },
      rejected: { icon: <XCircle className="w-3 h-3" />, cls: 'bg-red-500/10 border-red-500/20 text-red-400', label: 'Eliminated' },
    };
    const s = map[status];
    if (!s) return null;
    return <span className={`flex items-center gap-1 px-2 py-1 border text-xs font-bold rounded-full ${s.cls}`}>{s.icon} {s.label}</span>;
  };

  return (
    <AdminLayout onLogout={() => router.push('/admin')} adminName={adminName} photoURL={photoURL}>
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 md:gap-3 mb-6">
          {[
            { label: 'Teams', value: stats.total, color: 'text-white' },
            { label: 'Members', value: stats.totalMembers, color: 'text-blue-400' },
            { label: 'Selected', value: stats.approved, color: 'text-green-400' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Eliminated', value: stats.rejected, color: 'text-red-400' },
            { label: 'Shortlisted', value: stats.shortlisted, color: 'text-cyan-400' },
            { label: 'Adamas', value: stats.adamas, color: 'text-purple-400' },
            { label: 'External', value: stats.external, color: 'text-orange-400' },
            { label: 'Revenue', value: `₹${stats.totalRevenue}`, color: 'text-yellow-300' },
          ].map(s => (
            <div key={s.label} className="bg-black/40 border border-white/5 rounded-xl p-2 md:p-3 text-center">
              <p className="text-neutral-600 text-[10px] uppercase tracking-wider">{s.label}</p>
              <p className={`text-sm md:text-lg font-black ${s.color}`}>{s.value}</p>
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
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button onClick={() => fetchData()} className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-all text-[10px] sm:text-xs font-medium">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={() => setShowManualModal(true)} className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg transition-all text-[10px] sm:text-xs font-medium">
              <Plus className="w-3 h-3" /> Offline Reg
            </button>
            <button onClick={() => exportData('csv')} className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-all text-[10px] sm:text-xs font-medium">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => exportData('excel')} className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-[10px] sm:text-xs font-medium">
              <Download className="w-3 h-3" /> Excel
            </button>
            <button onClick={() => exportData('json')} className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all text-[10px] sm:text-xs font-medium">
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
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 text-[10px] sm:text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Status</option>
              <option value="pending_approval" className="bg-black">Pending Selection</option>
              <option value="approved" className="bg-black">Selected</option>
              <option value="rejected" className="bg-black">Eliminated</option>
              <option value="shortlisted" className="bg-black">Shortlisted</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 text-[10px] sm:text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Types</option>
              <option value="individual" className="bg-black">Individual</option>
              <option value="team" className="bg-black">Team</option>
            </select>
            <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value as CollegeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 text-[10px] sm:text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Colleges</option>
              <option value="adamas" className="bg-black">Adamas University</option>
              <option value="external" className="bg-black">External Colleges</option>
            </select>
            <select value={paymentModeFilter} onChange={(e) => setPaymentModeFilter(e.target.value as PaymentModeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 text-[10px] sm:text-sm cursor-pointer focus:outline-none focus:border-yellow-300/50">
              <option value="all" className="bg-black">All Modes</option>
              <option value="online" className="bg-black">Online</option>
              <option value="offline" className="bg-black">Offline</option>
              <option value="free" className="bg-black">Free (Adamas)</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {stats.pending > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div>
              <p className="text-white text-sm font-bold">
                {stats.pending} Pending Team{stats.pending !== 1 ? 's' : ''}
              </p>
              <p className="text-neutral-500 text-xs">Bulk actions for all teams in the Online Selection Round</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkApproveAll}
                disabled={bulkProcessing !== null}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkProcessing === 'approving' ? (
                  <><div className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle className="w-3.5 h-3.5" /> Select All Pending</>
                )}
              </button>
              <button
                onClick={handleBulkRejectAll}
                disabled={bulkProcessing !== null}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkProcessing === 'rejecting' ? (
                  <><div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5" /> Eliminate All Pending</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Manual Registration Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isSubmittingManual && setShowManualModal(false)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold">Add Offline Registration</h3>
                <button onClick={() => setShowManualModal(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              {manualError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {manualError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Team Name</label>
                  <input type="text" value={manualForm.teamName} onChange={e => setManualForm(p => ({ ...p, teamName: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>
                
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Type</label>
                  <select value={manualForm.type} onChange={e => setManualForm(p => ({ ...p, type: e.target.value as 'individual' | 'team' }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                    <option value="individual" className="bg-black">Individual</option>
                    <option value="team" className="bg-black">Team</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Leader UID</label>
                  <input type="text" value={manualForm.leaderUid} onChange={e => setManualForm(p => ({ ...p, leaderUid: e.target.value.toUpperCase() }))}
                    placeholder="GL-XXXXXX"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50 font-mono" />
                  {manualForm.leaderUid && findUserByUid(manualForm.leaderUid) && (
                    <p className="text-xs text-green-400 mt-1 pl-1">✓ {findUserByUid(manualForm.leaderUid)!.name} • {findUserByUid(manualForm.leaderUid)!.college}</p>
                  )}
                  {manualForm.leaderUid && !findUserByUid(manualForm.leaderUid) && manualForm.leaderUid.length > 5 && (
                    <p className="text-xs text-red-400 mt-1 pl-1">✗ User not found</p>
                  )}
                </div>

                {manualForm.type === 'team' && (
                  <div>
                    <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Member UIDs (Max 2)</label>
                    <div className="space-y-2">
                      {manualForm.memberUids.map((uid, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="flex gap-2">
                            <input type="text" value={uid} onChange={e => {
                              const newUids = [...manualForm.memberUids];
                              newUids[idx] = e.target.value.toUpperCase();
                              setManualForm(p => ({ ...p, memberUids: newUids }));
                            }}
                              placeholder="GL-XXXXXX"
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-300/50 font-mono" />
                            {manualForm.memberUids.length > 1 && (
                              <button onClick={() => {
                                const newUids = manualForm.memberUids.filter((_, i) => i !== idx);
                                setManualForm(p => ({ ...p, memberUids: newUids }));
                              }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl shrink-0"><X className="w-4 h-4" /></button>
                            )}
                          </div>
                          {uid && findUserByUid(uid) && (
                            <p className="text-xs text-green-400 pl-1">✓ {findUserByUid(uid)!.name} • {findUserByUid(uid)!.college}</p>
                          )}
                          {uid && !findUserByUid(uid) && uid.length > 5 && (
                            <p className="text-xs text-red-400 pl-1">✗ User not found</p>
                          )}
                        </div>
                      ))}
                      {manualForm.memberUids.length < 2 && (
                        <button onClick={() => setManualForm(p => ({ ...p, memberUids: [...p.memberUids, ''] }))}
                          className="text-xs text-yellow-300 hover:text-yellow-400 mt-2 block">+ Add Member UID</button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Amount Paid</label>
                  <input type="number" value={manualForm.amount} onChange={e => setManualForm(p => ({ ...p, amount: Number(e.target.value) }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>

                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Initial Status</label>
                  <select
                    value={manualForm.initialStatus}
                    onChange={e => setManualForm(p => ({ ...p, initialStatus: e.target.value as 'pending_approval' | 'approved' | 'rejected' }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50"
                  >
                    <option value="pending_approval" className="bg-black">⏳ Pending Selection</option>
                    <option value="approved" className="bg-black">✅ Selected (generates pass + sends email)</option>
                    <option value="rejected" className="bg-black">❌ Eliminated</option>
                  </select>
                  {manualForm.initialStatus === 'approved' && (
                    <p className="text-xs text-yellow-400/70 mt-1 pl-1">⚠️ This will immediately generate a pass and send a confirmation email.</p>
                  )}
                </div>

                <button onClick={handleManualSubmit} disabled={isSubmittingManual}
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmittingManual ? 'Processing...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal — Full Details */}
        {editingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !editSaving && setEditingId(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Edit Registration</h3>
                  <p className="text-neutral-500 text-xs mt-0.5">ID: <span className="font-mono text-neutral-400">{editingId}</span></p>
                </div>
                <button onClick={() => setEditingId(null)} disabled={editSaving} className="text-neutral-500 hover:text-white disabled:opacity-50"><X className="w-5 h-5" /></button>
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {editError}
                </div>
              )}

              <div className="space-y-6">
                {/* Section: Team Info */}
                <div className="space-y-3">
                  <h4 className="text-neutral-400 text-xs uppercase tracking-widest font-bold border-b border-white/5 pb-2">Team Info</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Team Name</label>
                      <input type="text" value={editForm.teamName} onChange={e => setEditForm(p => ({ ...p, teamName: e.target.value }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Status</label>
                      <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                        <option value="pending_approval" className="bg-black">⏳ Pending Selection</option>
                        <option value="approved" className="bg-black">✅ Selected</option>
                        <option value="rejected" className="bg-black">❌ Eliminated</option>
                      </select>
                      {editForm.status === 'approved' && registrations[editingId]?.status !== 'approved' && (
                        <p className="text-xs text-yellow-400/70 mt-1 pl-1">⚠️ Changing to Selected will generate a pass and send a confirmation email.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-neutral-400 text-xs uppercase tracking-widest font-bold">Members ({editForm.members.length}/3)</h4>
                    {editForm.members.length < 3 && (
                      <button onClick={addEditMember} className="flex items-center gap-1 text-xs text-yellow-300 hover:text-yellow-400 transition-colors">
                        <UserPlus className="w-3.5 h-3.5" /> Add Member
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {editForm.members.map((member, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 relative group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-[10px] font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                              {idx === 0 ? '⭐ Leader' : `Member ${idx}`}
                            </span>
                          </div>
                          {editForm.members.length > 1 && (
                            <button onClick={() => removeEditMember(idx)}
                              className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Remove member">
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-neutral-600 text-[10px] uppercase tracking-wider block mb-0.5">Name</label>
                            <input type="text" value={member.name} onChange={e => updateEditMember(idx, 'name', e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-300/50" />
                          </div>
                          <div>
                            <label className="text-neutral-600 text-[10px] uppercase tracking-wider block mb-0.5">Email</label>
                            <input type="email" value={member.email} onChange={e => updateEditMember(idx, 'email', e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-300/50" />
                          </div>
                          <div>
                            <label className="text-neutral-600 text-[10px] uppercase tracking-wider block mb-0.5">UID</label>
                            <input type="text" value={member.uid} onChange={e => updateEditMember(idx, 'uid', e.target.value.toUpperCase())}
                              placeholder="GL-XXXXXX"
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-300/50 font-mono" />
                          </div>
                          <div>
                            <label className="text-neutral-600 text-[10px] uppercase tracking-wider block mb-0.5">College</label>
                            <input type="text" value={member.college || ''} onChange={e => updateEditMember(idx, 'college', e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-300/50" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="text-neutral-600 text-[10px] uppercase tracking-wider block mb-0.5">Firebase ID</label>
                          <input type="text" value={member.firebaseId} onChange={e => updateEditMember(idx, 'firebaseId', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-neutral-400 text-xs focus:outline-none focus:border-yellow-300/50 font-mono" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Payment */}
                <div className="space-y-3">
                  <h4 className="text-neutral-400 text-xs uppercase tracking-widest font-bold border-b border-white/5 pb-2">Payment Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Razorpay ID</label>
                      <input type="text" value={editForm.payment.razorpayId}
                        onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, razorpayId: e.target.value } }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50 font-mono" />
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Amount (₹)</label>
                      <input type="number" value={editForm.payment.amount}
                        onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, amount: Number(e.target.value) } }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Payment Status</label>
                      <select value={editForm.payment.status}
                        onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, status: e.target.value } }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50">
                        <option value="paid" className="bg-black">Paid</option>
                        <option value="pending" className="bg-black">Pending</option>
                        <option value="failed" className="bg-black">Failed</option>
                        <option value="refunded" className="bg-black">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Paid At</label>
                      <input type="datetime-local" value={timestampToLocal(editForm.payment.paidAt)}
                        onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, paidAt: localToTimestamp(e.target.value) } }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50 [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Receipt</label>
                      <input type="text" value={editForm.payment.receipt}
                        onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, receipt: e.target.value } }))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50 font-mono" />
                    </div>
                    {editForm.payment.orderId !== undefined && (
                      <div>
                        <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Order ID</label>
                        <input type="text" value={editForm.payment.orderId || ''}
                          onChange={e => setEditForm(p => ({ ...p, payment: { ...p.payment, orderId: e.target.value } }))}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50 font-mono" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button onClick={saveEdit} disabled={editSaving}
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {editSaving ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save All Changes</>
                  )}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${reg.type === 'team' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {reg.type === 'team' ? <Users className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate">{reg.teamName}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-neutral-500 text-[10px] sm:text-xs capitalize">{reg.type}</span>
                        <span className="text-neutral-700 hidden sm:inline">•</span>
                        <span className={`text-[10px] sm:text-xs font-medium ${isAdamasTeam(reg) ? 'text-purple-400' : 'text-orange-400'}`}>
                          {isAdamasTeam(reg) ? '🎓 Adamas' : '🌐 External'}
                        </span>
                        <span className="text-neutral-700 hidden sm:inline">•</span>
                        <span className={`text-[10px] sm:text-xs font-medium ${reg.payment?.razorpayId === 'FREE-ADAMAS' ? 'text-green-400' : reg.payment?.razorpayId === 'OFFLINE_PAYMENT' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {reg.payment?.razorpayId === 'FREE-ADAMAS' ? '🆓 Free' : reg.payment?.razorpayId === 'OFFLINE_PAYMENT' ? '🎟️ Offline' : '💳 Online'}
                        </span>
                        <span className="text-neutral-700 hidden sm:inline">•</span>
                        <span className="text-neutral-500 text-[10px] sm:text-xs">{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button onClick={() => toggleShortlist(regId)} title={reg.shortlisted ? 'Un-shortlist' : 'Shortlist'}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all ${reg.shortlisted ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300/30' : 'bg-white/5 text-neutral-600 hover:text-white border border-transparent'}`}>
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      </button>
                      {getStatusBadge(reg.status)}
                      {reg.status === 'pending_approval' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleApprove(regId)} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-[10px] sm:text-xs font-bold">Select</button>
                          <button onClick={() => handleReject(regId)} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all text-[10px] sm:text-xs font-bold">Eliminate</button>
                        </div>
                      )}
                      <button onClick={() => startEdit(regId)} className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white rounded-lg transition-all" title="Edit">
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => handleDelete(regId)} className="p-1.5 sm:p-2 bg-red-500/5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
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
                      {reg.payment?.razorpayId === 'FREE-ADAMAS' || reg.payment?.amount === 0 ? (
                        <><CheckCircle className="w-3 h-3 text-green-400" /> FREE</>
                      ) : (
                        <><CreditCard className="w-3 h-3 text-neutral-600" /> ₹{reg.payment?.amount || 0}</>
                      )}
                    </p>
                  </div>
                  {reg.payment?.receipt && reg.payment.receipt !== 'N/A' && reg.payment?.razorpayId !== 'FREE-ADAMAS' && (
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Receipt</p>
                    <p className="text-neutral-300 text-xs font-mono">{reg.payment?.receipt}</p>
                  </div>
                  )}
                </div>

                {/* Members */}
                {reg.members && reg.members.length > 0 && (
                  <div>
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-2">Members ({reg.members.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {reg.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-[10px] sm:text-xs w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 shrink-0 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-[10px] font-bold">{member.name.charAt(0)}</div>
                            <span className="text-white font-bold sm:font-normal">{member.name}</span>
                            {member.firebaseId === reg.leaderId && (
                              <span title="Team Leader">
                                <Shield className="w-3 h-3 text-yellow-300" />
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 ml-7 sm:ml-0">
                            <span className="text-neutral-500 font-mono">{member.uid}</span>
                            <span className="text-neutral-700 hidden sm:inline">•</span>
                            <span className="text-neutral-600 truncate max-w-[150px] sm:max-w-none">{member.email}</span>
                            {member.college && (
                              <>
                                <span className="text-neutral-700 hidden sm:inline">•</span>
                                <span className="text-neutral-500 truncate max-w-[150px] sm:max-w-none" title={member.college}>{member.college.length > 20 ? member.college.substring(0, 20) + '...' : member.college}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                {reg.payment?.razorpayId && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-neutral-600 text-[9px] sm:text-[10px] flex flex-wrap gap-x-2 gap-y-1">
                      <span>Razorpay ID: <span className="text-neutral-400 font-mono">{reg.payment.razorpayId}</span></span>
                      {reg.payment.orderId && <span>• Order: <span className="text-neutral-400 font-mono">{reg.payment.orderId}</span></span>}
                      <span>• Paid: <span className="text-neutral-400">{new Date(reg.payment.paidAt).toLocaleString()}</span></span>
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
