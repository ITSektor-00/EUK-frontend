'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Učitavanje...</div> 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, [isAuthenticated, loading, user]);

  const checkUserStatus = async () => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) {
      setCheckingStatus(false);
      return;
    }

    // Proveri da li je korisnik aktivan
    if (!user.isActive) {
      alert("Vaš nalog čeka odobrenje od administratora.");
      router.push('/login');
      return;
    }

    setCheckingStatus(false);
  };

  if (loading || checkingStatus) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Ako korisnik nije aktivan, ne prikazuj sadržaj
  if (!user?.isActive) {
    return null;
  }

  return <>{children}</>;
}; 