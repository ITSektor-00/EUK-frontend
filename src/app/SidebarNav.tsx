"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { NIVOI_PRISTUPA } from '@/components/RouteGuard';

import DynamicIcon from './components/DynamicIcon';

interface NavLink {
  href: string
  label: string
  icon?: React.ReactElement
}

interface UserRoute {
  id: number;
  userId: number;
  routeId: number;
  route: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  routeDto: {
    id: number;
    ruta: string;
    naziv: string;
  };
}

interface Route {
  id: number;
  ruta: string;
  naziv: string;
  opis: string;
  sekcija: string;
  aktivna: boolean;
  datumKreiranja: string;
}

interface SidebarNavProps {
  sidebarOpen?: boolean;
  onToggle?: () => void;
  isAdmin?: boolean;
  showOnlyUsers?: boolean;
  userId?: number | null;
}

export default function SidebarNav({ sidebarOpen = true, onToggle, isAdmin = false, showOnlyUsers = false, userId }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, token } = useAuth();
  const [userRoutes, setUserRoutes] = useState<UserRoute[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignedRoutes, setAssignedRoutes] = useState<UserRoute[]>([]);
  const [loading, setLoading] = useState(true);

  // Učitaj dodeljene rute iz localStorage
  const loadAssignedRoutes = useCallback(() => {
    try {
      const saved = localStorage.getItem('userRoutes');
      if (saved) {
        const routes = JSON.parse(saved);
        // Filtriraj rute za trenutnog korisnika
        const userSpecificRoutes = routes.filter((route: UserRoute) => route.userId === user?.id);
        setAssignedRoutes(userSpecificRoutes);
        console.log('Assigned routes loaded for user:', user?.id, userSpecificRoutes);
      }
    } catch (error) {
      console.error('Error loading assigned routes:', error);
    }
  }, [user?.id]);

  const loadUserRoutes = useCallback(async () => {
    if (!user || !token) {
      return;
    }
    
    // Za obične korisnike, koristi samo fallback rute - ne pozivaj admin API-jeve
    if (user.role?.toUpperCase() !== 'ADMIN') {
      setLoading(true);
      const fallbackRoutes = getFallbackRoutesForRole(user.role);
      setUserRoutes(fallbackRoutes);
      setRoutes([]);
      setLoading(false);
      return;
    }
    
    // Samo admin poziva admin API-jeve
    try {
      setLoading(true);
      const [userRoutesData, routesData] = await Promise.all([
        apiService.getUserRoutesByUserId(user.id, token),
        apiService.getRoutes(token)
      ]);
      setUserRoutes(Array.isArray(userRoutesData) ? userRoutesData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
    } catch (error) {
      // Fallback na role-based rute ako API ne radi
      const fallbackRoutes = getFallbackRoutesForRole(user.role);
      setUserRoutes(fallbackRoutes);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    
    // Učitaj dodeljene rute
    loadAssignedRoutes();
    
    // ADMIN ne koristi EUK rute - samo admin panel
    if (user.role?.toUpperCase() !== 'ADMIN') {
      loadUserRoutes();
    } else {
      setLoading(false);
    }
  }, [user, token, loadUserRoutes, loadAssignedRoutes]);

  // Osveži dodeljene rute kada se promene u localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      loadAssignedRoutes();
    };

    const handleRoutesUpdated = () => {
      loadAssignedRoutes();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('routesUpdated', handleRoutesUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('routesUpdated', handleRoutesUpdated);
    };
  }, [loadAssignedRoutes]);

  // Role-based route mapping - pojednostavljen sistem
  const getRoleBasedRoutes = (role: string): string[] => {
    const roleRoutes: { [key: string]: string[] } = {
      'ADMIN': [], // ADMIN ne koristi EUK sekciju - samo admin panel
      'KORISNIK': ['euk/kategorije', 'euk/predmeti', 'euk/ugrozena-lica', 'euk/stampanje'] // Svi korisnici imaju pristup EUK funkcionalnostima
    };

    return roleRoutes[role] || ['euk/kategorije', 'euk/predmeti', 'euk/ugrozena-lica', 'euk/stampanje']; // Default za sve ostale
  };

  const getFallbackRoutesForRole = (role: string): UserRoute[] => {
    const routes = getRoleBasedRoutes(role);
    return routes.map((route, index) => ({
      id: index + 1,
      userId: user!.id,
      routeId: index + 1,
      route: route,
      nivoDozvola: 1,
      user: { 
        id: user!.id, 
        username: user!.username, 
        firstName: user!.firstName, 
        lastName: user!.lastName, 
        role: user!.role, 
        isActive: user!.isActive, 
        nivoPristupa: user!.nivoPristupa || 2 
      },
      routeDto: { 
        id: index + 1, 
        ruta: route, 
        naziv: route, 
        nivoMin: 2, 
        nivoMax: 5 
      }
    }));
  };

  // Admin sidebar - samo admin/korisnici
  const getAdminSections = () => {
    return [
      {
        title: 'АДМИН ПАНЕЛ',
        links: [
          { href: '/admin/korisnici', label: 'КОРИСНИЦИ', icon: <DynamicIcon iconName="ugrozena-lica" alt="КОРИСНИЦИ" /> },
        ] as NavLink[],
      }
    ];
  };

  // Role-based user sidebar
  const getUserSections = () => {
    if (loading) return [];

    const routeMap: { [key: string]: { label: string; icon: string } } = {
      'euk/kategorije': { label: 'КАТЕГОРИЈЕ', icon: 'kategorije' },
      'euk/predmeti': { label: 'ПРЕДМЕТИ', icon: 'predmeti' },
      'euk/ugrozena-lica': { label: 'УГРОЖЕНА ЛИЦА', icon: 'ugrozena-lica' },
      'euk/stampanje': { label: 'ШТАМПАЊЕ', icon: 'stampanje' },
      'reports': { label: 'ИЗВЕШТАЈИ', icon: 'komandnaTabla' },
      'analytics': { label: 'АНАЛИТИКА', icon: 'komandnaTabla' }
    };

    // Role-based route access - pojednostavljen sistem
    const userRole = user?.role?.toUpperCase() || 'KORISNIK';
    let allowedRoutes: string[] = [];

    if (userRole === 'ADMIN') {
      // ADMIN ne vidi EUK sekciju - samo admin panel
      allowedRoutes = [];
    } else {
      // Svi ostali korisnici (KORISNIK) imaju pristup svim EUK funkcionalnostima
      allowedRoutes = getRoleBasedRoutes(userRole);
    }

    const eukLinks = allowedRoutes
      .filter(route => route.startsWith('euk/'))
      .map(route => ({
        href: `/${route}`,
        label: routeMap[route]?.label || route,
        icon: <DynamicIcon iconName={routeMap[route]?.icon || 'komandnaTabla'} alt={route} />
      }));

    const sections = [];

    if (eukLinks.length > 0) {
      sections.push({
        title: 'ЕУК СИСТЕМ',
        links: eukLinks
      });
    }

    return sections;
  };

  const getSections = () => {
    if (!user) return [];

    // Role-based access control
    const userRole = user.role?.toUpperCase();
    
    if (userRole === 'ADMIN') {
      return getAdminSections();
    } else {
      return getUserSections();
    }
  };

  const sections = getSections();

  // Pojednostavljen UI dizajn
  return (
    <nav className="flex flex-col items-center py-1 gap-0.5 h-full w-full" style={{ position: 'relative', height: '100%' }}>
      
      {/* Burger meni na vrhu sidebara */}
      <div className="w-full flex justify-center mb-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col w-full flex-1">
        <div className="relative">
          <SidebarItem
            href={user?.role?.toUpperCase() === 'ADMIN' ? "/admin/dashboard" : "/dashboard"}
            icon={<DynamicIcon iconName="komandnaTabla" alt="КОМАНДНА ТАБЛА" />}
            label="КОМАНДНА ТАБЛА"
            active={pathname === '/dashboard' || pathname === '/admin/dashboard'}
            sidebarOpen={sidebarOpen}
          />
        </div>
        {sections.map((section, idx) => (
          <div key={section.title} className="flex flex-col w-full mt-1.5">
            {!sidebarOpen && idx !== 0 && (
              <div className="w-7 h-0.5 bg-[var(--border-color)] mx-auto my-1 rounded-full opacity-70" />
            )}
            {sidebarOpen && (
              <div className="text-[16px] text-[var(--text-secondary)] font-bold px-4 mb-2 mt-4 tracking-widest uppercase">
                {section.title}
              </div>
            )}
            <div className="flex flex-col gap-0.5 w-full">
              {section.links.map((link: NavLink) => (
                <div key={link.href} className="relative">
                  <SidebarItem
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={pathname === link.href}
                    sidebarOpen={sidebarOpen}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

// Pojednostavljena SidebarItem komponenta
function SidebarItem({ href, icon, label, active, sidebarOpen }: { 
  href: string, 
  icon?: React.ReactElement, 
  label: string, 
  active: boolean, 
  sidebarOpen: boolean
}) {
  if (!sidebarOpen) {
    return (
      <div className="relative flex items-center justify-center w-full group">
        <Link
          href={href}
          scroll={false}
          className={`flex items-center justify-center w-full h-12 my-0.5 rounded-lg transition-colors duration-100
            ${active ? 'bg-gray-200 text-black font-bold border border-gray-400' : 'text-[var(--text-primary)]'}
            hover:bg-[var(--border-color)] focus:outline-none
          `}
          tabIndex={0}
        >
          <span className={`w-6 h-6 flex items-center justify-center ${active ? 'font-bold' : ''}`}>{icon}</span>
        </Link>
        
        {/* Custom tooltip za zatvoreni sidebar */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          {/* Tooltip arrow */}
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
        </div>
      </div>
    )
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={`flex items-center w-full px-4 py-2 transition-all duration-200 group relative overflow-hidden
        ${active ? 'sidebar-active-link' : 'text-[var(--text-primary)] font-normal'}
        ${!active && 'hover:bg-[var(--sidebar-bg)]'}
        ${sidebarOpen ? 'pl-4 pr-2' : 'justify-center'}
        ${active && !sidebarOpen ? 'justify-center' : ''}
        focus:outline-none
      `}
      title={label}
      style={{fontSize: 14, minHeight: 40, maxWidth: sidebarOpen ? 220 : 48, overflow: 'hidden'}}
    >
      <span className={`w-5 h-5 flex items-center justify-center z-10 ${active ? 'font-bold' : ''}`}>{icon}</span>
      {sidebarOpen && (
        <span className={`truncate z-10 ${active ? 'font-bold' : 'font-normal'} hover:underline`} style={{maxWidth: 120, marginLeft: 8}}>{label}</span>
      )}
    </Link>
  )
} 