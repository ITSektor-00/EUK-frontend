"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RouteService from '@/services/routeService';

// Nivoi pristupa - samo tri osnovne uloge
export const NIVOI_PRISTUPA = {
  2: "✍️ Потписник",
  3: "📋 Обрађивач предмета", 
  5: "👑 Администратор"
};

interface RouteAccessContextType {
  hasAccess: boolean;
  loading: boolean;
  userLevel: number;
  levelName: string;
  userRole: string;
}

const RouteAccessContext = createContext<RouteAccessContextType | undefined>(undefined);

interface RouteGuardProps {
  route?: string;
  section?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

// Role-based Route Guard
export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  route, 
  section, 
  children, 
  fallback,
  requireAdmin = false 
}) => {
  const { user, token, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(2);
  const [levelName, setLevelName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      if (!user || !token) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const userNivo = user.nivoPristupa || 2;
      const role = user.role?.toUpperCase() || 'POTPISNIK';
      
      setUserLevel(userNivo);
      setLevelName((NIVOI_PRISTUPA as any)[userNivo] || "❌ Нема приступ");
      setUserRole(role);

      try {
        // Ako je admin required, proveri da li je admin
        if (requireAdmin && role !== 'ADMIN') {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Role-based access control
        if (section) {
          const roleBasedAccess = RouteService.hasAccessToSection(role, section);
          
          if (roleBasedAccess) {
            setHasAccess(true);
          } else {
            // Fallback na API proveru
            try {
              const apiAccess = await RouteService.checkSectionAccess(user.id, section, token);
              setHasAccess(apiAccess);
            } catch (error) {
              console.error('Error checking section access via API:', error);
              setHasAccess(roleBasedAccess);
            }
          }
        } else if (route) {
          // Proveri pristup specificnoj ruti
          try {
            const routeAccess = await RouteService.checkRouteAccess(user.id, parseInt(route), token);
            setHasAccess(routeAccess);
          } catch (error) {
            console.error('Error checking route access:', error);
            // Fallback na role-based logiku
            const roleBasedRoutes = RouteService.getRoleBasedRoutes(role);
            setHasAccess(roleBasedRoutes.includes(route));
          }
        } else {
          // Ako nema specifične rute ili sekcije, dozvoli pristup
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [route, section, user, token, authLoading, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
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
              {requireAdmin 
                ? "Само администратори имају приступ овој страници."
                : section 
                ? `Немате приступ ${section} секцији.`
                : "Немате приступ овој функционалности."
              }
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Ваша улога:</strong> {userRole}<br/>
                <strong>Ниво приступа:</strong> {levelName}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RouteAccessContext.Provider value={{
      hasAccess,
      loading,
      userLevel,
      levelName,
      userRole
    }}>
      {children}
    </RouteAccessContext.Provider>
  );
};

// Hook za korišćenje RouteAccess context-a
export const useRouteAccessContext = () => {
  const context = useContext(RouteAccessContext);
  if (context === undefined) {
    throw new Error('useRouteAccessContext must be used within a RouteGuard');
  }
  return context;
};

// HOC za zaštitu komponenti
export const withRouteGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    route?: string;
    section?: string;
    requireAdmin?: boolean;
    fallback?: React.ReactNode;
  }
) => {
  const WithRouteGuard = (props: P) => (
    <RouteGuard {...options}>
      <Component {...props} />
    </RouteGuard>
  );
  
  WithRouteGuard.displayName = `withRouteGuard(${Component.displayName || Component.name || 'Component'})`;
  
  return WithRouteGuard;
};

// Admin-only guard
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RouteGuard requireAdmin={true} fallback={fallback}>
      {children}
    </RouteGuard>
  );
};

// EUK section guard
export const EUKGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RouteGuard section="EUK" fallback={fallback}>
      {children}
    </RouteGuard>
  );
};

// Admin section guard
export const AdminSectionGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RouteGuard section="ADMIN" fallback={fallback}>
      {children}
    </RouteGuard>
  );
};