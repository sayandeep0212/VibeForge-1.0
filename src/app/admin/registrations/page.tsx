'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Download, CheckCircle, XCircle, Clock, Users,
  User as UserIcon, CreditCard, Shield, Star
} from 'lucide-react';
import { ref, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';
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
    amount: number;
    status: string;
    receipt: string;
    paidAt: number;
  };
  status: 'pending_approval' | 'approved' | 'rejected';
  passId: string;
  bookingId?: string;
  shortlisted?: boolean;
  createdAt: number;
}

interface AdminSession {
  id: string;
  email: string;
  name: string;
}

export default function RegistrationsPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'shortlisted'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'team'>('all');

  useEffect(() => {
    const session = sessionStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin');
      return;
    }
    setAdminSession(JSON.parse(session));
    fetchRegistrations();
  }, [router]);

  const fetchRegistrations = async () => {
    try {
      const snapshot = await get(ref(db!, 'registrations'));
      if (snapshot.exists()) {
        setRegistrations(snapshot.val());
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
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

      const matchesStatus = statusFilter === 'all' || statusFilter === 'shortlisted' || reg.status === statusFilter;
      const matchesType = typeFilter === 'all' || reg.type === typeFilter;
      const matchesShortlist = 
        statusFilter !== 'shortlisted' || reg.shortlisted === true;

      return matchesSearch && matchesStatus && matchesType && matchesShortlist;
    });
  }, [registrations, searchQuery, statusFilter, typeFilter]);

  const toggleShortlist = async (regId: string) => {
    const current = registrations[regId]?.shortlisted || false;
    try {
      await update(ref(db!, `registrations/${regId}`), { shortlisted: !current });
      setRegistrations(prev => ({
        ...prev,
        [regId]: { ...prev[regId], shortlisted: !current }
      }));
    } catch (err) {
      console.error('Error toggling shortlist:', err);
    }
  };

  const handleApprove = async (regId: string) => {
    const passId = `PASS-${nanoid(6).toUpperCase()}`;
    const bookingId = `BOOK-${nanoid(8).toUpperCase()}`;
    try {
      await update(ref(db!, `registrations/${regId}`), {
        status: 'approved',
        passId,
        bookingId,
      });
      setRegistrations(prev => ({
        ...prev,
        [regId]: { ...prev[regId], status: 'approved', passId, bookingId }
      }));
    } catch (err) {
      console.error('Error approving registration:', err);
    }
  };

  const handleReject = async (regId: string) => {
    try {
      await update(ref(db!, `registrations/${regId}`), {
        status: 'rejected',
        passId: '',
      });
      setRegistrations(prev => ({
        ...prev,
        [regId]: { ...prev[regId], status: 'rejected', passId: '' }
      }));
    } catch (err) {
      console.error('Error rejecting registration:', err);
    }
  };

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const exportRegs = filteredRegistrations.map(([regId, reg]) => ({
      'Registration ID': regId,
      'Team Name': reg.teamName,
      'Type': reg.type,
      'Leader UID': reg.leaderUid,
      'Members': reg.members?.map(m => `${m.name} (${m.uid})`).join(', ') || '',
      'Member Count': reg.members?.length || 0,
      'Payment ID': reg.payment?.razorpayId || '',
      'Amount': reg.payment?.amount || 0,
      'Receipt': reg.payment?.receipt || '',
      'Payment Status': reg.payment?.status || '',
      'Status': reg.status,
      'Shortlisted': reg.shortlisted ? 'Yes' : 'No',
      'Pass ID': reg.passId || 'N/A',
      'Created At': new Date(reg.createdAt).toLocaleString(),
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportRegs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv' || format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportRegs);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

      if (format === 'csv') {
        XLSX.writeFile(wb, `registrations_${Date.now()}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, `registrations_${Date.now()}.xlsx`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    router.push('/admin');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-full">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending_approval':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!adminSession) return null;

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name}>
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              EVENT <span className="text-yellow-300">REGISTRATIONS</span>
            </h1>
            <p className="text-neutral-500 text-sm">
              {filteredRegistrations.length} of {Object.keys(registrations).length} registrations
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-all text-xs font-medium"
            >
              <Download className="w-3 h-3" /> CSV
            </button>
            <button
              onClick={() => exportData('excel')}
              className="flex items-center gap-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-xs font-medium"
            >
              <Download className="w-3 h-3" /> Excel
            </button>
            <button
              onClick={() => exportData('json')}
              className="flex items-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all text-xs font-medium"
            >
              <Download className="w-3 h-3" /> JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by team name, UID, pass ID, payment ID..."
              className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:border-yellow-300/50"
            >
              <option value="all" className="bg-black">All Status</option>
              <option value="pending_approval" className="bg-black">Pending</option>
              <option value="approved" className="bg-black">Approved</option>
              <option value="rejected" className="bg-black">Rejected</option>
              <option value="shortlisted" className="bg-black">Shortlisted Only</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="bg-black/50 border border-white/10 text-white rounded-xl py-2.5 px-4 text-sm appearance-none cursor-pointer focus:outline-none focus:border-yellow-300/50"
            >
              <option value="all" className="bg-black">All Types</option>
              <option value="individual" className="bg-black">Individual</option>
              <option value="team" className="bg-black">Team</option>
            </select>
          </div>
        </div>

        {/* Registrations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map(([regId, reg], idx) => (
              <motion.div
                key={regId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      reg.type === 'team' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {reg.type === 'team' ? <Users className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{reg.teamName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-neutral-500 text-xs capitalize">{reg.type}</span>
                        <span className="text-neutral-700">•</span>
                        <span className="text-neutral-500 text-xs">{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleShortlist(regId)}
                      className={`p-2 rounded-lg transition-all ${
                        reg.shortlisted 
                          ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300/30' 
                          : 'bg-white/5 text-neutral-600 hover:text-white border border-transparent'
                      }`}
                      title={reg.shortlisted ? "Un-shortlist Team" : "Shortlist Team"}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    {getStatusBadge(reg.status)}

                    {reg.status === 'pending_approval' && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleApprove(regId)}
                          className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(regId)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
                  <div className="bg-white/[0.02] rounded-lg p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Payment</p>
                    <p className="text-white text-xs font-bold flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-neutral-600" />
                      ₹{reg.payment?.amount || 0}
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
                        <div
                          key={mIdx}
                          className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 text-xs"
                        >
                          <div className="w-5 h-5 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-[10px] font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <span className="text-white">{member.name}</span>
                          <span className="text-neutral-500 font-mono">{member.uid}</span>
                          {member.firebaseId === reg.leaderId && (
                            <Shield className="w-3 h-3 text-yellow-300" />
                          )}
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
                      {' • '}
                      Paid: <span className="text-neutral-400">{new Date(reg.payment.paidAt).toLocaleString()}</span>
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
