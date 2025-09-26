'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ 
  children, 
  fallback,
  redirectTo = '/license-expired' 
}) => {
  const { isAuthenticated, user, token } = useAuth();
  const { 
    licenseInfo, 
    loading, 
    isLicenseValid, 
    isLicenseExpired, 
    checkLicense 
  } = useLicense();
  
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const performLicenseCheck = async () => {
      // Ako korisnik nije ulogovan, ne proveravaj licencu
      if (!isAuthenticated || !user?.id || !token) {
        setIsChecking(false);
        setHasChecked(true);
        return;
      }

      // Ako već imamo licence info i nije loading, koristi postojeće
      if (licenseInfo && !loading) {
        setIsChecking(false);
        setHasChecked(true);
        return;
      }

      // Proveri licencu
      try {
        await checkLicense();
      } catch (error) {
        console.error('Greška pri proveri licence:', error);
        // U slučaju greške, tretiraj kao isteklu licencu
      } finally {
        setIsChecking(false);
        setHasChecked(true);
      }
    };

    performLicenseCheck();
  }, [isAuthenticated, user?.id, token, licenseInfo, loading, checkLicense]);

  // Ako se još uvek proverava, prikaži loading
  if (isChecking || !hasChecked) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Proverava se licenca...</p>
        </div>
      </div>
    );
  }

  // Ako korisnik nije ulogovan, dozvoli pristup (auth guard će se pobrinuti za to)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Ako licenca nije važeća, preusmeri na license-expired stranicu
  if (isLicenseExpired || !isLicenseValid) {
    // Koristi setTimeout da izbegneš hydration greške
    setTimeout(() => {
      router.push(redirectTo);
    }, 0);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preusmeravanje...</p>
        </div>
      </div>
    );
  }

  // Ako je licenca važeća, prikaži sadržaj
  return <>{children}</>;
};

export default LicenseGuard;
