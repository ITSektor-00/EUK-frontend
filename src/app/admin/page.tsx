'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, loading, user } = useAuth();

  useEffect(() => {
    // Optimizovano - koristi cache ako je dostupan
    if (!loading || user) {
      if (isAdmin || user?.role === 'ADMIN') {
        router.push('/admin/korisnici');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, isAdmin, loading, user]);

  // Smanjen loading screen - prikaži kratko
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}
