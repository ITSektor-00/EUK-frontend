'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  adminUsers: number;
  korisnikUsers: number;
}

interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    adminUsers: 0,
    korisnikUsers: 0
  });
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      loadDashboardData();
    }
  }, [user, token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Pokušaj da učitaj sve korisnike (glavni izvor podataka)
      let allUsers: any[] = [];
      try {
        // Pokušaj sa paginacijom prvo
        const response = await apiService.getUsersWithPagination(token!, 0, 1000); // Uzmi sve korisnike
        allUsers = response.content || response.users || [];
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback - prazan niz
        allUsers = [];
      }

      // Izračunaj statistike iz allUsers
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u: any) => u.isActive).length;
      const pendingUsers = allUsers.filter((u: any) => !u.isActive).length;

      // Izračunaj statistike po ulogama - pojednostavljen sistem
      const roleStats = allUsers.reduce((acc: any, user: any) => {
        if (user.role === 'admin' || user.role === 'ADMIN') acc.adminUsers++;
        else acc.korisnikUsers++; // Svi ostali su korisnici
        return acc;
      }, { adminUsers: 0, korisnikUsers: 0 });

      setStats({
        totalUsers,
        activeUsers,
        pendingUsers,
        ...roleStats
      });

      // Učitaj korisnike koji čekaju odobrenje
      const pending = allUsers.filter((u: any) => !u.isActive);
      setPendingUsers(pending.slice(0, 5)); // Prikaži samo prvih 5

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback statistike
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        adminUsers: 0,
        korisnikUsers: 0
      });
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await apiService.approveUser(userId, token!);
      await loadDashboardData(); // Osveži podatke
    } catch (error) {
      console.error('Error approving user:', error);
      // Fallback - samo osveži podatke
      await loadDashboardData();
    }
  };

  const handleRejectUser = async (userId: number) => {
    try {
      await apiService.rejectUser(userId, token!);
      await loadDashboardData(); // Osveži podatke
    } catch (error) {
      console.error('Error rejecting user:', error);
      // Fallback - samo osveži podatke
      await loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Админ Контролна Табла
              </h1>
              <p className="text-gray-600 text-lg">
                Добродошли, <span className="font-semibold text-blue-600">{user?.firstName}</span>! 
                Ово је ваш админ панел за управљање системом.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Последње ажурирање</div>
              <div className="text-lg font-semibold text-gray-700">
                {new Date().toLocaleTimeString('sr-Latn-RS')}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/korisnici')}
            className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">👥</div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Управљање Корисницима</h3>
            <p className="text-sm opacity-90">Преглед, одобравање и управљање корисницима</p>
            <div className="mt-4 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
              Кликни за детаље →
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/korisnici')}
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">⏳</div>
              <div className="text-2xl font-bold">{stats.pendingUsers}</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Чекају Одобрење</h3>
            <p className="text-sm opacity-90">Корисници који чекају одобрење</p>
            <div className="mt-4 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
              Кликни за детаље →
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/korisnici')}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">✅</div>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Активни Корисници</h3>
            <p className="text-sm opacity-90">Корисници са активним налозима</p>
            <div className="mt-4 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
              Кликни за детаље →
            </div>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Укупно Корисника</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Регистровани корисници</p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Активни Корисници</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% од укупно
                </p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Чекају Одобрење</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pendingUsers > 0 ? 'Потребна акција' : 'Све је у реду'}
                </p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Админ Корисници</p>
                <p className="text-3xl font-bold text-gray-900">{stats.adminUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Администратори система</p>
              </div>
              <div className="text-4xl opacity-80">👑</div>
            </div>
          </div>
        </div>

        {/* Role Statistics & Pending Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              Статистике по Улогама
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👑</div>
                  <span className="text-gray-700 font-medium">Админ</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.adminUsers}</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👤</div>
                  <span className="text-gray-700 font-medium">Корисници</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.korisnikUsers}</div>
              </div>
            </div>
          </div>

          {/* Pending Users */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              Корисници који Чекају Одобрење
            </h3>
            {pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.map((pendingUser) => (
                  <div key={pendingUser.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{pendingUser.firstName} {pendingUser.lastName}</p>
                      <p className="text-sm text-gray-600">{pendingUser.email}</p>
                      <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                        {pendingUser.role}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApproveUser(pendingUser.id)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Одобри
                      </button>
                      <button
                        onClick={() => handleRejectUser(pendingUser.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Одустани
                      </button>
                    </div>
                  </div>
                ))}
                {stats.pendingUsers > 5 && (
                  <button
                    onClick={() => router.push('/admin/korisnici')}
                    className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                  >
                    Погледај све ({stats.pendingUsers})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-500 text-lg">Нема корисника који чекају одобрење</p>
                <p className="text-gray-400 text-sm mt-2">Све је у реду!</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg border border-blue-100">
          <h3 className="text-2xl font-semibold text-blue-900 mb-6 flex items-center">
            Упутства за Админ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center text-lg">
                Управљање Корисницима
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Прегледај све кориснике у систему
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Одобри или одбиј нове регистрације
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Промени улоге корисника (админ/корисник)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Активирај/деактивирај налоге
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Сви корисници имају приступ ЕУК функционалностима
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center text-lg">
                Брзе Акције
              </h4>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Кликни на картице за брз приступ
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Одобри кориснике директно из контролне табле
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Прегледај статистике у реалном времену
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Прати активност система
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
