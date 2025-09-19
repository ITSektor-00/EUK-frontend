"use client";
import React, { useState } from 'react';
import { useAdminUsers, useAdminRoutes } from '@/hooks/useRouteAccess';
import RouteService from '@/services/routeService';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  nivoPristupa: number;
}

interface Route {
  id: number;
  ruta: string;
  naziv: string;
  opis: string;
  sekcija: string;
  aktivna: boolean;
}

interface UserRoute {
  id: number;
  userId: number;
  routeId: number;
  route: string;
  nivoDozvola: number;
}

const UserRouteManager: React.FC = () => {
  const { user, token } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoutes, setUserRoutes] = useState<UserRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hooks za dohvatanje podataka
  const { users, loading: usersLoading, error: usersError } = useAdminUsers();
  const { routes, loading: routesLoading, error: routesError } = useAdminRoutes();

  // Dohvati rute koje korisnik može da vidi
  const fetchUserAccessibleRoutes = async (userId: number) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const routes = await RouteService.getAccessibleRoutes(userId, token);
      setUserRoutes(routes);
    } catch (err) {
      console.error('Error fetching user routes:', err);
      setError('Greška pri učitavanju ruta korisnika');
    } finally {
      setLoading(false);
    }
  };

  // Dodeli rutu korisniku
  const assignRouteToUser = async (userId: number, routeId: number) => {
    if (!token) return;

    try {
      setError(null);
      setSuccess(null);
      
      await RouteService.assignRoute(userId, routeId, token);
      
      // Osveži listu ruta
      await fetchUserAccessibleRoutes(userId);
      
      setSuccess('Ruta je uspešno dodeljena korisniku!');
      
      // Ukloni success poruku nakon 3 sekunde
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning route:', err);
      setError(err instanceof Error ? err.message : 'Greška pri dodeljivanju rute!');
      
      // Ukloni error poruku nakon 5 sekundi
      setTimeout(() => setError(null), 5000);
    }
  };

  // Oduzmi rutu od korisnika
  const removeRouteFromUser = async (userId: number, routeId: number) => {
    if (!token) return;

    try {
      setError(null);
      setSuccess(null);
      
      const success = await RouteService.removeRoute(userId, routeId, token);
      
      if (success) {
        // Osveži listu ruta
        await fetchUserAccessibleRoutes(userId);
        setSuccess('Ruta je uspešno uklonjena!');
        
        // Ukloni success poruku nakon 3 sekunde
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Greška pri uklanjanju rute!');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error removing route:', err);
      setError('Greška pri uklanjanju rute!');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Proveri da li korisnik ima rutu
  const hasRoute = (routeId: number): boolean => {
    return userRoutes.some(ur => ur.routeId === routeId);
  };

  // Dohvati dostupne rute za dodeljivanje
  const getAvailableRoutes = (): Route[] => {
    return routes.filter(route => !hasRoute(route.id));
  };

  // Proveri da li je korisnik admin
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">🚫</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Немате приступ
          </h3>
          <p className="text-gray-600">
            Само администратори могу да управљају рутама корисника.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🛣️ Управљање рутама корисника
        </h2>
        <p className="text-gray-600">
          Доделите или уклоните руте за различите кориснике у систему
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista korisnika */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Корисници
          </h3>
          
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : usersError ? (
            <div className="text-red-600 text-center py-4">
              Greška pri učitavanju korisnika: {usersError}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedUser(user);
                    fetchUserAccessibleRoutes(user.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        @{user.username} • {user.email}
                      </p>
                    </div>
                    <div className="text-right">
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
                      <div className="text-xs text-gray-500 mt-1">
                        Ниво {user.nivoPristupa}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rute za selektovanog korisnika */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {selectedUser ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🛣️ Рутe за: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Trenutne rute */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Тренутне руте:
                    </h4>
                    {userRoutes.length > 0 ? (
                      <div className="space-y-2">
                        {userRoutes.map((route) => (
                          <div
                            key={route.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {route.route}
                              </span>
                            </div>
                            <button
                              onClick={() => removeRouteFromUser(selectedUser.id, route.routeId)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Уклони
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Корисник нема додељене руте
                      </p>
                    )}
                  </div>

                  {/* Dostupne rute za dodeljivanje */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Доступне руте за додељивање:
                    </h4>
                    {routesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : routesError ? (
                      <div className="text-red-600 text-sm">
                        Greška pri učitavanju ruta: {routesError}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getAvailableRoutes().length > 0 ? (
                          getAvailableRoutes().map((route) => (
                            <div
                              key={route.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                              <div>
                                <span className="font-medium text-gray-900">
                                  {route.naziv}
                                </span>
                                <div className="text-sm text-gray-600">
                                  {route.opis}
                                </div>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                  route.sekcija.toLowerCase() === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {route.sekcija}
                                </span>
                              </div>
                              <button
                                onClick={() => assignRouteToUser(selectedUser.id, route.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                Додели руту
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">
                            Све руте су већ додељене овом кориснику
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👆</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Изаберите корисника
              </h4>
              <p className="text-gray-600">
                Кликните на корисника са леве стране да бисте управљали његовим рутама
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRouteManager;
