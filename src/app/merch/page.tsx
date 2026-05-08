'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, CheckCircle, CreditCard, Loader2, AlertCircle,
  Download, ChevronRight, User, Mail, Phone, Info
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'Lavender', value: 'lavender', hex: '#E6E6FA' },
  { name: 'White', value: 'white', hex: '#FFFFFF' }
];

function MerchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const { user, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'t-shirt' | 'cap'>('t-shirt');
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [prices, setPrices] = useState({ 
    tshirtPrice: 499, 
    capPrice: 299,
    merchEnabled: true,
    stock: {
      tshirt: { black: true, white: true, lavender: true },
      cap: { black: true, white: true, lavender: true }
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile) {
      setUserData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (typeParam === 't-shirt' || typeParam === 'cap') {
      setActiveTab(typeParam as 't-shirt' | 'cap');
    }
  }, [typeParam]);

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    const successId = searchParams.get('success');
    if (successId) {
      fetchOrder(successId);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/merch/order?id=${id}`);
      const data = await res.json();
      if (!data.error) {
        setSuccessOrder({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          productType: data.productType,
          color: data.color,
          size: data.size,
          amount: data.amount,
          paymentId: data.payment.razorpayId,
          date: new Date(data.createdAt).toLocaleString(),
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/merch/settings');
      const data = await res.json();
      if (!data.error) setPrices(data);
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in to purchase merchandise.');
      router.push(`/login?redirect=/merch?type=${activeTab}`);
      return;
    }

    if (!userData.name || !userData.email || !userData.phone) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      const amount = activeTab === 't-shirt' ? prices.tshirtPrice : prices.capPrice;

      const orderRes = await fetch('/api/merch/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, productType: activeTab }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VibeForge Merch',
        description: `Buying ${activeTab} (${selectedColor}${activeTab === 't-shirt' ? `, ${selectedSize}` : ''})`,
        order_id: orderData.id,
        handler: async function (response: any) {
          await verifyPayment(response, orderData, amount);
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        theme: { color: '#FDE047' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const verifyPayment = async (rzpResponse: any, orderData: any, amount: number) => {
    try {
      const res = await fetch('/api/merch/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          orderData: {
            ...userData,
            productType: activeTab,
            color: selectedColor,
            size: activeTab === 't-shirt' ? selectedSize : undefined,
            amount,
            receipt: orderData.receipt,
            uid: userProfile?.uid,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Verification failed');

      setSuccessOrder({
        id: result.orderId,
        ...userData,
        productType: activeTab,
        color: selectedColor,
        size: activeTab === 't-shirt' ? selectedSize : undefined,
        amount,
        paymentId: rzpResponse.razorpay_payment_id,
        date: new Date().toLocaleString(),
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Payment verified but saving failed. Please contact support.');
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      // Ensure the receipt is temporarily visible for capture but positioned off-screen
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `receipt-${successOrder.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading receipt:', err);
    }
  };

  const getPreviewImage = () => {
    if (activeTab === 'cap') {
      if (selectedColor === 'black') return '/Merch/caps/blackcap.png';
      if (selectedColor === 'lavender') return '/Merch/caps/lavendercap.png';
      if (selectedColor === 'white') return '/Merch/caps/whitecap.png';
    }
    // Placeholder for t-shirts
    return `https://placehold.co/600x600/1a1a1a/white?text=${selectedColor.toUpperCase()}+TSHIRT`;
  };

  if (successOrder) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <Navbar />
        <div className="max-w-md w-full pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Purchase Successful!</h2>
            <p className="text-neutral-400 text-sm mb-8">Thank you for your order. You can download your receipt below.</p>

            {/* Hidden Receipt for Capturing - Using simplified styles to avoid HTML2Canvas errors */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              <div
                ref={receiptRef}
                style={{
                  padding: '40px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  width: '500px',
                  border: '4px solid #fde047',
                  fontFamily: 'sans-serif'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                  <div>
                    <h1 style={{ fontSize: '30px', fontWeight: '900', fontStyle: 'italic', margin: 0, color: '#fde047' }}>VIBEFORGE 1.0</h1>
                    <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '2px', margin: '5px 0' }}>Merchandise Receipt</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', color: '#737373', textTransform: 'uppercase', margin: 0 }}>Order ID</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: '5px 0' }}>{successOrder.id}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#737373', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Customer</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{successOrder.name}</p>
                      <p style={{ fontSize: '12px', color: '#a3a3a3', margin: 0 }}>{successOrder.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', color: '#737373', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Date</p>
                      <p style={{ fontSize: '14px', margin: 0 }}>{successOrder.date}</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #262626', borderBottom: '1px solid #262626', padding: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase', margin: 0 }}>{successOrder.productType}</p>
                        <p style={{ fontSize: '12px', color: '#a3a3a3', margin: '5px 0 0 0' }}>Color: {successOrder.color} {successOrder.size ? `| Size: ${successOrder.size}` : ''}</p>
                      </div>
                      <p style={{ fontSize: '20px', fontWeight: '900', color: '#fde047', margin: 0 }}>₹{successOrder.amount}</p>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#171717', padding: '16px', borderRadius: '12px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: '#737373' }}>Payment ID</span>
                    <span style={{ fontFamily: 'monospace' }}>{successOrder.paymentId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#737373' }}>Status</span>
                    <span style={{ color: '#4ade80', fontWeight: 'bold', textTransform: 'uppercase' }}>Paid</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', color: '#525252', textTransform: 'uppercase', letterSpacing: '3px' }}>GameLiminals &copy; 2026</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black italic tracking-tighter transition-all hover:scale-105"
              >
                <Download className="w-5 h-5" /> DOWNLOAD RECEIPT
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full text-neutral-500 hover:text-white text-sm font-bold transition-colors"
              >
                GO TO DASHBOARD
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-300/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Left: Product Selection */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                OFFICIAL <span className="text-yellow-300">MERCH</span>
              </h1>
              <p className="text-neutral-400 text-lg mb-12 max-w-xl">
                Gear up with VibeForge 1.0 limited edition apparel. High-quality fabric, premium prints, and the ultimate gamer vibe.
              </p>

              {/* Tabs - Only show if no type is pre-selected or allow switching */}
              <div className="flex gap-4 mb-8">
                {['t-shirt', 'cap'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type as any)}
                    className={`px-8 py-4 rounded-2xl font-black italic tracking-tighter uppercase transition-all ${activeTab === type
                        ? 'bg-yellow-300 text-black scale-105 shadow-[0_0_30px_rgba(253,224,71,0.3)]'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Product Preview */}
              <div className="relative aspect-square w-full max-w-2xl bg-neutral-900/50 border border-white/5 rounded-[40px] overflow-hidden flex items-center justify-center p-8 mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeTab}-${selectedColor}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    src={getPreviewImage()}
                    alt="Preview"
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  />
                </AnimatePresence>

                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold mb-1">Price</p>
                    <p className="text-4xl font-black text-white italic">₹{activeTab === 't-shirt' ? prices.tshirtPrice : prices.capPrice}</p>
                  </div>
                  <div className="bg-yellow-300/10 border border-yellow-300/20 px-4 py-2 rounded-xl backdrop-blur-md">
                    <p className="text-yellow-300 text-[10px] font-bold uppercase tracking-widest">In Stock</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Customization & Form */}
          <div className="w-full lg:w-[450px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl"
            >
              <form onSubmit={handlePayment} className="space-y-8">

                {/* Color Selection */}
                <div>
                  <p className="text-neutral-400 text-xs uppercase tracking-[0.2em] font-bold mb-4">Choose Color</p>
                  <div className="flex gap-4">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color.value
                            ? 'border-yellow-300 scale-110 shadow-[0_0_15px_rgba(253,224,71,0.5)]'
                            : 'border-white/10 hover:border-white/30'
                          }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor === color.value && (
                          <div className={`w-2 h-2 rounded-full ${color.value === 'white' ? 'bg-black' : 'bg-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection (T-Shirt Only) */}
                {activeTab === 't-shirt' && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-[0.2em] font-bold mb-4">Select Size</p>
                    <div className="flex flex-wrap gap-3">
                      {TSHIRT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 rounded-xl border transition-all font-black text-sm ${selectedSize === size
                              ? 'bg-white text-black border-white'
                              : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/30'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-white/5" />

                {/* User Details */}
                <div className="space-y-4">
                  <p className="text-neutral-400 text-xs uppercase tracking-[0.2em] font-bold">Delivery Info</p>

                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-yellow-300 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
                    />
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-yellow-300 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={userData.email}
                      readOnly={!!user}
                      onChange={(e) => !user && setUserData({ ...userData, email: e.target.value })}
                      className={`w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm ${!!user ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-yellow-300 transition-colors" />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-300/50 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Store Closed Message */}
                {!prices.merchEnabled && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> The merch store is currently closed.
                  </div>
                )}

                {/* Out of Stock Message */}
                {prices.merchEnabled && !prices.stock[activeTab === 't-shirt' ? 'tshirt' : 'cap'][selectedColor as keyof typeof prices.stock.tshirt] && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 text-orange-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> This variant is currently out of stock.
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !prices.merchEnabled || !prices.stock[activeTab === 't-shirt' ? 'tshirt' : 'cap'][selectedColor as keyof typeof prices.stock.tshirt]}
                  className="w-full group bg-yellow-300 hover:bg-yellow-400 text-black py-5 rounded-[20px] font-black italic tracking-tighter uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : !prices.merchEnabled ? (
                    'STORE CLOSED'
                  ) : !prices.stock[activeTab === 't-shirt' ? 'tshirt' : 'cap'][selectedColor as keyof typeof prices.stock.tshirt] ? (
                    'OUT OF STOCK'
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> PAY NOW ₹{activeTab === 't-shirt' ? prices.tshirtPrice : prices.capPrice}
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Info className="w-5 h-5 text-neutral-500 shrink-0" />
                  <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-wider">
                    Secured by Razorpay. All purchases are final. Items will be delivered to the university desk.
                  </p>
                </div>

              </form>
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function MerchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-yellow-300" /></div>}>
      <MerchContent />
    </Suspense>
  );
}
