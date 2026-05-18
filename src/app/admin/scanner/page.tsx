'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Scan, Search, User, Shield, Users, 
  CheckCircle, AlertCircle, Loader2, X, RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

interface Member {
  name: string;
  uid: string;
  email: string;
  college?: string;
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
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState('');
  const [scanResult, setScanResult] = useState<Registration | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Refs for scanner lifecycle management
  const scannerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef<string>('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        
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

        if (mountedRef.current) {
          setAdminName(data.user.name);
          setPhotoURL(data.user.photoURL);
        }
      } catch (err) {
        console.error('Session check error:', err);
        if (mountedRef.current) router.push('/admin');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mountedRef.current = false;
      cleanupScanner();
    };
  }, [router]);

  // Safe scanner cleanup that never throws
  const cleanupScanner = useCallback(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      // Html5Qrcode states: NOT_STARTED=0, SCANNING=2, PAUSED=3
      const state = scanner.getState?.();
      if (state === 2 || state === 3) {
        scanner.stop().catch(() => {});
      }
    } catch {
      // getState() itself can throw if scanner is in a bad state — ignore
    }

    try {
      scanner.clear?.();
    } catch {
      // clear() can throw if DOM element is already gone — ignore
    }

    scannerRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    // Clean up any existing scanner first
    cleanupScanner();

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Ensure the DOM element exists
      const readerEl = document.getElementById('reader');
      if (!readerEl || !mountedRef.current) return;

      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.777,
        },
        (decodedText: string) => {
          // Prevent duplicate scans of the same code
          if (isProcessingRef.current) return;
          if (decodedText === lastScannedRef.current) return;

          isProcessingRef.current = true;
          lastScannedRef.current = decodedText;
          
          handleSearch(decodedText);
        },
        () => {
          // Scan failure fires every frame — intentionally silent
        }
      );

      if (mountedRef.current) {
        setIsCameraActive(true);
        setError('');
      }
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      if (mountedRef.current) {
        if (err?.message?.includes('Permission')) {
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (err?.message?.includes('NotFound') || err?.message?.includes('Requested device not found')) {
          setError('No camera found. Please connect a camera or use manual entry.');
        } else {
          setError('Could not access camera. Please check permissions or try manual entry.');
        }
        setIsCameraActive(false);
      }
    }
  }, [cleanupScanner]);

  const stopCamera = useCallback(async () => {
    cleanupScanner();
    if (mountedRef.current) {
      setIsCameraActive(false);
    }
  }, [cleanupScanner]);

  const handleSearch = async (id: string) => {
    const searchId = (id || manualId).trim();
    if (!searchId) return;

    setSearching(true);
    setError('');
    setScanResult(null);

    try {
      const res = await fetch(`/api/admin/check-in?id=${encodeURIComponent(searchId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Pass not found');
      }

      if (mountedRef.current) {
        setScanResult(data);

        // AUTOMATIC CHECK-IN: If it's a QR scan (not manual) and not already checked in
        if (id && !data.checkedIn && data.status === 'approved') {
          setTimeout(() => {
            autoCheckIn(data.id);
          }, 500);
        }
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      if (mountedRef.current) {
        setSearching(false);
      }
      // Allow scanning a new QR after a cooldown
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 3000);
    }
  };

  const autoCheckIn = async (regId: string) => {
    setCheckInLoading(true);
    try {
      const res = await fetch('/api/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regId })
      });

      if (res.ok && mountedRef.current) {
        setScanResult(prev => prev ? { ...prev, checkedIn: true, checkedInAt: Date.now(), checkedInBy: adminName } : null);
      }
    } catch (err) {
      console.error('Auto check-in failed:', err);
    } finally {
      if (mountedRef.current) setCheckInLoading(false);
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
        if (mountedRef.current) {
          setScanResult(prev => prev ? { ...prev, checkedIn: true, checkedInAt: Date.now() } : null);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Check-in failed');
      }
    } catch (err: any) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setCheckInLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setManualId('');
    // Reset scan lock so the same QR can be scanned again
    lastScannedRef.current = '';
    isProcessingRef.current = false;
  };

  if (loading) return null;

  return (
    <AdminLayout adminName={adminName} photoURL={photoURL} onLogout={() => router.push('/admin')}>
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
                <AlertCircle className="w-5 h-5 shrink-0" />
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
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-medium uppercase tracking-tight">{m.name}</span>
                            {m.college && <span className="text-neutral-500 text-[10px]">{m.college}</span>}
                          </div>
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
