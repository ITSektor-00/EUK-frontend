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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎛️ Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Dobrodošli, {user?.firstName}! Ovo je vaš admin panel za upravljanje sistemom.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => router.push('/admin/korisnici')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-md transition-colors"
        >
          <div className="text-2xl mb-2">👥</div>
          <h3 className="text-lg font-semibold">Upravljanje Korisnicima</h3>
          <p className="text-sm opacity-90">Pregled, odobravanje i upravljanje korisnicima</p>
        </button>

        <button
          onClick={() => router.push('/admin/korisnici')}
          className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg shadow-md transition-colors"
        >
          <div className="text-2xl mb-2">⏳</div>
          <h3 className="text-lg font-semibold">Čekaju Odobrenje</h3>
          <p className="text-sm opacity-90">{stats.pendingUsers} korisnika čeka odobrenje</p>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ukupno Korisnika</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktivni Korisnici</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Čekaju Odobrenje</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingUsers}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Korisnici</p>
              <p className="text-2xl font-bold text-gray-900">{stats.adminUsers}</p>
            </div>
            <div className="text-3xl">👑</div>
          </div>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistike po Ulogama</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">👑 Admin</span>
              <span className="font-semibold">{stats.adminUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">👤 Korisnici</span>
              <span className="font-semibold">{stats.korisnikUsers}</span>
            </div>
          </div>
        </div>

        {/* Pending Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⏳ Korisnici koji Čekaju Odobrenje</h3>
          {pendingUsers.length > 0 ? (
            <div className="space-y-3">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{pendingUser.firstName} {pendingUser.lastName}</p>
                    <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    <p className="text-xs text-gray-500">{pendingUser.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      ✅ Odobri
                    </button>
                    <button
                      onClick={() => handleRejectUser(pendingUser.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      ❌ Odbij
                    </button>
                  </div>
                </div>
              ))}
              {stats.pendingUsers > 5 && (
                <button
                  onClick={() => router.push('/admin/korisnici')}
                  className="w-full mt-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Pogledaj sve ({stats.pendingUsers})
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nema korisnika koji čekaju odobrenje</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Uputstva za Admin</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">👥 Upravljanje Korisnicima</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pregledaj sve korisnike u sistemu</li>
              <li>• Odobri ili odbij nove registracije</li>
              <li>• Promeni uloge korisnika (admin/korisnik)</li>
              <li>• Aktiviraj/deaktiviraj naloge</li>
              <li>• Svi korisnici imaju pristup EUK funkcionalnostima</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
