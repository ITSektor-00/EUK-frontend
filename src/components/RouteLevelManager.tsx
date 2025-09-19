"use client";
import React, { useState } from 'react';
import { NIVOI_PRISTUPA } from './RouteGuard';

interface Route {
  id: number;
  ruta: string;
  naziv: string;
  opis: string;
  sekcija: string;
  nivoMin: number;
  nivoMax: number;
  aktivna: boolean;
  datumKreiranja: string;
}

interface UserRoute {
  id: number;
  userId: number;
  routeId: number;
  route: string;
  nivoDozvola: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    nivoPristupa: number;
  };
  routeDto: {
    id: number;
    ruta: string;
    naziv: string;
    nivoMin: number;
    nivoMax: number;
  };
}

interface RouteLevelManagerProps {
  userId: number;
  userName: string;
  userRole: string;
  userLevel: number;
  routes: Route[];
  userRoutes: UserRoute[];
  onRouteAdd: (userId: number, routeId: number, nivoDozvola: number) => void;
  onRouteUpdate: (userId: number, routeId: number, nivoDozvola: number) => void;
  onRouteRemove: (userId: number, routeId: number) => void;
}

export const RouteLevelManager: React.FC<RouteLevelManagerProps> = ({
  userId,
  userName,
  userRole,
  userLevel,
  routes,
  userRoutes,
  onRouteAdd,
  onRouteUpdate,
  onRouteRemove
}) => {
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);

  const getUserRouteLevel = (routeId: number): number => {
    const userRoute = userRoutes.find(ur => ur.userId === userId && ur.routeId === routeId);
    return userRoute ? userRoute.nivoDozvola : 0;
  };

  const hasRoute = (routeId: number): boolean => {
    return userRoutes.some(ur => ur.userId === userId && ur.routeId === routeId);
  };

  const getLevelColor = (level: number) => {
    const colors = {
      1: '#f44336', // Crvena
      2: '#ff9800', // Narandžasta  
      3: '#2196f3', // Plava
      4: '#4caf50', // Zelena
      5: '#9c27b0'  // Ljubičasta
    };
    return (colors as any)[level] || '#e0e0e0';
  };

  const getLevelIcon = (level: number) => {
    const icons = {
      1: '🔴',
      2: '🟠', 
      3: '🔵',
      4: '🟢',
      5: '🟣'
    };
    return (icons as any)[level] || '⚪';
  };

  const getSekcijaIcon = (sekcija: string) => {
    const icons = {
      'EUK': '📁',
      'REPORTS': '📊',
      'ANALYTICS': '📈',
      'SETTINGS': '⚙️',
      'PROFILE': '👤'
    };
    return (icons as any)[sekcija] || '📄';
  };

  // Filtrirati rute na osnovu uloge korisnika
  const getFilteredRoutes = () => {
    if (userRole === 'ADMIN') {
      return routes; // Admin vidi sve rute
    } else if (userRole === 'OBRADJIVAC') {
      return routes.filter(route => 
        route.sekcija === 'EUK' || 
        route.ruta === 'profile' || 
        route.ruta === 'settings'
      );
    } else if (userRole === 'POTPISNIK') {
      return routes.filter(route => 
        route.ruta === 'euk/stampanje' || 
        route.ruta === 'profile' || 
        route.ruta === 'settings'
      );
    }
    return routes;
  };

  const filteredRoutes = getFilteredRoutes();

  // Grupiši filtrirane rute po sekcijama
  const routesBySekcija = filteredRoutes.reduce((acc, route) => {
    if (!acc[route.sekcija]) {
      acc[route.sekcija] = [];
    }
    acc[route.sekcija].push(route);
    return acc;
  }, {} as Record<string, Route[]>);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛣️ Управљање рутама за {userName}
        </h3>
        <p className="text-sm text-gray-600">
          Доделите или промените нивое приступа за различите руте у систему
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(routesBySekcija).map(([sekcija, sekcijaRoutes]) => (
          <div key={sekcija} className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <span className="text-lg">{getSekcijaIcon(sekcija)}</span>
                <span>{sekcija}</span>
              </h4>
            </div>
            
            <div className="p-4 space-y-3">
              {sekcijaRoutes.map((route) => {
                const userLevel = getUserRouteLevel(route.id);
                const hasAccess = hasRoute(route.id);
                const isExpanded = expandedRoute === route.id;

                return (
                  <div key={route.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">{route.naziv}</h5>
                            <span className="text-sm text-gray-500">({route.ruta})</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{route.opis}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Захтевани ниво:</span>
                              <div className="flex items-center space-x-1">
                                {getLevelIcon(route.nivoMin)}
                                <span className="text-xs font-medium">{route.nivoMin}</span>
                                <span className="text-xs text-gray-400">-</span>
                                {getLevelIcon(route.nivoMax)}
                                <span className="text-xs font-medium">{route.nivoMax}</span>
                              </div>
                            </div>
                            {hasAccess && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Тренутни ниво:</span>
                                <div className="flex items-center space-x-1">
                                  {getLevelIcon(userLevel)}
                                  <span className="text-xs font-medium">{userLevel}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {hasAccess ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={userLevel}
                                  onChange={(e) => onRouteUpdate(userId, route.id, parseInt(e.target.value))}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value={1}>Ниво 1</option>
                                  <option value={2}>Ниво 2</option>
                                  <option value={3}>Ниво 3</option>
                                  <option value={4}>Ниво 4</option>
                                  <option value={5}>Ниво 5</option>
                                </select>
                                <button
                                  onClick={() => onRouteRemove(userId, route.id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                  Уклони
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => onRouteAdd(userId, route.id, route.nivoMin)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Додај руту
                            </button>
                          )}
                          
                          <button
                            onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            {isExpanded ? 'Сакриј' : 'Детаљи'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Информације о рути:</h6>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div><strong>ID:</strong> {route.id}</div>
                                <div><strong>Рута:</strong> {route.ruta}</div>
                                <div><strong>Секција:</strong> {route.sekcija}</div>
                                <div><strong>Активна:</strong> {route.aktivna ? 'Да' : 'Не'}</div>
                                <div><strong>Креирана:</strong> {new Date(route.datumKreiranja).toLocaleDateString('sr-RS')}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Нивои приступа:</h6>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Минимални ниво:</span>
                                  <div className="flex items-center space-x-1">
                                    {getLevelIcon(route.nivoMin)}
                                    <span className="text-xs font-medium">{route.nivoMin} - {(NIVOI_PRISTUPA as any)[route.nivoMin]}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Максимални ниво:</span>
                                  <div className="flex items-center space-x-1">
                                    {getLevelIcon(route.nivoMax)}
                                    <span className="text-xs font-medium">{route.nivoMax} - {(NIVOI_PRISTUPA as any)[route.nivoMax]}</span>
                                  </div>
                                </div>
                                {hasAccess && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Тренутни ниво:</span>
                                    <div className="flex items-center space-x-1">
                                      {getLevelIcon(userLevel)}
                                      <span className="text-xs font-medium">{userLevel} - {(NIVOI_PRISTUPA as any)[userLevel]}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
