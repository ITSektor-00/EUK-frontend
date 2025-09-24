'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// Striktna RoleGuard komponenta
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const userRole = user.role?.toUpperCase();
      const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);
      
      if (!isAllowed) {
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Немате приступ
            </h2>
            <p className="text-gray-600 mb-4">
              Морате бити пријављени да бисте приступили овој страници.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Пријавите се
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = user.role?.toUpperCase();
  const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);

  if (!isAllowed) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Немате приступ
            </h2>
            <p className="text-gray-600 mb-4">
              Само {allowedRoles.join(', ')} имају приступ овој страници.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Ваша улога:</strong> {userRole}<br/>
                <strong>Дозвољене улоге:</strong> {allowedRoles.join(', ')}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Admin-only guard
export const AdminOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleGuard allowedRoles={['admin', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

// User-only guard (ne admin)
export const UserOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleGuard allowedRoles={['korisnik', 'KORISNIK', 'user', 'USER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

// EUK access guard (samo korisnici, ne admini)
export const EUKAccessGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleGuard allowedRoles={['korisnik', 'KORISNIK', 'user', 'USER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

// Admin panel guard (samo admini)
export const AdminPanelGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleGuard allowedRoles={['admin', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};
