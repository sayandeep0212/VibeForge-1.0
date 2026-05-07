'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, CheckCircle, Clock, Building2, MessageSquare } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface AdminSession {
  id: string;
  email: string;
  name: string;
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
        
        setAdminSession(data.user);
        fetchStats();
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) router.push('/admin');
      }
    };

    checkSession();
    return () => { mounted = false; };
  }, [router]);

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersSnap = await get(ref(getDb(), 'users'));
      let totalUsers = 0;
      let adamasStudents = 0;
      let otherStudents = 0;
      let shortlistedUsers = 0;

      if (usersSnap.exists()) {
        const users = usersSnap.val();
        totalUsers = Object.keys(users).length;
        Object.values(users).forEach((u) => {
          const user = u as { isAdamas?: boolean, shortlisted?: boolean };
          if (user.isAdamas) adamasStudents++;
          else otherStudents++;
          if (user.shortlisted) shortlistedUsers++;
        });
      }

      // Fetch registrations
      const regsSnap = await get(ref(getDb(), 'registrations'));
      let totalRegistrations = 0;
      let pendingApprovals = 0;
      let approvedTeams = 0;
      let shortlistedTeams = 0;

      if (regsSnap.exists()) {
        const regs = regsSnap.val();
        totalRegistrations = Object.keys(regs).length;
        Object.values(regs).forEach((r) => {
          const reg = r as { status: string, shortlisted?: boolean };
          if (reg.status === 'pending_approval') pendingApprovals++;
          if (reg.status === 'approved') approvedTeams++;
          if (reg.shortlisted) shortlistedTeams++;
        });
      }

      // Fetch inquiries
      const inqSnap = await get(ref(getDb(), 'inquiries'));
      let newInquiries = 0;
      if (inqSnap.exists()) {
        const inqs = inqSnap.val();
        Object.values(inqs).forEach((i) => {
          if ((i as any).status === 'new') newInquiries++;
        });
      }

      setStats({
        totalUsers,
        totalRegistrations,
        pendingApprovals,
        approvedTeams,
        adamasStudents,
        otherStudents,
        shortlistedUsers,
        shortlistedTeams,
        newInquiries,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/admin');
  };

  if (!adminSession) return null;

  const statCards = [
    { label: 'Total Profiles', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Registrations', value: stats.totalRegistrations, icon: ClipboardList, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Approved', value: stats.approvedTeams, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Adamas Students', value: stats.adamasStudents, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Other Colleges', value: stats.otherStudents, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Shortlisted Users', value: stats.shortlistedUsers, icon: Users, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20' },
    { label: 'Shortlisted Teams', value: stats.shortlistedTeams, icon: ClipboardList, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ];

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name || 'Admin'}>
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
