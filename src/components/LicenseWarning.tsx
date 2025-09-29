'use client';

import React, { useState, useEffect } from 'react';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseWarningProps {
  className?: string;
}

const LicenseWarning: React.FC<LicenseWarningProps> = ({ className = '' }) => {
  const { 
    licenseInfo, 
    loading, 
    error,
    isLicenseExpired, 
    isLicenseExpiringSoon, 
    getStatusMessage 
  } = useLicense();
  
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Proveri da li treba prikazati upozorenje
    if (loading || !licenseInfo) {
      setIsVisible(false);
      return;
    }

    // Ne prikazuj upozorenje ako je greška zbog rate limiting-a
    if (error && (error.includes('429') || error.includes('Previše zahteva'))) {
      setIsVisible(false);
      return;
    }

    // Prikaži upozorenje ako je licenca istekla ili ističe uskoro
    if (isLicenseExpired || isLicenseExpiringSoon) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [licenseInfo, loading, error, isLicenseExpired, isLicenseExpiringSoon]);

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
  };

  // Ne prikazuj ako je dismissed ili nije visible
  if (dismissed || !isVisible) {
    return null;
  }

  const getWarningType = () => {
    if (isLicenseExpired) {
      return {
        bgColor: 'bg-red-600',
        icon: '⚠️',
        title: 'Лиценца је истекла'
      };
    }
    
    if (isLicenseExpiringSoon) {
      return {
        bgColor: 'bg-yellow-600',
        icon: '⏰',
        title: 'Лиценца истиче ускоро'
      };
    }
    
    return null;
  };

  const warningType = getWarningType();
  
  if (!warningType) {
    return null;
  }

  return (
    <div className={`license-warning ${className}`}>
      <div className={`${warningType.bgColor} text-white px-4 py-3 shadow-lg`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{warningType.icon}</span>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {warningType.title}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  {getStatusMessage()}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="ml-4 text-white hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
              aria-label="Zatvori upozorenje"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .license-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LicenseWarning;
