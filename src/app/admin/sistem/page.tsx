'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { AdminGuard } from '@/components/RouteGuard';

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

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface RouteCategory {
  name: string;
  routes: string[];
  description: string;
  icon: string;
}

export default function AdminSistemPage() {
  const { token, user } = useAuth();
  const [userRoutes, setUserRoutes] = useState<UserRoute[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserForRoutes, setSelectedUserForRoutes] = useState<number | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Definicija uloga u sistemu
  const SYSTEM_ROLES = {
    ADMIN: {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Pun pristup sistemu',
      icon: '👑'
    },
    OBRADJIVAC: {
      name: 'OBRADJIVAC',
      displayName: 'Obrađivač predmeta',
      description: 'Obrađuje predmete u EUK sistemu',
      icon: '📋'
    },
    POTPISNIK: {
      name: 'POTPISNIK',
      displayName: 'Potpisnik',
      description: 'Potpisuje dokumente',
      icon: '✍️'
    }
  };

  const routeCategories: RouteCategory[] = [
    {
      name: 'EUK Sistem',
      routes: ['euk/kategorije', 'euk/predmeti', 'euk/ugrozena-lica', 'euk/stampanje'],
      description: 'Osnovne EUK funkcionalnosti',
      icon: '📁'
    },
    {
      name: 'Administracija',
      routes: ['admin/korisnici', 'admin/sistem'],
      description: 'Administrativne funkcije',
      icon: '⚙️'
    },
    {
      name: 'Korisnički profil',
      routes: ['profile', 'settings'],
      description: 'Korisničke postavke',
      icon: '👤'
    }
  ];

  const availableRoutes = routeCategories.flatMap(category => category.routes);

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user, currentPage, pageSize]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Učitaj sve korisnike sa paginacijom
      try {
        console.log(`Loading users - page: ${currentPage}, size: ${pageSize}`);
        const filters = {
          ...(roleFilter !== 'all' && { role: roleFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        console.log('Applied filters:', filters);
        console.log('roleFilter value:', roleFilter);
        console.log('searchTerm value:', searchTerm);
        const response = await apiService.getUsersWithPagination(token!, currentPage - 1, pageSize, filters, false, 0); // 0-based page indexing
        console.log('Pagination response:', response);
        console.log('Response keys:', Object.keys(response));
        console.log('Response.totalElements:', response.totalElements);
        console.log('Response.totalPages:', response.totalPages);
        console.log('Response.size:', response.size);
        console.log('Response.number:', response.number);
        
        const users = response.content || response.users || [];
        console.log('Users from pagination:', users);
        console.log('Users count:', users.length);
        
        if (users.length === 0) {
          console.log('No users found, using test data');
          // Fallback - test podaci
          const testUsers = [
            {
              id: 1,
              username: 'luka.rakic',
              firstName: 'Luka',
              lastName: 'Rakic',
              email: 'luka@example.com',
              role: 'ADMIN',
              isActive: true
            },
            {
              id: 2,
              username: 'marko.markovic',
              firstName: 'Marko',
              lastName: 'Markovic',
              email: 'marko@example.com',
              role: 'obradjivaci predmeta',
              isActive: true
            },
            {
              id: 3,
              username: 'ana.anic',
              firstName: 'Ana',
              lastName: 'Anic',
              email: 'ana@example.com',
              role: 'potpisnik',
              isActive: false
            }
          ];
          setAllUsers(testUsers);
          setTotalUsers(testUsers.length);
          setTotalPages(1);
        } else {
          setAllUsers(users);
          setTotalUsers(response.totalElements || users.length);
          setTotalPages(response.totalPages || Math.ceil((response.totalElements || users.length) / pageSize));
        }
      } catch (error) {
        console.error('Error loading users with pagination:', error);
        // Fallback - test podaci
        const testUsers = [
          {
            id: 1,
            username: 'luka.rakic',
            firstName: 'Luka',
            lastName: 'Rakic',
            email: 'luka@example.com',
            role: 'ADMIN',
            isActive: true
          },
          {
            id: 2,
            username: 'marko.markovic',
            firstName: 'Marko',
            lastName: 'Markovic',
            email: 'marko@example.com',
            role: 'obradjivaci predmeta',
            isActive: true
          },
          {
            id: 3,
            username: 'ana.anic',
            firstName: 'Ana',
            lastName: 'Anic',
            email: 'ana@example.com',
            role: 'potpisnik',
            isActive: false
          }
        ];
        console.log('Using test users:', testUsers);
        setAllUsers(testUsers);
        setTotalUsers(testUsers.length);
        setTotalPages(1);
      }

      // Učitaj user routes
      try {
        console.log('Loading user routes...');
        const userRoutesData = await apiService.getUserRoutes(token!);
        console.log('User routes response:', userRoutesData);
        console.log('User routes type:', typeof userRoutesData);
        console.log('Is array:', Array.isArray(userRoutesData));
        const routesArray = Array.isArray(userRoutesData) ? userRoutesData : [];
        if (routesArray.length === 0) {
          console.log('User routes array is empty, using test data');
          // Fallback - test user routes
          const testRoutes = [
            {
              id: 1,
              userId: 2,
              routeId: 1,
              route: 'euk/kategorije',
              user: {
                id: 2,
                username: 'marko.markovic',
                firstName: 'Marko',
                lastName: 'Markovic',
                role: 'obradjivaci predmeta',
                isActive: true
              },
              routeDto: {
                id: 1,
                ruta: 'euk/kategorije',
                naziv: 'Kategorije'
              }
            },
            {
              id: 2,
              userId: 2,
              routeId: 2,
              route: 'euk/predmeti',
              user: {
                id: 2,
                username: 'marko.markovic',
                firstName: 'Marko',
                lastName: 'Markovic',
                role: 'obradjivaci predmeta',
                isActive: true
              },
              routeDto: {
                id: 2,
                ruta: 'euk/predmeti',
                naziv: 'Predmeti'
              }
            },
            {
              id: 3,
              userId: 3,
              routeId: 3,
              route: 'euk/ugrozena-lica',
              user: {
                id: 3,
                username: 'ana.anic',
                firstName: 'Ana',
                lastName: 'Anic',
                role: 'potpisnik',
                isActive: true
              },
              routeDto: {
                id: 3,
                ruta: 'euk/ugrozena-lica',
                naziv: 'Ugrožena lica'
              }
            }
          ];
          setUserRoutes(testRoutes);
        } else {
          setUserRoutes(routesArray);
        }
      } catch (err) {
        console.error('Error loading user routes:', err);
        // Fallback - test user routes
        const testRoutes = [
          {
            id: 1,
            userId: 2,
            routeId: 1,
            route: 'euk/kategorije',
            allowed: true,
            user: {
              id: 2,
              username: 'marko.markovic',
              firstName: 'Marko',
              lastName: 'Markovic',
              role: 'obradjivaci predmeta',
              isActive: true
            },
            routeDto: {
              id: 1,
              ruta: 'euk/kategorije',
              naziv: 'Kategorije'
            }
          },
          {
            id: 2,
            userId: 2,
            routeId: 2,
            route: 'euk/predmeti',
            allowed: true,
            user: {
              id: 2,
              username: 'marko.markovic',
              firstName: 'Marko',
              lastName: 'Markovic',
              role: 'obradjivaci predmeta',
              isActive: true
            },
            routeDto: {
              id: 2,
              ruta: 'euk/predmeti',
              naziv: 'Predmeti'
            }
          },
          {
            id: 3,
            userId: 3,
            routeId: 3,
            route: 'euk/ugrozena-lica',
            allowed: false,
            user: {
              id: 3,
              username: 'ana.anic',
              firstName: 'Ana',
              lastName: 'Anic',
              role: 'potpisnik',
              isActive: true
            },
            routeDto: {
              id: 3,
              ruta: 'euk/ugrozena-lica',
              naziv: 'Ugrožena lica'
            }
          }
        ];
        console.log('Using test user routes:', testRoutes);
        setUserRoutes(testRoutes);
        setError('API za korisničke rute nije implementiran. Koristim test podatke.');
      }

      // Učitaj routes
      try {
        console.log('Loading routes...');
        const routesData = await apiService.getRoutes(token!);
        console.log('Routes response:', routesData);
        const routesArray = Array.isArray(routesData) ? routesData : [];
        if (routesArray.length === 0) {
          console.log('Routes array is empty, using test data');
          // Fallback - test routes
          const testRoutes = [
            {
              id: 1,
              ruta: 'euk/kategorije',
              naziv: 'Kategorije',
              opis: 'Upravljanje kategorijama predmeta',
              sekcija: 'EUK',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 2,
              ruta: 'euk/predmeti',
              naziv: 'Predmeti',
              opis: 'Upravljanje predmetima',
              sekcija: 'EUK',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 3,
              ruta: 'euk/ugrozena-lica',
              naziv: 'Ugrožena lica',
              opis: 'Upravljanje ugroženim licima',
              sekcija: 'EUK',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 4,
              ruta: 'euk/stampanje',
              naziv: 'Štampanje',
              opis: 'Štampanje dokumenata',
              sekcija: 'EUK',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 5,
              ruta: 'reports',
              naziv: 'Izveštaji',
              opis: 'Generisanje izveštaja',
              sekcija: 'REPORTS',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 6,
              ruta: 'analytics',
              naziv: 'Analitika',
              opis: 'Analitika sistema',
              sekcija: 'ANALYTICS',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 7,
              ruta: 'settings',
              naziv: 'Podešavanja',
              opis: 'Korisnička podešavanja',
              sekcija: 'SETTINGS',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            },
            {
              id: 8,
              ruta: 'profile',
              naziv: 'Profil',
              opis: 'Korisnički profil',
              sekcija: 'PROFILE',
              aktivna: true,
              datumKreiranja: '2024-01-15T10:30:00'
            }
          ];
          console.log('Using test routes:', testRoutes);
          setRoutes(testRoutes);
        } else {
          setRoutes(routesArray);
        }
      } catch (err) {
        console.error('Error loading routes:', err);
        // Fallback - test routes
        const testRoutes = [
          {
            id: 1,
            ruta: 'euk/kategorije',
            naziv: 'Kategorije',
            opis: 'Upravljanje kategorijama predmeta',
            sekcija: 'EUK',
            aktivna: true,
            datumKreiranja: '2024-01-15T10:30:00'
          }
        ];
        console.log('Using test routes:', testRoutes);
        setRoutes(testRoutes);
        setError('API za rute nije implementiran. Koristim test podatke.');
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };





  const hasRoute = (userId: number, routeId: number): boolean => {
    return (Array.isArray(userRoutes) ? userRoutes : []).some(ur => ur.userId === userId && ur.routeId === routeId);
  };

  const isRouteAllowed = (userId: number, routeId: number): boolean => {
    const userRoute = (Array.isArray(userRoutes) ? userRoutes : []).find(ur => ur.userId === userId && ur.routeId === routeId);
    return userRoute ? true : false;
  };

  // Funkcije za upravljanje rutama
  const assignRouteToUser = async (userId: number, routeId: number) => {
    try {
      setLoadingRoutes(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Assigning route to user:', { userId, routeId });
      
      if (!token) {
        setError('Nema tokena za autentifikaciju');
        return;
      }

      // Pozovi API za dodeljivanje rute
      const response = await apiService.createUserRoute(userId, routeId, 3, token); // nivoDozvola=3 kao default
      
      if (response) {
        // Dohvati route i user podatke
        const route = routes.find(r => r.id === routeId);
        const user = allUsers.find(u => u.id === userId);
      
      if (route && user) {
          const newUserRoute: UserRoute = {
            id: response.id || Date.now(),
          userId,
          routeId,
          route: route.ruta,
          user: {
              id: userId,
            username: user.username || '',
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
              isActive: user.isActive
          },
          routeDto: {
            id: route.id,
            ruta: route.ruta,
              naziv: route.naziv
            }
          };
          
          setUserRoutes(prev => [...prev, newUserRoute]);
          setSuccessMessage(`Ruta "${route.naziv}" je uspešno dodeljena!`);
          console.log('Route assigned successfully via API');
          
          // Emit custom event za osvežavanje sidebar-a
          window.dispatchEvent(new CustomEvent('routesUpdated'));
        }
      }
    } catch (error) {
      console.error('Error assigning route:', error);
      setError('Greška pri dodeljivanju rute preko API-ja');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const removeRouteFromUser = async (userId: number, routeId: number) => {
    try {
      setLoadingRoutes(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Removing route from user:', { userId, routeId });
      
      if (!token) {
        setError('Nema tokena za autentifikaciju');
        return;
      }

      // Dohvati naziv rute pre brisanja
      const route = routes.find(r => r.id === routeId);
      const routeName = route?.naziv || 'ruta';

      // Pozovi API za uklanjanje rute
      const response = await apiService.deleteUserRoute(userId, routeId, token);
      
      if (response !== false) {
      // Ukloni iz lokalnog stanja
        setUserRoutes(prev => prev.filter(ur => !(ur.userId === userId && ur.routeId === routeId)));
        setSuccessMessage(`Ruta "${routeName}" je uspešno uklonjena!`);
        console.log('Route removed successfully via API');
        
        // Emit custom event za osvežavanje sidebar-a
        window.dispatchEvent(new CustomEvent('routesUpdated'));
      }
    } catch (error) {
      console.error('Error removing route:', error);
      setError('Greška pri uklanjanju rute preko API-ja');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const getUserRoutes = (userId: number): UserRoute[] => {
    return userRoutes.filter(ur => ur.userId === userId);
  };

  const getAvailableRoutes = (userId: number): Route[] => {
    const userRoutesIds = getUserRoutes(userId).map(ur => ur.routeId);
    return routes.filter(route => !userRoutesIds.includes(route.id));
  };

  // Funkcije za čuvanje i učitavanje ruta
  const saveUserRoutes = (routes: UserRoute[]) => {
    try {
      localStorage.setItem('userRoutes', JSON.stringify(routes));
      console.log('User routes saved to localStorage');
    } catch (error) {
      console.error('Error saving user routes:', error);
    }
  };

  const loadUserRoutes = (): UserRoute[] => {
    try {
      const saved = localStorage.getItem('userRoutes');
      if (saved) {
        const routes = JSON.parse(saved);
        console.log('User routes loaded from localStorage:', routes);
        return routes;
      }
    } catch (error) {
      console.error('Error loading user routes:', error);
    }
    return [];
  };

  // Učitaj rute pri inicijalizaciji
  useEffect(() => {
    const savedRoutes = loadUserRoutes();
    if (savedRoutes.length > 0) {
      setUserRoutes(savedRoutes);
    }
  }, []);

  // Čuvaj rute kada se promene
  useEffect(() => {
    if (userRoutes.length > 0) {
      saveUserRoutes(userRoutes);
    }
  }, [userRoutes]);

  // Automatsko dodeljivanje ruta na osnovu uloge
  const assignRoleBasedRoutes = async (userId: number, userRole: string) => {
    try {
      setLoadingRoutes(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Assigning role-based routes for user:', userId, 'role:', userRole);
      
      let routesToAssign: Route[] = [];
      
      switch (userRole) {
        case 'ADMIN':
          // Admin ima pristup svim rutama
          routesToAssign = routes.filter(route => route.sekcija === 'ADMIN');
          break;
        case 'OBRADJIVAC':
        case 'obradjivaci predmeta':
          // Obrađivač ima pristup svim EUK rutama
          routesToAssign = routes.filter(route => route.sekcija === 'EUK');
          break;
        case 'POTPISNIK':
        case 'potpisnik':
          // Potpisnik ima pristup samo stampanju
          routesToAssign = routes.filter(route => route.ruta === 'euk/stampanje');
          break;
        default:
          console.log('Unknown role:', userRole);
          return;
      }

      // Dodeli sve potrebne rute
      let assignedCount = 0;
      for (const route of routesToAssign) {
        // Proveri da li korisnik već ima tu rutu
        if (!getUserRoutes(userId).some(ur => ur.routeId === route.id)) {
          await assignRouteToUser(userId, route.id);
          assignedCount++;
        }
      }

      if (assignedCount > 0) {
        setSuccessMessage(`Uspešno dodeljeno ${assignedCount} ruta na osnovu uloge!`);
      } else {
        setSuccessMessage('Korisnik već ima sve potrebne rute za svoju ulogu!');
      }

      console.log(`Assigned ${assignedCount} role-based routes`);
    } catch (error) {
      console.error('Error assigning role-based routes:', error);
      setError('Greška pri automatskom dodeljivanju ruta');
    } finally {
      setLoadingRoutes(false);
    }
  };


  // Korisnici su već filtrirani na backend-u
  const filteredUsers = Array.isArray(allUsers) ? allUsers : [];

  // Debug logovi
  console.log('allUsers state:', allUsers);
  console.log('allUsers length:', allUsers.length);
  console.log('filteredUsers length:', filteredUsers.length);
  console.log('userRoutes state:', userRoutes);
  console.log('userRoutes length:', userRoutes.length);

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ СИСТЕМ РУТА
        </h1>
        <p className="text-gray-600">
          Управљање приступима и рутама корисника у апликацији
        </p>
        {error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{error}</p>
              </div>
        )}
      </div>


      {/* Route Categories Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {routeCategories.map((category) => (
          <div key={category.name} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{category.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{category.description}</p>
            <div className="space-y-1">
              {category.routes.map((route) => (
                <div key={route} className="text-sm text-gray-500">
                  • {route}
              </div>
              ))}
            </div>
              </div>
        ))}
            </div>

      {/* Admin System Management */}
      <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 ПРЕТРАЖИ КОРИСНИКЕ
            </label>
              <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Име, презиме или емаил..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎭 ФИЛТРИРАЈ ПО УЛОЗИ
              </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">СВЕ УЛОГЕ</option>
              <option value="ADMIN">👑 АДМИНИСТРАТОР</option>
              <option value="OBRADJIVAC">📋 ОБРАЂИВАЧ ПРЕДМЕТА</option>
              <option value="POTPISNIK">✍️ ПОТПИСНИК</option>
            </select>
            </div>
          </div>

            {/* Apply Filters Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  loadData();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🔍 ПРИМЕНИ ФИЛТЕРЕ
              </button>
              </div>
            </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            👥 КОРИСНИЦИ ({filteredUsers.length})
          </h2>
            </div>

        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName[0]}{user.lastName[0]}
            </div>
              <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'OBRADJIVAC'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'POTPISNIK'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'ADMIN' ? '👑 ADMIN' :
                         user.role === 'OBRADJIVAC' ? '📋 ОБРАЂИВАЧ' :
                         user.role === 'POTPISNIK' ? '✍️ ПОТПИСНИК' :
                         user.role}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isActive ? '✅ Aktivan' : '⏳ Čeka odobrenje'}
                      </span>
            </div>
          </div>
        </div>

        {/* Route Management Button */}
        <div className="mt-4">
          <button
            onClick={() => setSelectedUserForRoutes(selectedUserForRoutes === user.id ? null : user.id)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🛣️</span>
            <span>{selectedUserForRoutes === user.id ? 'САКРИЈ РУТЕ' : 'УПРАВЉАЈ РУТАМА'}</span>
          </button>
        </div>

        {/* Route Management Side Panel */}
        {selectedUserForRoutes === user.id && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 w-full max-w-3xl h-full overflow-y-auto shadow-2xl border-l border-blue-200">
              {/* Beautiful Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                      <span className="text-white text-2xl">🛣️</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Управљање рутама
                      </h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Корисник: <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.role === 'ADMIN' ? 'bg-purple-500 text-white' :
                          user.role === 'OBRADJIVAC' ? 'bg-blue-500 text-white' :
                          user.role === 'POTPISNIK' ? 'bg-green-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {user.role === 'ADMIN' ? '👑 АДМИНИСТРАТОР' :
                           user.role === 'OBRADJIVAC' ? '📋 ОБРАЂИВАЧ' :
                           user.role === 'POTPISNIK' ? '✍️ ПОТПИСНИК' :
                           user.role}
                      </span>
            </div>
          </div>
        </div>
          <button
                    onClick={() => setSelectedUserForRoutes(null)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 backdrop-blur-sm"
          >
                    <span className="text-white text-2xl hover:scale-110 transition-transform">✕</span>
          </button>
                </div>
        </div>

              {/* Panel Content with Beautiful Background */}
              <div className="p-8 space-y-8 bg-gradient-to-b from-transparent to-blue-50 min-h-full">

                {/* Auto Assign Role-Based Routes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                          <span className="text-white text-lg">🚀</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Аутоматско додељивање рута</h4>
                      </div>
                      <p className="text-gray-600 mb-2">
                        Доделите основне руте на основу улоге: <span className="font-semibold text-blue-700">{user.role}</span>
                      </p>
                      {user.role === 'ADMIN' && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-purple-600">👑</span>
                          <span className="text-purple-700 font-medium">Администратор - приступ свим админ рутама</span>
                        </div>
                      )}
                      {user.role === 'OBRADJIVAC' && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-blue-600">📋</span>
                          <span className="text-blue-700 font-medium">Обрађивач - приступ свим EUK рутама</span>
                        </div>
                      )}
                      {user.role === 'POTPISNIK' && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-green-600">✍️</span>
                          <span className="text-green-700 font-medium">Потписник - приступ само штампању</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => assignRoleBasedRoutes(user.id, user.role)}
                      disabled={loadingRoutes}
                      className="ml-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {loadingRoutes ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Додељује...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          <span>Аутоматски додели</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-full">
                        <span className="text-white text-xl">✅</span>
                      </div>
                      <p className="text-green-800 font-semibold text-lg">{successMessage}</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-500 rounded-full">
                        <span className="text-white text-xl">❌</span>
                      </div>
                      <p className="text-red-800 font-semibold text-lg">{error}</p>
                    </div>
                  </div>
                )}
            
                {/* Current Routes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <span className="text-white text-lg">✅</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Тренутне руте</h4>
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm px-3 py-1 rounded-full font-semibold">
                      {getUserRoutes(user.id).length} рута
                    </span>
                  </div>
                  {getUserRoutes(user.id).length > 0 ? (
                    <div className="space-y-4">
                      {getUserRoutes(user.id).map(userRoute => (
                        <div key={userRoute.id} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                              <span className="text-white text-xl">📍</span>
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-lg">{userRoute.routeDto.naziv}</span>
                              <p className="text-gray-600 mt-1 font-medium">{userRoute.route}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeRouteFromUser(user.id, userRoute.routeId)}
                            disabled={loadingRoutes}
                            className="px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            {loadingRoutes ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <span className="text-lg">🗑️</span>
                            )}
                            <span>Уклони</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 text-center">
                      <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
                      <p className="text-yellow-800 font-bold text-lg mb-2">Корисник нема додељене руте</p>
                      <p className="text-yellow-600">Доделите руте из доње секције</p>
                    </div>
                  )}
                </div>

                {/* Available Routes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <span className="text-white text-lg">➕</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Доступне руте за додељивање</h4>
                    <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm px-3 py-1 rounded-full font-semibold">
                      {getAvailableRoutes(user.id).length} доступно
                    </span>
                  </div>
                  {getAvailableRoutes(user.id).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {getAvailableRoutes(user.id).map(route => (
                        <div key={route.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                          <div className="flex flex-col h-full">
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <span className="text-white text-xl">🛣️</span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 text-lg mb-2">{route.naziv}</h5>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{route.opis}</p>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                    route.sekcija === 'EUK' ? 'bg-green-100 text-green-800' :
                                    route.sekcija === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {route.sekcija}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg font-medium">{route.ruta}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-auto">
                              <button
                                onClick={() => assignRouteToUser(user.id, route.id)}
                                disabled={loadingRoutes}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                {loadingRoutes ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                  <span className="text-lg">➕</span>
                                )}
                                <span>Додели руту</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
                      <div className="text-green-600 text-6xl mb-4">🎉</div>
                      <p className="text-green-800 font-bold text-lg mb-2">Све доступне руте су додељене!</p>
                      <p className="text-green-600">Корисник има приступ свим рутама</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

            </div>
          ))}
          </div>
        </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Приказујем {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} од {totalUsers} корисника
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 ПО СТРАНИЦИ</option>
              <option value={10}>10 ПО СТРАНИЦИ</option>
              <option value={20}>20 ПО СТРАНИЦИ</option>
            </select>
        </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ПРЕТХОДНА
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700">
              СТРАНИЦА {currentPage} ОД {totalPages}
            </span>
            
          <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
              СЛЕДЕЋА
          </button>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}