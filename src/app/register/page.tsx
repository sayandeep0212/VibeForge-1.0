'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, User as UserIcon, Shield, AlertTriangle, Loader2,
  CheckCircle, XCircle, Search, CreditCard, AlertCircle, Info, BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ref, get, set, push, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface MemberInfo {
  firebaseId: string;
  uid: string;
  name: string;
  email: string;
  college: string;
  isAdamas: boolean;
  photoURL: string;
  valid: boolean;
  error?: string;
}

export default function RegisterPage() {
  return (
    <AuthGuard requireProfile={true}>
      <RegisterContent />
    </AuthGuard>
  );
}

function RegisterContent() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const MAX_TEAMS = 150;

  const [participationType, setParticipationType] = useState<'individual' | 'team' | ''>('');
  const [teamName, setTeamName] = useState('');
  const [memberUIDs, setMemberUIDs] = useState<string[]>(['']);
  const [memberInfos, setMemberInfos] = useState<(MemberInfo | null)[]>([null]);
  const [validatingMember, setValidatingMember] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [isMemberOfTeam, setIsMemberOfTeam] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [registrationsFull, setRegistrationsFull] = useState(false);
  const [totalTeams, setTotalTeams] = useState(0);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('');

  // Check if user is already registered + check admin settings
  useEffect(() => {
    checkRegistrationStatus();
    checkAdminSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkAdminSettings = async () => {
    try {
      const snap = await get(ref(db!, 'eventSettings/registration'));
      if (snap.exists()) {
        const settings = snap.val();
        // Admin manually closed
        if (settings.isOpen === false) {
          setRegistrationClosed(true);
          setClosedReason('Registration has been closed by the organizers.');
          return;
        }
        // Deadline passed
        if (settings.deadline && Date.now() > settings.deadline) {
          setRegistrationClosed(true);
          setClosedReason('Registration deadline has passed.');
          return;
        }
      }
    } catch (err) {
      console.error('Error checking admin settings:', err);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user) return;
    setCheckingStatus(true);

    try {
      // Check if leader
      const leaderQuery = query(
        ref(db!, 'registrations'),
        orderByChild('leaderId'),
        equalTo(user.uid)
      );
      const leaderSnap = await get(leaderQuery);
      if (leaderSnap.exists()) {
        setAlreadyRegistered(true);
        setCheckingStatus(false);
        return;
      }

      // Check if member
      const allRegsSnap = await get(ref(db!, 'registrations'));
      if (allRegsSnap.exists()) {
        const allRegs = allRegsSnap.val();
        const regCount = Object.keys(allRegs).length;
        setTotalTeams(regCount);

        // Check 150 team limit
        if (regCount >= MAX_TEAMS) {
          setRegistrationsFull(true);
        }

        for (const regId in allRegs) {
          const reg = allRegs[regId];
          if (reg.members?.some((m: { firebaseId: string }) => m.firebaseId === user.uid)) {
            setAlreadyRegistered(true);
            setIsMemberOfTeam(true);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const validateMemberUID = async (uid: string, index: number) => {
    if (!uid.trim()) {
      const newInfos = [...memberInfos];
      newInfos[index] = null;
      setMemberInfos(newInfos);
      return;
    }

    setValidatingMember(index);

    try {
      // Search for user by public UID
      const usersRef = query(ref(db!, 'users'), orderByChild('uid'), equalTo(uid.trim()));
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        const newInfos = [...memberInfos];
        newInfos[index] = {
          firebaseId: '', uid: uid.trim(), name: '', email: '', college: '', isAdamas: false, photoURL: '',
          valid: false, error: 'No user found with this UID'
        };
        setMemberInfos(newInfos);
        return;
      }

      const userData = snapshot.val();
      const firebaseId = Object.keys(userData)[0];
      const userInfo = userData[firebaseId];

      // Check if same as current user
      if (firebaseId === user?.uid) {
        const newInfos = [...memberInfos];
        newInfos[index] = {
          firebaseId, uid: uid.trim(), name: userInfo.name, email: userInfo.email,
          college: userInfo.college, isAdamas: userInfo.isAdamas || false, photoURL: userInfo.photoURL,
          valid: false, error: 'You cannot add yourself as a member'
        };
        setMemberInfos(newInfos);
        return;
      }

      // UNIVERSITY RULE: Adamas leaders can only add Adamas members
      if (userProfile?.isAdamas && !userInfo.isAdamas) {
        const newInfos = [...memberInfos];
        newInfos[index] = {
          firebaseId, uid: uid.trim(), name: userInfo.name, email: userInfo.email,
          college: userInfo.college, isAdamas: userInfo.isAdamas || false, photoURL: userInfo.photoURL,
          valid: false, error: 'Adamas Leaders can only add fellow Adamas students'
        };
        setMemberInfos(newInfos);
        return;
      }

      // Check duplicate in current form
      const otherUIDs = memberUIDs.filter((_, i) => i !== index);
      if (otherUIDs.includes(uid.trim())) {
        const newInfos = [...memberInfos];
        newInfos[index] = {
          firebaseId, uid: uid.trim(), name: userInfo.name, email: userInfo.email,
          college: userInfo.college, isAdamas: userInfo.isAdamas || false, photoURL: userInfo.photoURL,
          valid: false, error: 'This member is already added'
        };
        setMemberInfos(newInfos);
        return;
      }

      // Check if already registered in any team
      const allRegsSnap = await get(ref(db!, 'registrations'));
      if (allRegsSnap.exists()) {
        const allRegs = allRegsSnap.val();
        for (const regId in allRegs) {
          const reg = allRegs[regId];
          if (reg.leaderId === firebaseId || reg.members?.some((m: { firebaseId: string }) => m.firebaseId === firebaseId)) {
            const newInfos = [...memberInfos];
            newInfos[index] = {
              firebaseId, uid: uid.trim(), name: userInfo.name, email: userInfo.email,
              college: userInfo.college, isAdamas: userInfo.isAdamas || false, photoURL: userInfo.photoURL,
              valid: false, error: 'This user is already registered in another team'
            };
            setMemberInfos(newInfos);
            return;
          }
        }
      }

      // Valid member
      const newInfos = [...memberInfos];
      newInfos[index] = {
        firebaseId, uid: uid.trim(), name: userInfo.name, email: userInfo.email,
        college: userInfo.college, isAdamas: userInfo.isAdamas || false, photoURL: userInfo.photoURL,
        valid: true
      };
      setMemberInfos(newInfos);
    } catch (err) {
      console.error('Error validating member:', err);
      const newInfos = [...memberInfos];
      newInfos[index] = {
        firebaseId: '', uid: uid.trim(), name: '', email: '', college: '', isAdamas: false, photoURL: '',
        valid: false, error: 'Error validating UID'
      };
      setMemberInfos(newInfos);
    } finally {
      setValidatingMember(null);
    }
  };

  const addMemberSlot = () => {
    if (memberUIDs.length < 2) {
      setMemberUIDs([...memberUIDs, '']);
      setMemberInfos([...memberInfos, null]);
    }
  };

  const removeMemberSlot = (index: number) => {
    const newUIDs = memberUIDs.filter((_, i) => i !== index);
    const newInfos = memberInfos.filter((_, i) => i !== index);
    setMemberUIDs(newUIDs);
    setMemberInfos(newInfos);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handlePayment = async () => {
    setError('');

    if (!teamName.trim()) {
      setError('Please enter a team name.');
      return;
    }

    if (participationType === 'team') {
      const validMembers = memberInfos.filter((m) => m !== null && m.valid);
      if (validMembers.length === 0) {
        setError('Please add at least one valid team member.');
        return;
      }
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Pricing: Adamas Team = 150 (Total), Non-Adamas Team = 250 (Total)
      const baseAmount = userProfile?.isAdamas ? 150 : 250;

      const receipt = `RCPT-${nanoid(8).toUpperCase()}`;

      // 1. Create order on server (server applies processing fee)
      const orderRes = await fetch('/api/register/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: baseAmount }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VibeForge 1.0',
        description: `Event Registration - ${participationType === 'team' ? 'Team' : 'Individual'} (incl. processing fee)`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 2. Verify on server and save
          await verifyAndSave(response, orderData.baseAmount, orderData.totalAmount, orderData.processingFee, receipt);
        },
        prefill: {
          name: userProfile?.name,
          email: userProfile?.email,
          contact: userProfile?.phone,
        },
        theme: {
          color: '#FDE047',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const verifyAndSave = async (razorpayResponse: any, baseAmount: number, totalAmount: number, processingFee: number, receipt: string) => {
    if (!user || !userProfile) return;

    try {
      // Build members list
      const members = [
        {
          firebaseId: user.uid,
          uid: userProfile.uid,
          name: userProfile.name,
          email: userProfile.email,
        },
      ];

      if (participationType === 'team') {
        const validMembers = memberInfos.filter((m) => m !== null && m.valid) as MemberInfo[];
        for (const member of validMembers) {
          members.push({
            firebaseId: member.firebaseId,
            uid: member.uid,
            name: member.name,
            email: member.email,
          });
        }
      }

      const registrationData = {
        teamName: teamName.trim(),
        type: participationType,
        leaderId: user.uid,
        leaderUid: userProfile.uid,
        members,
        amount: baseAmount,
        totalAmount,
        processingFee,
        receipt,
      };

      // Call verify API
      const verifyRes = await fetch('/api/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          registrationData,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.error || 'Verification failed');
      }

      // Email is now handled by the server-side verify API

      setPaymentSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Error verifying registration:', err);
      setError(err.message || 'Payment verified but registration failed. Please contact support.');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Checking status...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />

      <div className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-300/3 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-red-500/3 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 pt-32 pb-20 px-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white mb-2 text-center">
              EVENT <span className="text-red-400">REGISTRATION</span>
            </h1>
            <p className="text-neutral-400 text-center mb-8 text-sm">
              Register for VibeForge 1.0 — The Ninja Awakening
            </p>

            {/* Already Registered */}
            {alreadyRegistered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center"
              >
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Already Registered</h2>
                <p className="text-neutral-400 text-sm mb-4">
                  {isMemberOfTeam
                    ? 'You are already added as a member of a team. You cannot register again.'
                    : 'You have already registered for this event. Registration is blocked for duplicate entries.'}
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}

            {/* Payment Success */}
            {paymentSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-3xl p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
                <p className="text-neutral-400 text-sm mb-2">
                  Your registration has been submitted. You&apos;ll receive a confirmation email shortly.
                </p>
                <p className="text-yellow-300 text-sm mb-6">
                  Your pass will be generated once an admin approves your registration.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/rules')}
                    className="w-full sm:w-auto px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    SEE EVENT RULES
                  </button>
                </div>
              </motion.div>
            )}

            {/* Registrations Full - 150 team cap */}
            {registrationsFull && !alreadyRegistered && !paymentSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center"
              >
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">REGISTRATIONS FULL</h2>
                <p className="text-neutral-400 text-sm mb-2">
                  All <span className="text-white font-bold">{MAX_TEAMS}</span> team slots have been filled.
                  Registration is now closed.
                </p>
                <p className="text-neutral-500 text-xs mb-4">
                  {totalTeams} / {MAX_TEAMS} teams registered
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Back to Home
                </button>
              </motion.div>
            )}

            {/* Registration Closed by Admin or Deadline */}
            {registrationClosed && !registrationsFull && !alreadyRegistered && !paymentSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center"
              >
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">REGISTRATION CLOSED</h2>
                <p className="text-neutral-400 text-sm mb-4">
                  {closedReason}
                </p>
                <p className="text-neutral-500 text-xs mb-4">
                  If you&apos;ve already registered, visit your Dashboard to view your pass.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}

            {/* Registration Form */}
            {!alreadyRegistered && !paymentSuccess && !registrationsFull && !registrationClosed && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                {/* Warning Banner */}
                <div className="mb-6 p-4 bg-yellow-300/5 border border-yellow-300/20 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-sm font-bold">Important Notice</p>
                    <p className="text-neutral-400 text-xs mt-1">
                      If you are in anyone&apos;s team as a member, <strong className="text-white">do NOT fill this registration form</strong>. 
                      Your team leader will add you using your UID. If you are already registered (individually or as a team member), registration will be blocked.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Participation Type Selection */}
                <div className="mb-6">
                  <p className="text-neutral-400 text-sm mb-3 uppercase tracking-wider font-bold">Participation Type</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setParticipationType('individual'); setMemberUIDs([]); setMemberInfos([]); }}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        participationType === 'individual'
                          ? 'bg-yellow-300/10 border-yellow-300/30 text-yellow-300'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <UserIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold text-sm">Individual</p>
                      <p className="text-xs mt-1 opacity-60">Solo warrior</p>
                    </button>
                    <button
                      onClick={() => { setParticipationType('team'); setMemberUIDs(['']); setMemberInfos([null]); }}
                      className={`p-4 rounded-xl border transition-all text-center ${
                        participationType === 'team'
                          ? 'bg-yellow-300/10 border-yellow-300/30 text-yellow-300'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold text-sm">Team</p>
                      <p className="text-xs mt-1 opacity-60">Max 3 members</p>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {participationType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Team Name */}
                      <div>
                        <label className="text-neutral-400 text-sm mb-2 block uppercase tracking-wider font-bold">
                          Team Name
                        </label>
                        <input
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="Enter your team name"
                          disabled={loading}
                          className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50"
                        />
                      </div>

                      {/* Leader Info */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
                          {participationType === 'team' ? '👑 Team Leader (You)' : '⚔️ Participant (You)'}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            {userProfile?.photoURL ? (
                              <img src={userProfile.photoURL} alt="You" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-yellow-300/10 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-yellow-300/50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold">{userProfile?.name}</p>
                            <p className="text-yellow-300/60 text-xs font-mono">{userProfile?.uid}</p>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      {participationType === 'team' && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-neutral-400 text-sm uppercase tracking-wider font-bold">
                              Team Members
                            </p>
                            <p className="text-neutral-600 text-xs">
                              {memberUIDs.length}/2 additional members
                            </p>
                          </div>

                          <div className="space-y-4">
                            {memberUIDs.map((uid, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                      <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                      type="text"
                                      value={uid}
                                      onChange={(e) => {
                                        const newUIDs = [...memberUIDs];
                                        newUIDs[index] = e.target.value;
                                        setMemberUIDs(newUIDs);
                                      }}
                                      onBlur={() => validateMemberUID(uid, index)}
                                      placeholder="Enter member UID (e.g., GL-XXXXXX)"
                                      disabled={loading}
                                      className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-yellow-300/50 focus:ring-1 focus:ring-yellow-300/50 transition-all placeholder:text-neutral-600 disabled:opacity-50 text-sm font-mono"
                                    />
                                    {validatingMember === index && (
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                  {memberUIDs.length > 1 && (
                                    <button
                                      onClick={() => removeMemberSlot(index)}
                                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                {/* Member validation result */}
                                {memberInfos[index] && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-xl border ${
                                      memberInfos[index]!.valid
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-red-500/5 border-red-500/20'
                                    }`}
                                  >
                                    {memberInfos[index]!.valid ? (
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-green-500/30">
                                          {memberInfos[index]!.photoURL ? (
                                            <img src={memberInfos[index]!.photoURL} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full bg-green-500/10 flex items-center justify-center">
                                              <UserIcon className="w-4 h-4 text-green-400" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-white text-sm font-medium">{memberInfos[index]!.name}</p>
                                            <CheckCircle className="w-3 h-3 text-green-400" />
                                          </div>
                                          <p className="text-neutral-500 text-xs">{memberInfos[index]!.college}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        {memberInfos[index]!.error}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            ))}

                            {memberUIDs.length < 2 && (
                              <button
                                onClick={addMemberSlot}
                                className="w-full py-2 border border-dashed border-white/10 hover:border-yellow-300/30 text-neutral-500 hover:text-yellow-300 rounded-xl transition-all text-sm"
                              >
                                + Add Another Member
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pricing Summary */}
                      {(() => {
                        const basePrice = userProfile?.isAdamas ? 150 : 250;
                        const totalPrice = Math.ceil(basePrice / 0.9764);
                        const fee = totalPrice - basePrice;
                        return (
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-400">Team Type</span>
                              <span className="text-white">{userProfile?.isAdamas ? 'Adamas University' : 'External Team'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-400">Registration Fee</span>
                              <span className="text-white">₹{basePrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-400 flex items-center gap-1">
                                Payment Processing Fee
                                <Info className="w-3 h-3 text-neutral-500" />
                              </span>
                              <span className="text-neutral-300">+ ₹{fee}</span>
                            </div>
                            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                              <span className="text-yellow-300 font-bold uppercase tracking-widest text-xs">Total Payable</span>
                              <span className="text-2xl font-black text-white">₹{totalPrice}</span>
                            </div>
                            <p className="text-[9px] text-neutral-500 leading-relaxed">
                              A small processing fee is added to cover payment gateway charges by Razorpay, so the full registration amount reaches the organizers.
                            </p>
                          </div>
                        );
                      })()}

                      {userProfile?.isAdamas && participationType === 'team' && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-2">
                          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-cyan-300 leading-relaxed font-orbitron">
                            Adamas Team Special: Flat ₹150 for the entire team (all members must be from Adamas).
                          </p>
                        </div>
                      )}

                      {/* Payment Button */}
                      {(() => {
                        const basePrice = userProfile?.isAdamas ? 150 : 250;
                        const totalPrice = Math.ceil(basePrice / 0.9764);
                        return (
                          <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-yellow-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-red-400 text-black py-4 rounded-xl font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(253,224,71,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                PROCESSING...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-5 h-5" />
                                PAY ₹{totalPrice} & REGISTER
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
