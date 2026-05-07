'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Clock, Search, Filter, Trash2, CheckCircle, MessageSquare } from 'lucide-react';
import { ref, get, remove, update } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: number;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (!data.isLoggedIn) {
          router.push('/admin');
          return;
        }
        setAdminName(data.user.name);
        fetchInquiries();
      } catch (err) {
        console.error('Session check error:', err);
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const fetchInquiries = async () => {
    try {
      const snap = await get(ref(getDb(), 'inquiries'));
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.keys(data).map(id => ({
          id,
          ...data[id]
        })).sort((a, b) => b.createdAt - a.createdAt);
        setInquiries(list);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await update(ref(getDb(), `inquiries/${id}`), { status: 'read' });
      fetchInquiries();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await remove(ref(getDb(), `inquiries/${id}`));
      fetchInquiries();
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || inq.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout adminName={adminName} onLogout={() => router.push('/admin')}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">
            USER <span className="text-yellow-300">INQUIRIES</span>
          </h1>
          <p className="text-neutral-500 text-sm">Manage messages and contact requests from the website</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text"
              placeholder="Search by name, email or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-yellow-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-neutral-500 mr-2" />
            {(['all', 'new', 'read', 'replied'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-yellow-300 text-black' 
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredInquiries.map((inq, idx) => (
              <motion.div
                key={inq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white/5 border ${inq.status === 'new' ? 'border-yellow-300/30 shadow-[0_0_20px_rgba(253,224,71,0.05)]' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden group`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${inq.status === 'new' ? 'bg-yellow-300 animate-pulse' : 'bg-neutral-600'}`} />
                      <h3 className="font-bold text-white uppercase tracking-tight">{inq.name}</h3>
                      <span className="text-neutral-600 text-xs px-2 py-0.5 border border-white/5 rounded-md uppercase tracking-widest">{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${inq.email}`} className="hover:text-yellow-300 transition-colors">{inq.email}</a>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                      <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end">
                    {inq.status === 'new' && (
                      <button 
                        onClick={() => markAsRead(inq.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-300/10 text-yellow-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-300 hover:text-black transition-all"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-4 h-4" /> READ
                      </button>
                    )}
                    <button 
                      onClick={() => deleteInquiry(inq.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 font-bold uppercase tracking-widest">No inquiries found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
