'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Camera, Loader2, Users, Star, Box } from 'lucide-react';
import { ref, get, push, set, remove } from 'firebase/database';
import { getDb } from '@/lib/firebase';
import { uploadToImgBB } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type Tab = 'judges' | 'faculty' | 'coreTeam' | 'sponsors';

export default function AdminContentPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('judges');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // Designation for judges/faculty, role for core team, branding type for sponsors
  const [imageURL, setImageURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

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
        setAdminName(data.user.name);
        fetchItems(activeTab);
      } catch (err) {
        console.error('Session check error:', err);
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
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || (!photoFile && !photoPreview)) {
      alert('Please fill out all required fields and upload an image.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageURL.trim();
      
      if (photoFile) {
        finalImageUrl = await uploadToImgBB(photoFile);
      }

      if (!finalImageUrl) {
        alert('Please provide an image URL or upload a file.');
        setSaving(false);
        return;
      }

      const itemRef = ref(getDb(), activeTab);
      const newItemRef = push(itemRef);

      const payload: any = {
        name: name.trim(),
        image: finalImageUrl,
      };

      if (activeTab === 'sponsors') {
        payload.brandingType = role.trim();
      } else {
        payload.role = role.trim(); // Designation or Role
        payload.socials = {
          linkedin: linkedin.trim(),
          facebook: facebook.trim(),
          instagram: instagram.trim(),
        };
      }

      await set(newItemRef, payload);

      // Reset form
      setName('');
      setRole('');
      setImageURL('');
      setPhotoFile(null);
      setPhotoPreview('');
      setLinkedin('');
      setFacebook('');
      setInstagram('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchItems(activeTab);
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await remove(ref(getDb(), `${activeTab}/${id}`));
      fetchItems(activeTab);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <AdminLayout adminName={adminName} onLogout={() => router.push('/admin')}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">
            CONTENT <span className="text-yellow-300">MANAGEMENT</span>
          </h1>
          <p className="text-neutral-500 text-sm">Manage website content: Judges, Team, and Sponsors</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('judges')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'judges' ? 'bg-yellow-300/10 text-yellow-300 border-b-2 border-yellow-300' : 'text-neutral-500 hover:text-white'}`}
          >
            <Star className="w-4 h-4" /> Judges
          </button>
          <button 
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'faculty' ? 'bg-yellow-300/10 text-yellow-300 border-b-2 border-yellow-300' : 'text-neutral-500 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Faculty
          </button>
          <button 
            onClick={() => setActiveTab('coreTeam')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'coreTeam' ? 'bg-yellow-300/10 text-yellow-300 border-b-2 border-yellow-300' : 'text-neutral-500 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Core Team
          </button>
          <button 
            onClick={() => setActiveTab('sponsors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'sponsors' ? 'bg-yellow-300/10 text-yellow-300 border-b-2 border-yellow-300' : 'text-neutral-500 hover:text-white'}`}
          >
            <Box className="w-4 h-4" /> Sponsors
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
              Add New {activeTab === 'judges' ? 'Judge' : activeTab === 'faculty' ? 'Faculty' : activeTab === 'coreTeam' ? 'Team Member' : 'Sponsor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-300/50 transition-colors cursor-pointer group overflow-hidden bg-black/40"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Camera className="w-8 h-8 text-neutral-500 group-hover:text-yellow-300 transition-colors mb-2" />
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Or Paste Image URL" 
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-xs"
                />
              </div>

              <input 
                type="text" 
                placeholder={activeTab === 'sponsors' ? "Brand Name" : "Full Name"} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm"
              />

              <input 
                type="text" 
                placeholder={activeTab === 'judges' ? "Designation" : activeTab === 'faculty' ? "Designation" : activeTab === 'coreTeam' ? "Role" : "Branding Type (e.g. Platinum, Gold)"} 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm"
              />

              {activeTab !== 'sponsors' && (
                <>
                  <input 
                    type="url" 
                    placeholder="LinkedIn URL (optional)" 
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm"
                  />
                  <input 
                    type="url" 
                    placeholder="Facebook URL (optional)" 
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm"
                  />
                  <input 
                    type="url" 
                    placeholder="Instagram URL (optional)" 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-300 transition-all text-sm"
                  />
                </>
              )}

              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Add Item'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-yellow-300 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-2xl">
                <p className="text-neutral-500 uppercase tracking-widest text-sm">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 flex gap-4 items-center group relative overflow-hidden"
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-white font-bold truncate">{item.name}</h3>
                      <p className="text-yellow-300 text-xs uppercase tracking-widest truncate">{item.role || item.brandingType}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all absolute right-4 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
