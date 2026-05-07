'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, GraduationCap, BookOpen, Hash,
  Shield, Users, Trophy, LogOut, Copy, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EventPass from '@/components/EventPass';
import EditProfileModal from '@/components/EditProfileModal';
import { Settings as SettingsIcon } from 'lucide-react';

interface Registration {
  teamName: string;
  type: 'individual' | 'team';
  leaderId: string;
  leaderUid: string;
  members: Array<{
    firebaseId: string;
    uid: string;
    name: string;
    email: string;
  }>;
  payment: {
    razorpayId: string;
    amount: number;
    status: string;
    receipt: string;
    paidAt: number;
  };
  status: 'pending_approval' | 'approved' | 'rejected';
  passId?: string;
  shortlisted?: boolean;
  createdAt: number;
}

export default function DashboardPage() {
  return (
    <AuthGuard requireProfile={true}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, userProfile, signOutUser } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [teamRegistration, setTeamRegistration] = useState<Registration | null>(null);
  const [regLoading, setRegLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchRegistration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRegistration = async () => {
    if (!user || !userProfile) return;
    setRegLoading(true);

    try {
      // Check if user is a leader of any registration
      const leaderQuery = query(
        ref(db, 'registrations'),
        orderByChild('leaderId'),
        equalTo(user.uid)
      );
      const leaderSnapshot = await get(leaderQuery);

      if (leaderSnapshot.exists()) {
        const data = leaderSnapshot.val();
        const key = Object.keys(data)[0];
        setRegistration(data[key]);
        setRegLoading(false);
        return;
      }

      // Check if user is a member of any team
      const allRegsSnapshot = await get(ref(db, 'registrations'));
      if (allRegsSnapshot.exists()) {
        const allRegs = allRegsSnapshot.val();
        for (const regId in allRegs) {
          const reg = allRegs[regId] as Registration;
          if (reg.members?.some((m) => m.firebaseId === user.uid)) {
            setTeamRegistration(reg);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching registration:', error);
    } finally {
      setRegLoading(false);
    }
  };

  const copyUID = () => {
    if (userProfile?.uid) {
      navigator.clipboard.writeText(userProfile.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const currentRegistration = registration || teamRegistration;
  const isLeader = registration !== null;
  const isRegistered = currentRegistration !== null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending_approval': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending_approval': return <Clock className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const isShortlisted = currentRegistration?.shortlisted || userProfile?.shortlisted;

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />

      <div className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/backgrounds/dashboardbg.jpg" 
            alt="Dashboard Background" 
            fill
            className="object-cover opacity-70 brightness-[0.8]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">
                WARRIOR <span className="text-red-400">DASHBOARD</span>
              </h1>
              <p className="text-neutral-400 text-sm mt-1">Welcome back, {userProfile?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {isShortlisted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-300/10 border border-yellow-300/30 text-yellow-300 rounded-xl font-black italic tracking-tighter text-sm animate-pulse">
                  <Trophy className="w-4 h-4" />
                  SHORTLISTED
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-400 rounded-xl transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-red-400 to-yellow-300" />

                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full border-2 border-yellow-300/30 overflow-hidden mb-4">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-yellow-300/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-yellow-300/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <h2 className="text-lg font-bold text-white mb-1">{userProfile?.name}</h2>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[10px] text-yellow-300/60 uppercase tracking-widest font-bold hover:text-yellow-300 transition-colors mb-2"
                    >
                      Edit Profile
                    </button>
                  </div>

                  {/* UID Badge */}
                  <button
                    onClick={copyUID}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-300/10 border border-yellow-300/20 rounded-full text-yellow-300 font-mono text-sm font-bold tracking-wider mb-4 hover:bg-yellow-300/20 transition-colors group"
                  >
                    <Shield className="w-4 h-4" />
                    {userProfile?.uid}
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>

                  <div className="w-full space-y-3 text-left text-sm">
                    <div className="flex items-center gap-3 text-neutral-400">
                      <Mail className="w-4 h-4 text-neutral-600" />
                      <span className="truncate">{userProfile?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <Phone className="w-4 h-4 text-neutral-600" />
                      <span>{userProfile?.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <Building2 className="w-4 h-4 text-neutral-600" />
                      <span>{userProfile?.college}</span>
                    </div>
                    {userProfile?.isAdamas && userProfile?.registrationNumber && (
                      <div className="flex items-center gap-3 text-neutral-400">
                        <Hash className="w-4 h-4 text-neutral-600" />
                        <span>{userProfile.registrationNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-neutral-400">
                      <GraduationCap className="w-4 h-4 text-neutral-600" />
                      <span>{userProfile?.year}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <BookOpen className="w-4 h-4 text-neutral-600" />
                      <span>{userProfile?.program}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Registration Status */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  Event Registration
                </h3>

                {regLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className={`flex items-center gap-2 ${getStatusColor(currentRegistration!.status)}`}>
                      {getStatusIcon(currentRegistration!.status)}
                      <span className="font-bold uppercase tracking-wider text-sm">
                        {currentRegistration!.status === 'pending_approval'
                          ? 'Pending Approval'
                          : currentRegistration!.status}
                      </span>
                    </div>

                    {/* Team Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Team Name</p>
                        <p className="text-white font-bold">{currentRegistration!.teamName}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Type</p>
                        <p className="text-white font-bold capitalize">{currentRegistration!.type}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Role</p>
                        <p className="text-white font-bold">{isLeader ? '👑 Leader' : '⚔️ Member'}</p>
                      </div>
                      {currentRegistration!.payment && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Payment</p>
                          <p className="text-green-400 font-bold">₹{currentRegistration!.payment.amount} — Paid</p>
                        </div>
                      )}
                    </div>

                    {/* Members */}
                    {currentRegistration!.members && currentRegistration!.members.length > 0 && (
                      <div>
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Team Members</p>
                        <div className="space-y-2">
                          {currentRegistration!.members.map((member, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-xs font-bold">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {member.name}
                                  {member.firebaseId === currentRegistration!.leaderId && (
                                    <span className="ml-2 text-yellow-300 text-xs">👑 Leader</span>
                                  )}
                                </p>
                                <p className="text-neutral-500 text-xs font-mono">{member.uid}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Receipt */}
                    {currentRegistration!.payment?.receipt && (
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Payment Receipt</p>
                        <p className="text-white font-mono text-sm">{currentRegistration!.payment.receipt}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400 mb-4">You haven&apos;t registered for the event yet.</p>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black rounded-xl font-bold tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(253,224,71,0.3)]"
                    >
                      REGISTER NOW
                    </Link>
                  </div>
                )}
              </div>

              {/* Event Pass - Only show if approved */}
              {currentRegistration?.status === 'approved' && currentRegistration.passId && (
                <EventPass
                  passId={currentRegistration.passId}
                  teamName={currentRegistration.teamName}
                  type={currentRegistration.type}
                  members={currentRegistration.members}
                  leaderName={
                    currentRegistration.members?.find(
                      (m) => m.firebaseId === currentRegistration.leaderId
                    )?.name || ''
                  }
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      {userProfile && user && (
        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={userProfile}
          firebaseUid={user.uid}
          onSuccess={async () => {
            await refreshProfile();
          }}
        />
      )}
    </main>
  );
}
