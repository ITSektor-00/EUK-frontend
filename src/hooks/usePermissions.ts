import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserPermissions {
  userId: number;
  username: string;
  role: string;
  isActive: boolean;
  routes: {
    admin: boolean;
    users: boolean;
    euk: boolean;
    reports: boolean;
    settings: boolean;
    analytics: boolean;
  };
  euk: {
    kategorije: boolean;
    predmeti: boolean;
    'ugrozena-lica': boolean;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  canDelete: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

// Cache permissions u localStorage
const cachePermissions = (userId: number, permissions: UserPermissions) => {
  localStorage.setItem(`permissions_${userId}`, JSON.stringify({
    data: permissions,
    timestamp: Date.now()
  }));
};

const getCachedPermissions = (userId: number): UserPermissions | null => {
  const cached = localStorage.getItem(`permissions_${userId}`);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache 5 minuta
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    } catch (error) {
      console.error('Error parsing cached permissions:', error);
    }
  }
  return null;
};

export const usePermissions = (userId?: number) => {
  const { user, token } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePermissions = () => {
      if (!user) {
        setPermissions(null);
        setLoading(false);
        return;
    }
    
    try {
        setLoading(true);
        setError(null);

        const targetUserId = userId || user.id;
        
        // Proveri cache prvo
        const cachedPermissions = getCachedPermissions(targetUserId);
        if (cachedPermissions) {
          console.log('Using cached permissions for user:', targetUserId);
          setPermissions(cachedPermissions);
          setLoading(false);
          return;
        }

        // Generiši role-based permissions
        console.log('Generating role-based permissions for user:', targetUserId);
        
        const userRole = user.role?.toLowerCase();
        const roleBasedPermissions: UserPermissions = {
          userId: user.id,
          username: user.username || '',
          role: user.role || '',
          isActive: user.isActive || false,
          routes: {
            admin: userRole === 'admin',
            users: userRole === 'admin',
            euk: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici imaju pristup EUK
            reports: userRole === 'admin',
            settings: userRole === 'admin',
            analytics: userRole === 'admin'
          },
          euk: {
            kategorije: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici imaju pristup
            predmeti: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici imaju pristup
            'ugrozena-lica': ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici imaju pristup
            create: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici mogu da kreiraju
            read: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici mogu da čitaju
            update: ['admin', 'korisnik'].includes(userRole || ''), // Svi korisnici mogu da ažuriraju
            delete: userRole === 'admin' // Samo admin može da briše
          },
          canDelete: userRole === 'admin',
          canManageUsers: userRole === 'admin',
          canViewAnalytics: userRole === 'admin'
        };
        
        // Cache permissions
        cachePermissions(targetUserId, roleBasedPermissions);
        setPermissions(roleBasedPermissions);
        
      } catch (err) {
        console.error('Error generating permissions:', err);
        setError(err instanceof Error ? err.message : 'Greška pri generisanju dozvola');
      } finally {
        setLoading(false);
      }
    };

    generatePermissions();
  }, [user, userId]);

  // Helper funkcije za lakše korišćenje
  const canAccessRoute = (route: string): boolean => {
    if (!permissions) return false;
    
    switch (route) {
      case 'admin':
        return permissions.routes.admin;
      case 'users':
        return permissions.routes.users;
      case 'euk':
        return permissions.routes.euk;
      case 'reports':
        return permissions.routes.reports;
      case 'settings':
        return permissions.routes.settings;
      case 'analytics':
        return permissions.routes.analytics;
      default:
        return false;
    }
  };

  const hasActionPermission = (action: string): boolean => {
    if (!permissions) return false;
    
    switch (action) {
      case 'delete':
        return permissions.canDelete;
      case 'manageUsers':
        return permissions.canManageUsers;
      case 'viewAnalytics':
        return permissions.canViewAnalytics;
      case 'create':
        return permissions.euk.create;
      case 'read':
        return permissions.euk.read;
      case 'update':
        return permissions.euk.update;
      default:
        return false;
    }
  };

  const isAdmin = permissions?.role === 'admin';
  const canManageUsers = permissions?.canManageUsers || false;
  const canDelete = permissions?.canDelete || false;
  const canViewAnalytics = permissions?.canViewAnalytics || false;

  return {
    permissions, 
    loading, 
    error,
    canAccessRoute,
    hasActionPermission,
    isAdmin,
    canManageUsers,
    canDelete,
    canViewAnalytics
  };
};