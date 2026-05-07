'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Scan, Search, User, Shield, Users, 
  CheckCircle, AlertCircle, Loader2, X, RefreshCw
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

interface Member {
  name: string;
  uid: string;
  email: string;
}

interface Registration {
  id: string;
  teamName: string;
  type: 'individual' | 'team';
  leaderId: string;
  members: Member[];
  status: string;
  passId: string;
  bookingId?: string;
  checkedIn?: boolean;
  checkedInAt?: number;
  checkedInBy?: string;
}

export default function AdminScannerPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState('');
  const [scanResult, setScanResult] = useState<Registration | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }
        setAdminName(data.user.name);
        setLoading(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [router]);

  const startCamera = async () => {
    try {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        
        scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
        setIsCameraActive(true);
      });
    } catch (err) {
      console.error("Failed to start camera", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error("Failed to stop camera", err);
      }
    }
  };

  async function onScanSuccess(decodedText: string) {
    if (searching) return;
    handleSearch(decodedText);
  }

  function onScanFailure(error: any) {
    // Quietly handle scan failure (it fires every frame if no QR is found)
  }

  const handleSearch = async (id: string) => {
    const searchId = id || manualId;
    if (!searchId.trim()) return;

    setSearching(true);
    setError('');
    setScanResult(null);

    try {
      const res = await fetch(`/api/admin/check-in?id=${encodeURIComponent(searchId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Pass not found');
      }

      setScanResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scanResult || scanResult.checkedIn) return;

    setCheckInLoading(true);
    try {
      const res = await fetch('/api/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regId: scanResult.id })
      });

      if (res.ok) {
        setScanResult(prev => prev ? { ...prev, checkedIn: true, checkedInAt: Date.now() } : null);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Check-in failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setManualId('');
  };

  if (loading) return null;

  return (
    <AdminLayout adminName={adminName} onLogout={() => router.push('/admin')}>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">
            PASS <span className="text-yellow-300">SCANNER</span>
          </h1>
          <p className="text-neutral-500 text-sm">Verify booking IDs and check-in participants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Scanner & Input */}
          <div className="space-y-6">
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 overflow-hidden">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-yellow-300" />
                Live Camera Scan
              </h2>
              
              <div className="relative aspect-video rounded-2xl border border-white/10 bg-black/60 overflow-hidden group">
                <div id="reader" className="w-full h-full" />
                
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all group-hover:bg-black/20">
                    <button 
                      onClick={startCamera}
                      className="bg-yellow-300 hover:bg-yellow-400 text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(253,224,71,0.2)] transition-all active:scale-95"
                    >
                      START CAMERA
                    </button>
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mt-4">
                      Browser permission required
                    </p>
                  </div>
                )}

                {isCameraActive && (
                  <button 
                    onClick={stopCamera}
                    className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-xl backdrop-blur-md border border-red-500/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest mt-4 text-center">
                Point camera at the pass QR code
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-6">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-yellow-300" />
                Manual Entry
              </h2>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('')}
                  placeholder="Enter Booking ID or Pass ID..."
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm font-mono"
                />
                <button 
                  onClick={() => handleSearch('')}
                  disabled={searching}
                  className="bg-yellow-300 hover:bg-yellow-400 text-black px-6 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'FIND'}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Side: Result Details */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {scanResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    {scanResult.checkedIn ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">Checked In</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-300/20 border border-yellow-300/40 rounded-full">
                        <RefreshCw className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
                        <span className="text-yellow-300 text-[10px] font-black uppercase tracking-widest">Ready</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] font-bold">Registration Found</p>
                    <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">{scanResult.teamName}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1">Booking ID</p>
                      <p className="text-cyan-400 font-mono font-bold text-sm uppercase">{scanResult.bookingId || 'N/A'}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1">Type</p>
                      <p className="text-white font-bold text-sm capitalize flex items-center gap-2">
                        {scanResult.type === 'team' ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        {scanResult.type}
                      </p>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="space-y-3">
                    <p className="text-neutral-500 text-[10px] uppercase font-bold flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Team Members
                    </p>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {scanResult.members.map((m, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                          <span className="text-white text-sm font-medium uppercase tracking-tight">{m.name}</span>
                          <span className="text-neutral-500 text-[10px] font-mono">{m.uid}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Check-in Info */}
                  {scanResult.checkedIn && (
                    <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 space-y-1">
                      <p className="text-green-400/60 text-[10px] uppercase font-bold">Check-in Details</p>
                      <p className="text-green-400 text-xs">
                        Checked in at {new Date(scanResult.checkedInAt!).toLocaleTimeString()} on {new Date(scanResult.checkedInAt!).toLocaleDateString()}
                      </p>
                      <p className="text-green-400/80 text-[10px]">Verified by {scanResult.checkedInBy}</p>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    {!scanResult.checkedIn && (
                      <button 
                        onClick={handleCheckIn}
                        disabled={checkInLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {checkInLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        CONFIRM CHECK-IN
                      </button>
                    )}
                    <button 
                      onClick={resetScanner}
                      className="px-6 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white rounded-2xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/2 border border-white/5 border-dashed rounded-[2.5rem]">
                  <Scan className="w-16 h-16 text-neutral-800 mb-4" />
                  <p className="text-neutral-600 font-bold uppercase tracking-widest text-sm">Waiting for Scan...</p>
                  <p className="text-neutral-700 text-xs mt-2 max-w-xs">Scan a QR code or enter a Booking ID to see team details and perform check-in.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
