'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean; // If true, also requires profile to be complete
}

export default function AuthGuard({ children, requireProfile = false }: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/signin');
      } else if (requireProfile && (!userProfile || !userProfile.profileComplete)) {
        router.push('/profile/setup');
      }
    }
  }, [user, userProfile, loading, requireProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-yellow-300/30 border-t-yellow-300 rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireProfile && (!userProfile || !userProfile.profileComplete)) return null;

  return <>{children}</>;
}
