'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface AdminQuickAccessProps {
  redirectTo?: string;
}

export default function AdminQuickAccess({ redirectTo = '/admin/korisnici' }: AdminQuickAccessProps) {
  const router = useRouter();
  const { isAdmin, user, loading } = useAuth();

  useEffect(() => {
    // Optimizovano prebacivanje - koristi cache podatke
    if (!loading) {
      if (isAdmin || user?.role === 'ADMIN') {
        router.push(redirectTo);
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAdmin, user, loading, router, redirectTo]);

  // Minimalni loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavam admin panel...</p>
        </div>
      </div>
    );
  }

  return null;
}
