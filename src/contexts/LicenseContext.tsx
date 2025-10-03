'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { licenseService, LicenseInfo, LicenseCheckResponse } from '../services/licenseService';

interface LicenseContextType {
  licenseInfo: LicenseInfo | null;
  loading: boolean;
  error: string | null;
  isLicenseValid: boolean;
  isLicenseExpired: boolean;
  isLicenseExpiringSoon: boolean;
  checkLicense: () => Promise<void>;
  refreshLicense: () => Promise<void>;
  getStatusMessage: () => string;
  getFormattedEndDate: () => string;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedLicense = useRef(false);

  const checkLicense = useCallback(async () => {
    if (!user?.id || !token || !isAuthenticated) {
      setLicenseInfo(null);
      setError(null);
      return;
    }

    // Proveri da li je već u toku provera
    if (loading) {
      return;
    }

    // Uklonjena dodatna zaštita koja je sprečavala proveru licence

    try {
      setLoading(true);
      setError(null);
      
      const licenseData = await licenseService.checkLicenseStatus(user.id, token);
      setLicenseInfo(licenseData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Greška pri proveri licence';
      setError(errorMessage);
      console.error('License check error:', err);
      
      // Ako je greška zbog rate limiting-a, ne postavljaj default licence info
      if (errorMessage.includes('429') || errorMessage.includes('Previše zahteva')) {
        // Zadržavamo postojeće licence info i samo postavljamo error
        return;
      }
      
      // Postavi default licence info za ostale greške
      setLicenseInfo({
        hasValidLicense: false,
        endDate: '',
        daysUntilExpiry: 0,
        isExpiringSoon: false,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, isAuthenticated]); // Uklonjen loading da sprečimo beskonačnu petlju

  const refreshLicense = useCallback(async () => {
    // Očisti cache pre refresh-a samo ako je potrebno
    if (user?.id) {
      licenseService.clearUserLicenseCache(user.id);
    }
    hasCheckedLicense.current = false;
    await checkLicense();
  }, [user?.id]); // Uklonjen checkLicense iz dependency array-a

  // Proveri licencu kada se korisnik uloguje ili kada se promeni user
  useEffect(() => {
    if (isAuthenticated && user?.id && token) {
      // Resetuj ref kada se promeni korisnik
      if (hasCheckedLicense.current) {
        hasCheckedLicense.current = false;
      }
      
      if (!hasCheckedLicense.current) {
        hasCheckedLicense.current = true;
        checkLicense();
      }
    } else {
      hasCheckedLicense.current = false;
      setLicenseInfo(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, token]); // Uklonjen checkLicense iz dependency array-a da sprečimo beskonačnu petlju

  // Automatska provera licence svakih 15 minuta (smanjeno da izbegnemo rate limiting)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) {
      return;
    }

    // Ukloni automatsku proveru licence da se izbegnu HTTP 429 greške
    // Korisnik može ručno da proveri licencu kada je potrebno
    // const interval = setInterval(() => {
    //   const lastCheck = localStorage.getItem('lastLicenseCheck');
    //   const now = Date.now();
    //   
    //   if (!lastCheck || (now - parseInt(lastCheck)) > 20 * 60 * 1000) {
    //     checkLicense();
    //     localStorage.setItem('lastLicenseCheck', now.toString());
    //   }
    // }, 30 * 60 * 1000);

    // return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, token, checkLicense]);

  const isLicenseValid = licenseInfo?.hasValidLicense || false;
  const isLicenseExpired = licenseService.isLicenseExpired(licenseInfo || {
    hasValidLicense: false,
    endDate: '',
    daysUntilExpiry: 0,
    isExpiringSoon: false
  });

  const isLicenseExpiringSoon = licenseService.isLicenseExpiringSoon(licenseInfo || {
    hasValidLicense: false,
    endDate: '',
    daysUntilExpiry: 0,
    isExpiringSoon: false
  });


  const getStatusMessage = useCallback(() => {
    if (!licenseInfo) {
      return 'Proverava se status licence...';
    }
    return licenseService.getLicenseStatusMessage(licenseInfo);
  }, [licenseInfo]);

  const getFormattedEndDate = useCallback(() => {
    if (!licenseInfo?.endDate) {
      return 'Nepoznat datum';
    }
    return licenseService.formatEndDate(licenseInfo.endDate);
  }, [licenseInfo]);

  const value: LicenseContextType = {
    licenseInfo,
    loading,
    error,
    isLicenseValid,
    isLicenseExpired,
    isLicenseExpiringSoon,
    checkLicense,
    refreshLicense,
    getStatusMessage,
    getFormattedEndDate
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};
