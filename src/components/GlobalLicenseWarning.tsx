'use client';

import React, { useState, useMemo } from 'react';
import { useGlobalLicense } from '../contexts/GlobalLicenseContext';

interface GlobalLicenseWarningProps {
  className?: string;
}

const GlobalLicenseWarning: React.FC<GlobalLicenseWarningProps> = ({ className = '' }) => {
  const { 
    globalLicenseInfo, 
    loading, 
    error,
    isGlobalLicenseExpired, 
    isGlobalLicenseExpiringSoon, 
    getGlobalLicenseStatusMessage 
  } = useGlobalLicense();
  
  const [isDismissed, setIsDismissed] = useState(false);

  // Debug logovi - samo kada se promeni globalLicenseInfo
  const debugInfo = useMemo(() => ({
    globalLicenseInfo,
    loading,
    error,
    isGlobalLicenseExpired,
    isGlobalLicenseExpiringSoon,
    notificationSent: globalLicenseInfo?.notificationSent,
    hasValidLicense: globalLicenseInfo?.hasValidLicense,
    endDate: globalLicenseInfo?.endDate
  }), [globalLicenseInfo, loading, error, isGlobalLicenseExpired, isGlobalLicenseExpiringSoon]);
  

  const warningColor = useMemo(() => {
    if (isGlobalLicenseExpired) {
      return {
        bg: 'bg-red-500',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        icon: '⚠️'
      };
    }
    
    if (isGlobalLicenseExpiringSoon) {
      return {
        bg: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        text: 'text-white',
        icon: '⏰'
      };
    }
    
    // Ako je notificationSent: true ali licenca nije istekla
    if (globalLicenseInfo?.notificationSent) {
      return {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        text: 'text-white',
        icon: '🔔'
      };
    }
    
    return null;
  }, [isGlobalLicenseExpired, isGlobalLicenseExpiringSoon, globalLicenseInfo?.notificationSent]);

  // Ne prikazuj ako je loading
  if (loading) {
    return null;
  }

  // Ne prikazuj ako je greška zbog rate limiting-a
  if (error && (error.includes('429') || error.includes('Previše zahteva'))) {
    return null;
  }

  // Ne prikazuj ako je dismissed
  if (isDismissed) {
    return null;
  }

  // Prikaži ako je globalna licenca istekla ili ističe uskoro - ONEMOGUĆENO
  // if (!globalLicenseInfo) {
  //   console.log('GlobalLicenseWarning: Not showing - no global license info');
  //   return null;
  // }

  // // Ako je globalna licenca istekla, uvek prikaži upozorenje
  // if (isGlobalLicenseExpired) {
  //   console.log('GlobalLicenseWarning: Showing - global license expired');
  // } else if (isGlobalLicenseExpiringSoon) {
  //   console.log('GlobalLicenseWarning: Showing - global license expiring soon');
  // } else if (globalLicenseInfo.notificationSent) {
  //   console.log('GlobalLicenseWarning: Showing - notification sent');
  // } else {
  //   console.log('GlobalLicenseWarning: Not showing - no valid conditions');
  //   return null;
  // }
  
  // ONEMOGUĆENO - ne prikazuj upozorenje
  return null;
};

export default GlobalLicenseWarning;
