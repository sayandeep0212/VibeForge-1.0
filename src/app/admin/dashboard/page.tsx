'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, CheckCircle, Clock, Building2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

interface AdminSession {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
    approvedTeams: 0,
    adamasStudents: 0,
    otherStudents: 0,
    shortlistedUsers: 0,
    shortlistedTeams: 0,
    checkedInTeams: 0,
    newInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        
        if (!mounted) return;

        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }
        
        // Ensure Firebase Auth is synced with the session
        const auth = getFirebaseAuth();
        if (!auth.currentUser && data.token) {
          try {
            await signInWithCustomToken(auth, data.token);
          } catch (signInErr) {
            console.error('Firebase sync error:', signInErr);
          }
        }

        setAdminSession(data.user);
        fetchStats();
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) router.push('/admin');
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (mounted && !data.error) {
            setStats(data);
            setLoading(false);
          }
        } else {
          throw new Error("Response was not JSON");
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    checkSession();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => { 
      mounted = false;
      clearInterval(interval);
    };
  }, [router]);

  const handleLogout = () => {
    router.push('/admin');
  };

  if (!adminSession) return null;

  const statCards = [
    { label: 'Total Profiles', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Registrations', value: stats.totalRegistrations, icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Pending Selection', value: stats.pendingApprovals, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Selected Teams', value: stats.approvedTeams, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Adamas Students', value: stats.adamasStudents, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Other Colleges', value: stats.otherStudents, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Shortlisted Users', value: stats.shortlistedUsers, icon: Users, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20' },
    { label: 'Shortlisted Teams', value: stats.shortlistedTeams, icon: ClipboardList, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20' },
    { label: 'Checked In', value: stats.checkedInTeams || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ];

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name || 'Admin'} photoURL={adminSession.photoURL}>
      <div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1">
          ADMIN <span className="text-yellow-300">DASHBOARD</span>
        </h1>
        <p className="text-neutral-500 text-sm mb-8">Overview of VIBEFORGE 1.0 event</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${card.bg} border ${card.border} rounded-2xl p-6 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                    <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                  <card.icon className={`w-10 h-10 ${card.color} opacity-30`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
