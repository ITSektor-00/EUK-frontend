"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '@/components/PermissionGuard';

interface MonthlyStats {
  month: string;
  users: number;
  predmeti: number;
}

interface UserActivity {
  user: string;
  actions: number;
  lastActive: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPredmeti: number;
  totalUgrozenaLica: number;
  monthlyStats: MonthlyStats[];
  userActivity: UserActivity[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalPredmeti: 0,
    totalUgrozenaLica: 0,
    monthlyStats: [],
    userActivity: []
  });

  useEffect(() => {
    // Simulacija učitavanja analitike
    setTimeout(() => {
      setAnalyticsData({
        totalUsers: 150,
        activeUsers: 120,
        totalPredmeti: 450,
        totalUgrozenaLica: 230,
        monthlyStats: [
          { month: 'Јануар', users: 45, predmeti: 120 },
          { month: 'Фебруар', users: 52, predmeti: 135 },
          { month: 'Март', users: 48, predmeti: 110 },
          { month: 'Април', users: 55, predmeti: 145 }
        ],
        userActivity: [
          { user: 'Петар Петровић', actions: 25, lastActive: '2024-01-15' },
          { user: 'Ана Анић', actions: 18, lastActive: '2024-01-14' },
          { user: 'Марко Марковић', actions: 32, lastActive: '2024-01-15' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <PermissionGuard routeName="/analytics" requiredPermission="read" userId={user?.id || undefined}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 АНАЛИТИКА
          </h1>
          <p className="text-gray-600">
            Преглед статистика и активности система
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                👥
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">УКУПНО КОРИСНИКА</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">АКТИВНИ КОРИСНИЦИ</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                📁
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">УКУПНО ПРЕДМЕТА</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalPredmeti}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                ⚠️
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">УГРОЖЕНА ЛИЦА</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUgrozenaLica}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📈 МЕСЕЧНЕ СТАТИСТИКЕ
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    МЕСЕЦ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    КОРИСНИЦИ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ПРЕДМЕТИ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.monthlyStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.predmeti}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 АКТИВНОСТ КОРИСНИКА
          </h2>
          <div className="space-y-4">
            {analyticsData.userActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">Последња активност: {activity.lastActive}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{activity.actions} акција</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
