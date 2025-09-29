'use client';

import React, { useState, useMemo } from 'react';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseNotificationBellProps {
  className?: string;
}

const LicenseNotificationBell: React.FC<LicenseNotificationBellProps> = ({ className = '' }) => {
  const { 
    licenseInfo, 
    loading, 
    error,
    isLicenseExpired, 
    isLicenseExpiringSoon, 
    getStatusMessage 
  } = useLicense();
  
  const [isOpen, setIsOpen] = useState(false);

  // Ne prikazuj ako je loading
  if (loading) {
    return null;
  }

  // Ne prikazuj ako je greška zbog rate limiting-a
  if (error && (error.includes('429') || error.includes('Previše zahteva'))) {
    return null;
  }

  // Ne prikazuj ako nema licence info
  if (!licenseInfo) {
    return null;
  }

  // Ne prikazuj ako je licenca važeća i nije istekla
  if (!isLicenseExpired && !isLicenseExpiringSoon && !licenseInfo.notificationSent) {
    return null;
  }

  const getBellColor = () => {
    if (isLicenseExpired) {
      return 'text-red-500 hover:text-red-600';
    }
    
    if (isLicenseExpiringSoon) {
      return 'text-yellow-500 hover:text-yellow-600';
    }
    
    if (licenseInfo.notificationSent) {
      return 'text-blue-500 hover:text-blue-600';
    }
    
    return 'text-gray-500 hover:text-gray-600';
  };

  const getBellIcon = () => {
    if (isLicenseExpired) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      );
    }
    
    if (isLicenseExpiringSoon) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v1.5h16.5v-1.5L19.5 13.5V9.75a6 6 0 00-6-6h-3z"></path>
      </svg>
    );
  };

  const getNotificationText = () => {
    if (isLicenseExpired) {
      return 'Лиценца је истекла';
    }
    
    if (isLicenseExpiringSoon) {
      return `Лиценца истиче за ${licenseInfo?.daysUntilExpiry} дана`;
    }
    
    if (licenseInfo?.notificationSent) {
      return 'Обавештење о лиценци';
    }
    
    return 'Лиценцно обавештење';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${getBellColor()}`}
        aria-label="Лиценцна нотификација"
      >
        {getBellIcon()}
        
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getNotificationText()}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getBellIcon()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {getStatusMessage()}
                    </p>
                    {licenseInfo?.endDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Датум истека: {new Date(licenseInfo.endDate).toLocaleDateString('sr-RS')}
                      </p>
                    )}
                  </div>
                </div>
                
                    {isLicenseExpired && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Важно:</strong> Лиценца је истекла. Контактирајте администратора за продужење.
                        </p>
                      </div>
                    )}
                    
                    {isLicenseExpiringSoon && !isLicenseExpired && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Упозорење:</strong> Лиценца ће ускоро истећи. Контактирајте администратора.
                        </p>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LicenseNotificationBell;
