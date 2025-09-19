"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RouteService from '@/services/routeService';

interface UseRouteAccessReturn {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

// Hook za proveru pristupa ruti
export const useRouteAccess = (routeId: number): UseRouteAccessReturn => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !token || !routeId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const access = await RouteService.checkRouteAccess(user.id, routeId, token);
        setHasAccess(access);
      } catch (err) {
        console.error('Error checking route access:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, token, routeId]);

  return { hasAccess, loading, error };
};

// Hook za proveru pristupa sekciji
export const useSectionAccess = (section: string): UseRouteAccessReturn => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !token || !section) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Prvo proveri role-based logiku
        const roleBasedAccess = RouteService.hasAccessToSection(user.role, section);
        
        if (roleBasedAccess) {
          setHasAccess(true);
        } else {
          // Ako role-based logika ne dozvoljava, proveri API
          const apiAccess = await RouteService.checkSectionAccess(user.id, section, token);
          setHasAccess(apiAccess);
        }
      } catch (err) {
        console.error('Error checking section access:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback na role-based logiku
        const roleBasedAccess = RouteService.hasAccessToSection(user.role, section);
        setHasAccess(roleBasedAccess);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, token, section]);

  return { hasAccess, loading, error };
};

// Hook za dohvatanje dostupnih ruta korisnika
export const useUserRoutes = (userId?: number) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const targetUserId = userId || user?.id;

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user || !token || !targetUserId) {
        setRoutes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userRoutes = await RouteService.getAccessibleRoutes(targetUserId, token);
        setRoutes(userRoutes);
      } catch (err) {
        console.error('Error fetching user routes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback na role-based rute
        const roleBasedRoutes = RouteService.getRoleBasedRoutes(user.role);
        setRoutes(roleBasedRoutes.map((route, index) => ({
          id: index + 1,
          ruta: route,
          naziv: route,
          sekcija: route.startsWith('euk/') ? 'EUK' : 'OTHER'
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user, token, targetUserId]);

  return { routes, loading, error, refetch: () => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      setLoading(true);
      // Re-trigger useEffect
    }
  }};
};

// Hook za admin funkcionalnosti
export const useAdminRoutes = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user || !token || user.role?.toUpperCase() !== 'ADMIN') {
        setRoutes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allRoutes = await RouteService.getAllRoutes(token);
        setRoutes(allRoutes);
      } catch (err) {
        console.error('Error fetching admin routes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user, token]);

  return { routes, loading, error };
};

// Hook za admin korisnike
export const useAdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !token || user.role?.toUpperCase() !== 'ADMIN') {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allUsers = await RouteService.getAllUsers(token);
        setUsers(allUsers);
      } catch (err) {
        console.error('Error fetching admin users:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token]);

  return { users, loading, error };
};
