'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Camera, Loader2, Users, Star, Box, Edit3, X, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { ref, get, push, set, remove, update } from 'firebase/database';
import { getDb, getFirebaseAuth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { uploadToImgBB } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type Tab = 'judges' | 'faculty' | 'coreTeam' | 'sponsors';

export default function AdminContentPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('judges');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  // Edit modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', displayOrder: 0 });
  const [editSaving, setEditSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

        setAdminName(data.user.name);
        setPhotoURL(data.user.photoURL);
        fetchItems(activeTab);
      } catch (err) {
        console.error('Session error:', err);
        router.push('/admin'); 
      }
    };
    checkSession();
  }, [router, activeTab]);

  const fetchItems = async (tab: Tab) => {
    setLoading(true);
    try {
      const snap = await get(ref(getDb(), tab));
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.keys(data).map(id => ({ id, ...data[id] }));
        list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setItems(list);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || (!photoFile && !imageURL.trim())) {
      alert('Please fill out all required fields and provide an image.');
      return;
    }
    setSaving(true);
    try {
      let finalImageUrl = imageURL.trim();
      if (photoFile) finalImageUrl = await uploadToImgBB(photoFile);
      if (!finalImageUrl) { alert('Please provide an image.'); setSaving(false); return; }

      const payload: any = { name: name.trim(), image: finalImageUrl, displayOrder };
      if (activeTab === 'sponsors') {
        payload.brandingType = role.trim();
      } else {
        payload.role = role.trim();
        payload.socials = { linkedin: linkedin.trim(), facebook: facebook.trim(), instagram: instagram.trim() };
      }

      const newItemRef = push(ref(getDb(), activeTab));
      await set(newItemRef, payload);

      // Reset form
      setName(''); setRole(''); setImageURL(''); setPhotoFile(null); setPhotoPreview('');
      setLinkedin(''); setFacebook(''); setInstagram(''); setDisplayOrder(items.length);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchItems(activeTab);
    } catch (err: any) {
      console.error('Error saving item:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        alert('Network error. Check your internet connection.');
      } else {
        alert(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await remove(ref(getDb(), `${activeTab}/${id}`));
      fetchItems(activeTab);
    } catch (err) { console.error('Error deleting:', err); }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, role: item.role || item.brandingType || '', displayOrder: item.displayOrder || 0 });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      const updates: any = { name: editForm.name.trim(), displayOrder: editForm.displayOrder };
      if (activeTab === 'sponsors') { updates.brandingType = editForm.role.trim(); }
      else { updates.role = editForm.role.trim(); }
      await update(ref(getDb(), `${activeTab}/${editingId}`), updates);
      setEditingId(null);
      fetchItems(activeTab);
    } catch (err) { console.error('Error editing:', err); }
    finally { setEditSaving(false); }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const idx = items.findIndex(i => i.id === id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= items.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    try {
      await update(ref(getDb(), `${activeTab}/${items[idx].id}`), { displayOrder: swapIdx });
      await update(ref(getDb(), `${activeTab}/${items[swapIdx].id}`), { displayOrder: idx });
      fetchItems(activeTab);
    } catch (err) { console.error('Error reordering:', err); }
  };

  const getTabLabel = (tab: Tab) => {
    const map: Record<Tab, string> = { judges: 'Judge', faculty: 'Spectator', coreTeam: 'Team Member', sponsors: 'Sponsor' };
    return map[tab];
  };

  return (
    <AdminLayout adminName={adminName} photoURL={photoURL} onLogout={() => router.push('/admin')}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">
            CONTENT <span className="text-yellow-300">MANAGEMENT</span>
          </h1>
          <p className="text-neutral-500 text-sm">Manage website content: Judges, Team, and Sponsors</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 border-b border-white/10 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {([
            { key: 'judges' as Tab, label: 'Judges', icon: Star },
            { key: 'faculty' as Tab, label: 'The Spectator', icon: Users },
            { key: 'coreTeam' as Tab, label: 'Core Team', icon: Users },
            { key: 'sponsors' as Tab, label: 'Sponsors', icon: Box },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-yellow-300/10 text-yellow-300 border-b-2 border-yellow-300' : 'text-neutral-500 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-1 h-fit w-full overflow-hidden">
            <h2 className="text-xl font-bold font-sans text-white mb-6 uppercase tracking-wider">ADD NEW {getTabLabel(activeTab)}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center mb-4">
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-300/50 transition-colors cursor-pointer group overflow-hidden bg-black/40">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Camera className="w-6 h-6 text-neutral-500 group-hover:text-yellow-300 transition-colors mb-1" />
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Upload</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>

              <input type="text" placeholder="Or Paste Image URL" value={imageURL} onChange={(e) => setImageURL(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-xs" />
              <input type="text" placeholder={activeTab === 'sponsors' ? "Brand Name" : "Full Name"} value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />
              <input type="text" placeholder={activeTab === 'judges' || activeTab === 'faculty' ? "Designation" : activeTab === 'coreTeam' ? "Role" : "Branding Type (e.g. Platinum, Gold)"}
                value={role} onChange={(e) => setRole(e.target.value)} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />

              <div>
                <label className="text-neutral-500 text-[10px] uppercase tracking-wider block mb-1">Display Order</label>
                <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} min={0}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />
              </div>

              {activeTab !== 'sponsors' && (
                <>
                  <input type="url" placeholder="LinkedIn URL (optional)" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />
                  <input type="url" placeholder="Facebook URL (optional)" value={facebook} onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />
                  <input type="url" placeholder="Instagram URL (optional)" value={instagram} onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm" />
                </>
              )}

              <button type="submit" disabled={saving}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving...' : '+ Add Item'}
              </button>
            </form>
          </div>

          {/* Cards List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-yellow-300 animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                <p className="text-neutral-500 uppercase tracking-widest text-sm">No items found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="bg-black/40 border border-white/10 rounded-2xl p-4 flex gap-4 items-center group hover:border-white/20 transition-all">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0}
                        className="p-1 text-neutral-600 hover:text-yellow-300 disabled:opacity-20 transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <span className="text-[10px] text-neutral-600 text-center font-mono">{item.displayOrder ?? idx}</span>
                      <button onClick={() => moveItem(item.id, 'down')} disabled={idx === items.length - 1}
                        className="p-1 text-neutral-600 hover:text-yellow-300 disabled:opacity-20 transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Image */}
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" />

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-white font-bold truncate" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>{item.name}</h3>
                      <p className="text-yellow-300/80 text-xs uppercase tracking-widest truncate">{item.role || item.brandingType}</p>
                      {item.socials && (item.socials.linkedin || item.socials.instagram) && (
                        <div className="flex gap-2 mt-1">
                          {item.socials.linkedin && <span className="text-[10px] text-blue-400">LinkedIn</span>}
                          {item.socials.instagram && <span className="text-[10px] text-pink-400">Instagram</span>}
                          {item.socials.facebook && <span className="text-[10px] text-blue-300">Facebook</span>}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="p-2 bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-yellow-300 rounded-lg transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold font-sans">Edit {getTabLabel(activeTab)}</h3>
                <button onClick={() => setEditingId(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">{activeTab === 'sponsors' ? 'Branding Type' : 'Designation / Role'}</label>
                  <input type="text" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>
                <div>
                  <label className="text-neutral-500 text-xs uppercase tracking-wider block mb-1">Display Order</label>
                  <input type="number" value={editForm.displayOrder} onChange={e => setEditForm(p => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-300/50" />
                </div>
                <button onClick={saveEdit} disabled={editSaving}
                  className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {editSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
