'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, ClipboardList, Settings, LogOut, Shield, MessageSquare, Image as ImageIcon, Scan, Menu, X, ShoppingBag
} from 'lucide-react';
import { getFirebaseAuth, getDb } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  adminName: string;
  photoURL?: string;
}

export default function AdminLayout({ children, onLogout, adminName, photoURL }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAdmins, setActiveAdmins] = useState<any[]>([]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getDb();
    
    let isConnected = false;
    let currentUserUid: string | null = null;
    let presenceRefInstance: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserUid = user.uid;
        updatePresence();
      } else {
        currentUserUid = null;
      }
    });

    const connectedRef = ref(db, '.info/connected');
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      isConnected = snap.val() === true;
      if (isConnected && currentUserUid) {
        updatePresence();
      }
    });

    function updatePresence() {
      if (!currentUserUid || !isConnected) return;
      
      const myPresenceRef = ref(db, `admin_presence/${currentUserUid}`);
      presenceRefInstance = onDisconnect(myPresenceRef);
      
      presenceRefInstance.set({
        status: 'offline',
        lastActive: serverTimestamp(),
        name: adminName,
      }).catch((err: any) => console.error("onDisconnect error:", err));

      set(myPresenceRef, {
        status: 'online',
        lastActive: serverTimestamp(),
        name: adminName,
        path: pathname
      }).catch((err: any) => console.error("Presence set error:", err));
    }

    const presenceRef = ref(db, 'admin_presence');
    const unsubscribePresence = onValue(presenceRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const admins = Object.keys(data).map(key => ({
          uid: key,
          ...data[key]
        }));
        setActiveAdmins(admins);
      } else {
        setActiveAdmins([]);
      }
    }, (error: any) => {
      console.error("Presence read error:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeConnected();
      unsubscribePresence();
    };
  }, [adminName, pathname]);

  const getReadablePath = (path: string) => {
    if (path === '/admin/dashboard') return 'Dashboard';
    if (path === '/admin/scanner') return 'Scanner';
    if (path === '/admin/entries') return 'Entries';
    if (path === '/admin/participants') return 'Participants';
    if (path === '/admin/registrations') return 'Registrations';
    if (path === '/admin/inquiries') return 'Inquiries';
    if (path === '/admin/merch') return 'Merch';
    if (path === '/admin/content') return 'Content';
    if (path === '/admin/settings') return 'Settings';
    return 'Admin Panel';
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', href: '/admin/scanner', icon: Scan },
    { name: 'Entries', href: '/admin/entries', icon: ClipboardList },
    { name: 'Participants', href: '/admin/participants', icon: Users },
    { name: 'Registrations', href: '/admin/registrations', icon: ClipboardList },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Merch', href: '/admin/merch', icon: ShoppingBag },
    { name: 'Content', href: '/admin/content', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth on the client side
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      
      if (user) {
        const db = getDb();
        await set(ref(db, `admin_presence/${user.uid}`), {
          status: 'offline',
          lastActive: serverTimestamp(),
          name: adminName
        });
      }
      
      await signOut(auth);
      
      // Clear the admin session cookie
      await fetch('/api/admin/logout', { method: 'POST' });
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback: still call onLogout to clear local state
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-yellow-300" />
          <span className="text-sm font-black tracking-wider text-white">ADMIN PANEL</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-black/95 border-r border-white/5 flex flex-col fixed h-[calc(100vh-65px)] md:h-screen z-40 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-[65px]' : '-translate-x-full top-[65px]'} md:top-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-yellow-300" />
            <div>
              <h1 className="text-sm font-black tracking-wider text-white">ADMIN PANEL</h1>
              <p className="text-[10px] text-neutral-600 tracking-widest uppercase">VIBEFORGE 1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-300/10 text-yellow-300 border border-yellow-300/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Active Admins */}
        <div className="flex-1 overflow-y-auto px-4 py-2 mt-4 custom-scrollbar min-h-[150px]">
          <h3 className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-3 px-2">Online Admins</h3>
          
          {activeAdmins.filter(a => a.status === 'online').length > 0 ? (
            <div className="space-y-3">
              {activeAdmins
                .filter(a => a.status === 'online')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(admin => (
                <div key={admin.uid} className="flex items-center gap-3 px-2">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/5 flex items-center justify-center text-xs font-bold text-neutral-400">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{admin.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {admin.path === pathname ? 'Here with you' : getReadablePath(admin.path)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-2 text-xs text-neutral-600 italic">No one else is online</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-xs font-bold overflow-hidden border border-white/10">
              {photoURL ? (
                <img src={photoURL} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                adminName?.charAt(0) || 'A'
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate">{adminName || 'Admin'}</p>
              <p className="text-neutral-600 text-[10px] uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-[100vw]">
        {children}
      </main>
    </div>
  );
}
