'use client';

import React from 'react';
import { useLicense } from '../contexts/LicenseContext';

interface LicenseStatusProps {
  className?: string;
  showDetails?: boolean;
}

const LicenseStatus: React.FC<LicenseStatusProps> = ({ 
  className = '', 
  showDetails = true 
}) => {
  const { 
    licenseInfo, 
    loading, 
    error, 
    isLicenseValid, 
    isLicenseExpired, 
    isLicenseExpiringSoon,
    getStatusMessage,
    getFormattedEndDate 
  } = useLicense();

  if (loading) {
    return (
      <div className={`license-status ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Proverava se licenca...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`license-status ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Greška pri učitavanju licence</span>
        </div>
      </div>
    );
  }

  if (!licenseInfo) {
    return (
      <div className={`license-status ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Licencni podaci nisu dostupni</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (isLicenseExpired) return 'text-red-600';
    if (isLicenseExpiringSoon) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isLicenseExpired) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (isLicenseExpiringSoon) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className={`license-status ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {isLicenseValid ? 'Licenca je važeća' : 'Licenca nije važeća'}
          </div>
          {showDetails && (
            <div className="text-xs text-gray-600 mt-1">
              {getStatusMessage()}
            </div>
          )}
          {showDetails && licenseInfo.endDate && (
            <div className="text-xs text-gray-500 mt-1">
              Datum isteka: {getFormattedEndDate()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseStatus;
