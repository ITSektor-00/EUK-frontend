'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { globalLicenseService, GlobalLicenseInfo } from '../services/globalLicenseService';
import { useAuth } from './AuthContext';

interface GlobalLicenseContextType {
  globalLicenseInfo: GlobalLicenseInfo | null;
  loading: boolean;
  error: string | null;
  isGlobalLicenseValid: boolean;
  isGlobalLicenseExpired: boolean;
  isGlobalLicenseExpiringSoon: boolean;
  checkGlobalLicense: () => Promise<void>;
  refreshGlobalLicense: () => Promise<void>;
  getGlobalLicenseStatusMessage: () => string;
  getFormattedGlobalLicenseEndDate: () => string;
}

const GlobalLicenseContext = createContext<GlobalLicenseContextType | undefined>(undefined);

export const GlobalLicenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [globalLicenseInfo, setGlobalLicenseInfo] = useState<GlobalLicenseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedGlobalLicense = useRef(false);

  const checkGlobalLicense = useCallback(async () => {
    // ONEMOGUĆENO - ne proveravaj globalnu licencu automatski
    console.log('Global license check disabled');
    return;
    
    // Proveri da li je korisnik autentifikovan
    if (!isAuthenticated || !user?.id || !token) {
      setGlobalLicenseInfo(null);
      setError(null);
      return;
    }

    // Proveri da li je već u toku provera
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting global license check...');
      const licenseData = await globalLicenseService.checkGlobalLicenseStatus();
      console.log('Global license data received:', licenseData);
      console.log('Global license data details:', {
        hasValidLicense: licenseData.hasValidLicense,
        endDate: licenseData.endDate,
        daysUntilExpiry: licenseData.daysUntilExpiry,
        isExpiringSoon: licenseData.isExpiringSoon,
        notificationSent: licenseData.notificationSent,
        message: licenseData.message
      });
      setGlobalLicenseInfo(licenseData);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Greška pri proveri globalne licence';
      console.error('Global license check error:', err);
      console.error('Error details:', {
        message: errorMessage
      });
      
      // Ako je greška zbog rate limiting-a, ne postavljaj error
      if (errorMessage.includes('429') || errorMessage.includes('Previše zahteva')) {
        // Zadržavamo postojeće licence info i ne postavljamo error
        console.log('Rate limiting detected, keeping existing license info');
        return;
      }
      
      // Za ostale greške, postavi error
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loading, isAuthenticated, user?.id, token]);

  const refreshGlobalLicense = useCallback(async () => {
    // Očisti cache pre refresh-a
    globalLicenseService.clearGlobalLicenseCache();
    hasCheckedGlobalLicense.current = false;
    await checkGlobalLicense();
  }, [checkGlobalLicense]);

  // Proveri globalnu licencu kada se korisnik uloguje ili kada se promeni user - ONEMOGUĆENO
  // useEffect(() => {
  //   if (isAuthenticated && user?.id && token) {
  //     // Resetuj ref kada se promeni korisnik
  //     if (hasCheckedGlobalLicense.current) {
  //       hasCheckedGlobalLicense.current = false;
  //     }
  //     
  //     if (!hasCheckedGlobalLicense.current) {
  //       hasCheckedGlobalLicense.current = true;
  //       checkGlobalLicense();
  //     }
  //   } else {
  //     hasCheckedGlobalLicense.current = false;
  //     setGlobalLicenseInfo(null);
  //     setError(null);
  //   }
  // }, [isAuthenticated, user?.id, token, checkGlobalLicense]);

  // Automatska provera globalne licence svakih 30 minuta - ONEMOGUĆENO
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Proveri da li je korisnik autentifikovan pre automatske provere
  //     if (isAuthenticated && user?.id && token) {
  //       const lastCheck = localStorage.getItem('lastGlobalLicenseCheck');
  //       const now = Date.now();
  //       
  //       if (!lastCheck || (now - parseInt(lastCheck)) > 30 * 60 * 1000) {
  //         checkGlobalLicense();
  //         localStorage.setItem('lastGlobalLicenseCheck', now.toString());
  //       }
  //     }
  //   }, 30 * 60 * 1000);

  //   return () => clearInterval(interval);
  // }, [checkGlobalLicense, isAuthenticated, user?.id, token]);

  const isGlobalLicenseValid = globalLicenseInfo?.hasValidLicense || false;
  const isGlobalLicenseExpired = globalLicenseService.isGlobalLicenseExpired(globalLicenseInfo || {
    hasValidLicense: false,
    endDate: '',
    daysUntilExpiry: 0,
    isExpiringSoon: false,
    message: 'Лиценца није важећа'
  });
  const isGlobalLicenseExpiringSoon = globalLicenseService.isGlobalLicenseExpiringSoon(globalLicenseInfo || {
    hasValidLicense: false,
    endDate: '',
    daysUntilExpiry: 0,
    isExpiringSoon: false,
    message: 'Лиценца није важећа'
  });

  // Debug logovi za globalnu licencu status - samo kada se promeni globalLicenseInfo
  useEffect(() => {
    if (globalLicenseInfo) {
      console.log('GlobalLicenseContext status:', {
        globalLicenseInfo,
        isGlobalLicenseValid,
        isGlobalLicenseExpired,
        isGlobalLicenseExpiringSoon,
        notificationSent: globalLicenseInfo?.notificationSent
      });
    }
  }, [globalLicenseInfo, isGlobalLicenseValid, isGlobalLicenseExpired, isGlobalLicenseExpiringSoon]);

  const getGlobalLicenseStatusMessage = useCallback(() => {
    if (!globalLicenseInfo) {
      return 'Proverava se status globalne licence...';
    }
    return globalLicenseService.getGlobalLicenseStatusMessage(globalLicenseInfo);
  }, [globalLicenseInfo]);

  const getFormattedGlobalLicenseEndDate = useCallback(() => {
    if (!globalLicenseInfo?.endDate) {
      return 'Nepoznat datum';
    }
    return globalLicenseService.formatGlobalLicenseEndDate(globalLicenseInfo.endDate);
  }, [globalLicenseInfo]);

  const value: GlobalLicenseContextType = {
    globalLicenseInfo,
    loading,
    error,
    isGlobalLicenseValid,
    isGlobalLicenseExpired,
    isGlobalLicenseExpiringSoon,
    checkGlobalLicense,
    refreshGlobalLicense,
    getGlobalLicenseStatusMessage,
    getFormattedGlobalLicenseEndDate
  };

  return (
    <GlobalLicenseContext.Provider value={value}>
      {children}
    </GlobalLicenseContext.Provider>
  );
};

export const useGlobalLicense = () => {
  const context = useContext(GlobalLicenseContext);
  if (context === undefined) {
    throw new Error('useGlobalLicense must be used within a GlobalLicenseProvider');
  }
  return context;
};
