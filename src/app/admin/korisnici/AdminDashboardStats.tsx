'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface AdminDashboardStatsProps {
  users: User[];
  loading: boolean;
}

export default function AdminDashboardStats({ users, loading }: AdminDashboardStatsProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    admins: 0,
    obradjivaci: 0,
    potpisnik: 0,
    todayRegistrations: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const loadStats = async () => {
    if (!token) return;
    
    try {
      setStatsLoading(true);
      
      // Try to load stats with API calls, but handle failures gracefully
      let totalCount = 0;
      let activeCount = 0;
      
      try {
        const [totalCountRes, activeCountRes] = await Promise.allSettled([
          apiService.getAdminUsersCount(token),
          apiService.getAdminActiveUsersCount(token)
        ]);
        
        if (totalCountRes.status === 'fulfilled') {
          totalCount = totalCountRes.value.count || 0;
        }
        
        if (activeCountRes.status === 'fulfilled') {
          activeCount = activeCountRes.value.count || 0;
        }
      } catch (apiError) {
        console.warn('Some stats API calls failed, using fallback:', apiError);
      }
      
      // Izračunaj statistike na osnovu učitane liste korisnika
      console.log('AdminDashboardStats - Calculating stats for users:', users);
      console.log('AdminDashboardStats - Users count:', users.length);
      console.log('AdminDashboardStats - Users roles:', users.map(u => ({ id: u.id, role: u.role, isActive: u.isActive, isApproved: u.isApproved })));
      
      const userStats = {
        total: totalCount || users.length,
        pending: users.filter(u => !u.isActive).length, // Korisnici koji nisu aktivni (na čekanju)
        approved: users.filter(u => u.isActive).length, // Aktivni korisnici (odobreni)
        admins: users.filter(u => u.role === 'admin' || u.role === 'ADMIN').length,
        obradjivaci: users.filter(u => u.role === 'obradjivaci predmeta').length,
        potpisnik: users.filter(u => u.role === 'potpisnik').length,
        todayRegistrations: users.filter(u => {
          const today = new Date();
          const userDate = new Date(u.createdAt);
          return userDate.toDateString() === today.toDateString();
        }).length
      };
      
      console.log('AdminDashboardStats - Calculated stats:', userStats);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading stats:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('dozvolu') || err.message.includes('administrator')) {
          console.warn('User does not have admin privileges for stats');
        } else if (err.message.includes('sesija') || err.message.includes('ulogujte')) {
          console.warn('Session expired while loading stats');
        }
      }
      
      // Fallback na lokalno računanje
      console.log('AdminDashboardStats - Using fallback stats for users:', users);
      const fallbackStats = {
        total: users.length,
        pending: users.filter(u => !u.isActive).length, // Korisnici koji nisu aktivni (na čekanju)
        approved: users.filter(u => u.isActive).length, // Aktivni korisnici (odobreni)
        admins: users.filter(u => u.role === 'admin' || u.role === 'ADMIN').length,
        obradjivaci: users.filter(u => u.role === 'obradjivaci predmeta').length,
        potpisnik: users.filter(u => u.role === 'potpisnik').length,
        todayRegistrations: users.filter(u => {
          const today = new Date();
          const userDate = new Date(u.createdAt);
          return userDate.toDateString() === today.toDateString();
        }).length
      };
      console.log('AdminDashboardStats - Fallback stats:', fallbackStats);
      setStats(fallbackStats);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      loadStats();
    }
  }, [users.length, token]); // Only trigger when users count changes, not when users array changes

  // Prevent multiple simultaneous API calls
  const [isLoading, setIsLoading] = useState(false);
  
  const loadStatsWithDeduplication = async () => {
    if (isLoading) {
      console.log('Stats already loading, skipping duplicate request');
      return;
    }
    setIsLoading(true);
    try {
      await loadStats();
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">УКУПНО КОРИСНИКА</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Pending Approval */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">НА ЧЕКАЊУ</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Approved Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">ОДОБРЕНИ</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Today's Registrations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">ДАНАС РЕГИСТРОВАНО</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.todayRegistrations}</p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ДИСТРИБУЦИЈА УЛОГА</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.admins}</div>
            <div className="text-sm text-gray-500">АДМИНИСТРАТОРИ</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.obradjivaci}</div>
            <div className="text-sm text-gray-500">ОБРАЂИВАЧИ ПРЕДМЕТА</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.potpisnik}</div>
            <div className="text-sm text-gray-500">ПОТПИСНИЦИ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
