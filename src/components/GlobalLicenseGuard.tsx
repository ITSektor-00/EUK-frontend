'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalLicense } from '../contexts/GlobalLicenseContext';
import { useAuth } from '../contexts/AuthContext';

interface GlobalLicenseGuardProps {
  children: React.ReactNode;
}

const GlobalLicenseGuard: React.FC<GlobalLicenseGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();
  const { 
    globalLicenseInfo, 
    loading, 
    error,
    isGlobalLicenseValid, 
    isGlobalLicenseExpired,
    checkGlobalLicense 
  } = useGlobalLicense();
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkGlobalLicenseStatus = async () => {
      // Proveri da li je korisnik autentifikovan pre provere globalne licence
      if (!isAuthenticated || !user?.id || !token) {
        setIsChecking(false);
        return;
      }

      try {
        await checkGlobalLicense();
      } catch (err) {
        console.error('Error checking global license:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkGlobalLicenseStatus();
  }, [checkGlobalLicense, isAuthenticated, user?.id, token]);

  // Prikaži loading dok se proverava globalna licenca
  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Proverava se globalna licenca...</p>
        </div>
      </div>
    );
  }

  // Ako korisnik nije autentifikovan, ne prikazuj grešku
  if (!isAuthenticated || !user?.id || !token) {
    return <>{children}</>;
  }

  // Ako je greška pri proveri globalne licence
  if (error && !error.includes('429') && !error.includes('Previše zahteva')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Greška pri proveri licence</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  // Ako globalna licenca nije važeća ili je istekla - ONEMOGUĆENO
  // if (!isGlobalLicenseValid || isGlobalLicenseExpired) {
  //   // Redirect na global-license-expired stranicu
  //   useEffect(() => {
  //     router.push('/global-license-expired');
  //   }, [router]);
  //   
  //   return null;
  // }

  // Ako je globalna licenca važeća, prikaži children
  return <>{children}</>;
};

export default GlobalLicenseGuard;
