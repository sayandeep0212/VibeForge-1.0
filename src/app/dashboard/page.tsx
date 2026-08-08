'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, GraduationCap, BookOpen, Hash,
  Shield, Users, Trophy, LogOut, Copy, CheckCircle, Clock, XCircle,
  ShoppingBag, Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EventPass from '@/components/EventPass';
import EditProfileModal from '@/components/EditProfileModal';
import FoodCoupon from '@/components/FoodCoupon';
import { Settings as SettingsIcon, Utensils } from 'lucide-react';

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
  shortlisted?: boolean;
}

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
    method?: string;
    paidAt: number;
  };
  status: 'pending_approval' | 'approved' | 'rejected';
  passId?: string;
  bookingId?: string;
  shortlisted?: boolean;
  checkedIn?: boolean;
  createdAt: number;
}

interface MerchOrder {
  id: string;
  productType: 't-shirt' | 'cap';
  color: string;
  size?: string;
  amount: number;
  payment: {
    razorpayId: string;
    paidAt: number;
  };
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
  const { user, userProfile, signOutUser, refreshProfile } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [teamRegistration, setTeamRegistration] = useState<Registration | null>(null);
  const [regLoading, setRegLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[]>([]);
  const [merchLoading, setMerchLoading] = useState(true);

  useEffect(() => {
    fetchRegistration();
    fetchMerchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const fetchMerchOrders = async () => {
    if (!userProfile?.uid) return;
    setMerchLoading(true);
    try {
      const res = await fetch(`/api/user/merch-orders?uid=${userProfile.uid}`);
      if (!res.ok) throw new Error('Could not fetch merch orders');
      const data = await res.json();
      if (data && !data.error) setMerchOrders(data);
    } catch (error) {
      console.error('Error fetching merch orders:', error);
    } finally {
      setMerchLoading(false);
    }
  };

  const fetchRegistration = async () => {
    if (!user || !userProfile) return;
    setRegLoading(true);

    try {
      // Check if user is a leader of any registration
      const leaderQuery = query(
        ref(db!, 'registrations'),
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
      const allRegsSnapshot = await get(ref(db!, 'registrations'));
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
        <div className="fixed top-24 sm:top-0 left-0 w-full h-[55vh] sm:h-full z-0 pointer-events-none">
          <div className="block sm:hidden absolute inset-0">
            <Image 
              src="/backgrounds/dashboardbgphone.jpeg" 
              alt="Dashboard Background Phone" 
              fill
              className="object-cover object-center opacity-90"
              priority
            />
          </div>
          <div className="hidden sm:block absolute inset-0">
            <Image 
              src="/backgrounds/dashboardbgpc.png" 
              alt="Dashboard Background PC" 
              fill
              className="object-cover object-center opacity-90"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />
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
                          ? 'Online Selection Round'
                          : currentRegistration!.status === 'approved'
                          ? 'Selected & Approved'
                          : currentRegistration!.status === 'rejected'
                          ? 'Eliminated'
                          : currentRegistration!.status}
                      </span>
                    </div>

                    {/* Selection Round Status Message */}
                    {currentRegistration!.status === 'pending_approval' && (
                      <div className="p-4 bg-yellow-300/5 border border-yellow-300/20 rounded-xl">
                        <p className="text-yellow-300 text-sm font-bold mb-1">⏳ Under Evaluation</p>
                        <p className="text-neutral-400 text-xs leading-relaxed">
                          Your registration is complete{currentRegistration!.payment?.method !== 'free' ? ' and payment is verified' : ''}. Your team is currently being evaluated in the Online Selection Round. If selected, you will receive your Event Pass and approval notification via email.
                        </p>
                      </div>
                    )}
                    {currentRegistration!.status === 'rejected' && (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-sm font-bold mb-1">Not Selected</p>
                        <p className="text-neutral-400 text-xs leading-relaxed">
                          Unfortunately, your team was not selected in the Online Selection Round. You will not receive an event pass for the offline event. Thank you for participating — we hope to see you in future events!
                        </p>
                      </div>
                    )}

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
                          {currentRegistration!.payment.method === 'free' || currentRegistration!.payment.amount === 0 ? (
                            <p className="text-green-400 font-bold">FREE — Adamas University</p>
                          ) : (
                            <p className="text-green-400 font-bold">₹{currentRegistration!.payment.amount} — Paid</p>
                          )}
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
                    {currentRegistration!.payment?.receipt && currentRegistration!.payment.receipt !== 'N/A' && currentRegistration!.payment.method !== 'free' && (
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
                    <div
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold tracking-widest cursor-not-allowed select-none shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                      REGISTRATION CLOSED
                    </div>
                  </div>
                )}
              </div>

              {/* Merch Orders */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-yellow-300" />
                  My Merchandise
                </h3>

                {merchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
                  </div>
                ) : merchOrders.length > 0 ? (
                  <div className="space-y-4">
                    {merchOrders.map((order) => (
                      <div key={order.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-white font-bold uppercase italic tracking-tighter">
                              {order.productType} — {order.color} {order.size ? `(${order.size})` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-300 font-black italic">₹{order.amount}</p>
                            <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">{order.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            PAID: {order.payment.razorpayId}
                          </div>
                          <Link
                            href={`/merch?success=${order.id}`}
                            className="flex items-center gap-2 text-[10px] text-yellow-300 font-bold uppercase hover:text-white transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            View Receipt
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400 mb-4">You haven&apos;t purchased any merch yet.</p>
                    <Link
                      href="/merch"
                      className="text-yellow-300 font-bold text-sm hover:underline"
                    >
                      Browse Merch Store
                    </Link>
                  </div>
                )}
              </div>

              {/* Food Coupon - Show to anyone if checked in */}
              {currentRegistration?.checkedIn && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-yellow-300" />
                    Food Coupon
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">
                    You have successfully checked in! Here is your official food coupon for the event. 
                    Please show this at the food counter.
                  </p>
                  
                  <FoodCoupon 
                    userName={userProfile?.name || ''} 
                    userUid={userProfile?.uid || ''} 
                  />
                </div>
              )}

              {/* Event Pass - Show to all registered members when approved */}
              {isRegistered && currentRegistration?.status === 'approved' && currentRegistration.passId && (() => {
                // Find the leader's name from the members list (correct for both leader & non-leader views)
                const leaderMember = currentRegistration.members?.find(
                  (m) => m.firebaseId === currentRegistration.leaderId
                );
                const leaderName = leaderMember?.name || userProfile?.name || '';
                return (
                  <EventPass
                    passId={currentRegistration.passId!}
                    bookingId={currentRegistration.bookingId}
                    teamName={currentRegistration.teamName}
                    type={currentRegistration.type}
                    members={currentRegistration.members}
                    leaderName={leaderName}
                  />
                );
              })()}
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
