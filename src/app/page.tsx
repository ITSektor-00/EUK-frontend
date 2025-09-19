'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import Branding from '@/components/Branding';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Ako je korisnik već prijavljen, preusmeri na odgovarajući dashboard
    if (!loading && isAuthenticated) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Ako se još uvek uvek učitava ili je korisnik prijavljen, prikaži loading
  if (loading || isAuthenticated) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Branding />
      
      <div className="card w-full">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-center text-gray-900 mb-1`}>
          Добродошли у ЕУК платформу
        </h2>
        <p className="text-center text-gray-700 mb-3">
          Изаберите опцију за приступ систему
        </p>
        
        <div className="space-y-2">
          <button 
            onClick={() => router.push('/login')}
            className="btn btn-primary w-full"
          >
            Пријави се
          </button>
          
          <button 
            onClick={() => router.push('/register')}
            className="btn btn-secondary w-full"
          >
            Региструј се
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
