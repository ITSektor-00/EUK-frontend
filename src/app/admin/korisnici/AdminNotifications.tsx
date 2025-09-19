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

interface AdminNotificationsProps {
  onNewUsers?: (count: number) => void;
}

export default function AdminNotifications({ onNewUsers }: AdminNotificationsProps) {
  const { token } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prvo pokušaj sa AdminController API-jem za aktivne korisnike
      let response;
      try {
        response = await apiService.getAdminActiveUsers(token!);
      } catch (err) {
        // Ako AdminController API ne radi, koristi UserController API
        console.log('AdminController API failed, trying UserController API...');
        try {
          response = await apiService.getActiveUsers(token!);
        } catch (fallbackErr) {
          console.log('UserController API failed, trying getAllUsers...');
          try {
            response = await apiService.getAllUsers(token!);
          } catch (finalErr) {
            console.warn('All APIs failed, using empty response:', finalErr);
            response = { users: [] };
          }
        }
      }
      
      const pending = (response.users || []).filter((user: User) => 
        !user.isApproved && user.isActive
      );
      setPendingUsers(pending);
      onNewUsers?.(pending.length);
    } catch (err) {
      console.error('Error loading pending users:', err);
      setError('Greška pri učitavanju novih korisnika.');
      // Ne prikazuj notifikacije ako ima greške
      setPendingUsers([]);
      onNewUsers?.(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadPendingUsers();
      // Osvěži svakih 10 minuta da smanjimo opterećenje servera
      const interval = setInterval(loadPendingUsers, 600000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleQuickApprove = async (userId: number) => {
    try {
      setError(null);
      await apiService.approveUser(userId, token!);
      await loadPendingUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Грешка при одобревању корисника.');
    }
  };

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge */}
        {pendingUsers.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingUsers.length > 9 ? '9+' : pendingUsers.length}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Нови корисници ({pendingUsers.length})
            </h3>
            <p className="text-sm text-gray-500">Чекају одобрење за приступ</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto">
            {pendingUsers.map((user) => (
              <div key={user.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('sr-Latn-RS')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleQuickApprove(user.id)}
                      className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs transition-colors"
                      title="Одобри"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => {
                setShowNotifications(false);
                window.location.href = '/admin/korisnici';
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Погледај све кориснике
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
