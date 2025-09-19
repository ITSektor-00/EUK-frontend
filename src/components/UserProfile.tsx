'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from './StatusBadge';
import { apiService } from '../services/api';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const UserProfile: React.FC = () => {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await apiService.getUserProfile(token!);
      setProfileData(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Greška pri učitavanju profila');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Učitavanje profila...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Moj Profil</h2>
        <StatusBadge isActive={displayUser?.isActive || false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Osnovne informacije</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Ime i prezime</label>
              <p className="text-gray-900">{displayUser?.firstName} {displayUser?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Korisničko ime</label>
              <p className="text-gray-900">{displayUser?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{displayUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Uloga</label>
              <p className="text-gray-900 capitalize">{displayUser?.role}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Status naloga</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <StatusBadge isActive={displayUser?.isActive || false} className="text-sm" />
            </div>
            {profileData?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Registrovan</label>
                <p className="text-gray-900">
                  {new Date(profileData.createdAt).toLocaleDateString('sr-RS')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!displayUser?.isActive && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Čeka se odobrenje</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Vaš nalog čeka odobrenje od administratora. Dobićete obaveštenje kada bude odobren.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
