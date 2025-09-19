import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  routeName: string;
  requiredPermission?: 'read' | 'write' | 'delete' | 'execute';
  fallback?: React.ReactNode;
  userId?: number;
}

export function PermissionGuard({ 
  children, 
  routeName, 
  requiredPermission = 'read',
  fallback = null,
  userId 
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { permissions, loading, error } = usePermissions(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <div className="text-sm text-gray-500 ml-2">Proveravam privilegije...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-red-500">Greška pri proveri privilegija: {error}</div>
      </div>
    );
  }

  if (!permissions) {
    return fallback ? <>{fallback}</> : null;
  }

  // Proveri pristup na osnovu route i permission
  const hasAccess = checkRouteAccess(routeName, requiredPermission, permissions);

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">Pristup odbijen</div>
          <div className="text-sm text-gray-500">
            Nemate dozvolu za pristup: {routeName} ({requiredPermission})
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Komponenta za proveru pristupa ruti
interface RouteGuardProps {
  children: React.ReactNode;
  routeName: string;
  fallback?: React.ReactNode;
  userId?: number;
}

export function RouteGuard({ children, routeName, fallback, userId }: RouteGuardProps) {
  const { user } = useAuth();
  const { permissions, loading, error } = usePermissions(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <div className="text-sm text-gray-500 ml-2">Proveravam pristup...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-red-500">Greška pri proveri pristupa: {error}</div>
      </div>
    );
  }

  if (!permissions) {
    return fallback ? <>{fallback}</> : null;
  }

  // Proveri pristup na osnovu route
  const hasAccess = checkRouteAccess(routeName, 'read', permissions);

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">Pristup odbijen</div>
          <div className="text-sm text-gray-500">Nemate dozvolu za pristup: {routeName}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Komponenta za proveru admin privilegija
interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userId?: number;
}

export function AdminGuard({ children, fallback, userId }: AdminGuardProps) {
  const { user } = useAuth();

  // Direktna provera user.role umesto korišćenja usePermissions
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  const isAdmin = user.role === 'admin' || user.role === 'ADMIN';

  if (!isAdmin) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">Pristup odbijen</div>
          <div className="text-sm text-gray-500">Nemate dozvolu za pristup admin funkcionalnostima</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Komponenta za proveru EUK privilegija
interface EUKGuardProps {
  children: React.ReactNode;
  section: 'kategorije' | 'predmeti' | 'ugrozena-lica' | 'stampanje';
  action: 'read' | 'write' | 'delete';
  fallback?: React.ReactNode;
  userId?: number;
}

export function EUKGuard({ children, section, action, fallback, userId }: EUKGuardProps) {
  const { user } = useAuth();
  const { permissions, loading, error } = usePermissions(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <div className="text-sm text-gray-500 ml-2">Proveravam EUK privilegije...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-red-500">Greška pri proveri EUK privilegija: {error}</div>
      </div>
    );
  }

  if (!permissions) {
    return fallback ? <>{fallback}</> : null;
  }

  // Proveri EUK pristup
  const hasAccess = checkEUKAccess(section, action, permissions);

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">Pristup odbijen</div>
          <div className="text-sm text-gray-500">
            Nemate dozvolu za {action} u EUK sekciji: {section}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper funkcije za proveru pristupa
function checkRouteAccess(routeName: string, permission: string, permissions: any): boolean {
  // Admin routes
  if (routeName.startsWith('/admin')) {
    return permissions.routes.admin && permissions.canManageUsers;
  }
  
  // EUK routes
  if (routeName.startsWith('/euk')) {
    if (!permissions.routes.euk) return false;
    
    if (routeName.includes('/kategorije')) {
      return permission === 'read' ? permissions.euk.kategorije : permissions.euk.create;
    }
    if (routeName.includes('/predmeti')) {
      return permission === 'read' ? permissions.euk.predmeti : permissions.euk.create;
    }
    if (routeName.includes('/ugrozena-lica')) {
      return permission === 'read' ? permissions.euk['ugrozena-lica'] : permissions.euk.create;
    }
    if (routeName.includes('/stampanje')) {
      return permissions.euk.read;
    }
    
    return permissions.euk.read;
  }
  
  // Reports
  if (routeName.startsWith('/reports')) {
    return permissions.routes.reports && permissions.canViewAnalytics;
  }
  
  // Settings
  if (routeName.startsWith('/settings')) {
    return permissions.routes.settings;
  }
  
  // Dashboard - svi mogu da pristupe
  if (routeName === '/dashboard') {
    return true;
  }
  
  return false;
}

function checkEUKAccess(section: string, action: string, permissions: any): boolean {
  if (!permissions.routes.euk) return false;
  
  switch (section) {
    case 'kategorije':
      return action === 'read' ? permissions.euk.kategorije : permissions.euk.create;
    case 'predmeti':
      return action === 'read' ? permissions.euk.predmeti : permissions.euk.create;
    case 'ugrozena-lica':
      return action === 'read' ? permissions.euk['ugrozena-lica'] : permissions.euk.create;
    case 'stampanje':
      return permissions.euk.read;
    default:
      return false;
  }
}