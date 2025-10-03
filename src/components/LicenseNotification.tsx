'use client';

import React, { useState, useMemo } from 'react';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseNotificationProps {
  className?: string;
}

const LicenseNotification: React.FC<LicenseNotificationProps> = ({ className = '' }) => {
  const { 
    licenseInfo, 
    loading, 
    error,
    isLicenseExpired, 
    isLicenseExpiringSoon, 
    getStatusMessage 
  } = useLicense();
  
  const [isOpen, setIsOpen] = useState(false);

  // Debug logovi - samo kada se promeni licenceInfo
  const debugInfo = useMemo(() => ({
    licenseInfo,
    loading,
    error,
    isLicenseExpired,
    isLicenseExpiringSoon,
    notificationSent: licenseInfo?.notificationSent,
    hasValidLicense: licenseInfo?.hasValidLicense,
    endDate: licenseInfo?.endDate
  }), [licenseInfo, loading, error, isLicenseExpired, isLicenseExpiringSoon]);
  

  const notificationColor = useMemo(() => {
    if (isLicenseExpired) {
      return {
        bg: 'bg-red-500',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        icon: '⚠️'
      };
    }
    
    if (isLicenseExpiringSoon) {
      return {
        bg: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        text: 'text-white',
        icon: '⏰'
      };
    }
    
    // Ako je notificationSent: true ali licenca nije istekla
    if (licenseInfo?.notificationSent) {
      return {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        text: 'text-white',
        icon: '🔔'
      };
    }
    
    return null;
  }, [isLicenseExpired, isLicenseExpiringSoon, licenseInfo?.notificationSent]);

  // Ne prikazuj ako je loading
  if (loading) {
    return null;
  }

  // Ne prikazuj ako je greška zbog rate limiting-a
  if (error && (error.includes('429') || error.includes('Previše zahteva'))) {
    return null;
  }

  // Prikaži ako je notificationSent: true ili ako je licenca istekla/ističe uskoro
  if (!licenseInfo) {
    return null;
  }

  // Ako je notificationSent: true, uvek prikaži obaveštenje
  if (licenseInfo.notificationSent) {
  } else if (!isLicenseExpired && !isLicenseExpiringSoon) {
    return null;
  }
  
  if (!notificationColor) {
    return null;
  }

  return (
    <div className={`license-notification ${className}`}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full ${notificationColor.bg} ${notificationColor.hover} ${notificationColor.text} focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 animate-pulse`}
          aria-label="Licencno obaveštenje"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v1.5h16.5v-1.5L19.5 13.5V9.75a6 6 0 00-6-6h-3z"></path>
          </svg>
          
          {/* Notification badge - stalno vidljiv */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </span>
        </button>

        {/* Dropdown notification */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-lg z-50 border-2 border-red-200">
            <div className="p-4 bg-gradient-to-r from-red-50 to-yellow-50">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${notificationColor.bg} flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v1.5h16.5v-1.5L19.5 13.5V9.75a6 6 0 00-6-6h-3z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800">
                    {isLicenseExpired ? '⚠️ Лиценца је истекла' : 
                     isLicenseExpiringSoon ? '⏰ Лиценца истиче ускоро' : 
                     '🔔 Лиценцно обавештење'}
                  </h3>
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    {getStatusMessage()}
                  </p>
                  {licenseInfo.endDate && (
                    <p className="text-sm text-gray-600 mt-2 font-semibold">
                      📅 Datum isteka: {new Date(licenseInfo.endDate).toLocaleDateString('sr-RS')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent('Zahtev za produženje licence');
                      const body = encodeURIComponent(
                        `Poštovani,\n\nMolim Vas da produžite moju licencu za EUK Platformu.\n\nHvala unapred.`
                      );
                      window.open(`mailto:admin@euk.rs?subject=${subject}&body=${body}`, '_blank');
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    📧 Kontaktiraj administratora
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseNotification;
