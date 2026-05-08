'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, ClipboardList, Settings, LogOut, Shield, MessageSquare, Image as ImageIcon, Scan, Menu, X, ShoppingBag
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  adminName: string;
}

export default function AdminLayout({ children, onLogout, adminName }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', href: '/admin/scanner', icon: Scan },
    { name: 'Participants', href: '/admin/participants', icon: Users },
    { name: 'Registrations', href: '/admin/registrations', icon: ClipboardList },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Merch', href: '/admin/merch', icon: ShoppingBag },
    { name: 'Content', href: '/admin/content', icon: ImageIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
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

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-300/10 flex items-center justify-center text-yellow-300 text-xs font-bold">
              {adminName?.charAt(0) || 'A'}
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
