"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '@/components/PermissionGuard';
// import { apiService } from '../../services/api';
import { NIVOI_PRISTUPA } from '@/components/RouteGuard';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    nivoPristupa: number;
    createdAt: string;
    lastLogin: string;
    totalActions: number;
    recentActivity: Array<{ action: string; timestamp: string }>;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isActive: false,
    nivoPristupa: 1,
    createdAt: '',
    lastLogin: '',
    totalActions: 0,
    recentActivity: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    if (user && token) {
      loadProfileData();
    }
  }, [user, token]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Simulacija podataka - u stvarnosti bi pozvali API
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        role: user?.role || '',
        isActive: user?.isActive || false,
        nivoPristupa: user?.nivoPristupa || 1,
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15',
        totalActions: 45,
        recentActivity: [
          { action: 'Пријављивање', timestamp: '2024-01-15 10:30' },
          { action: 'Преглед предмета', timestamp: '2024-01-15 09:15' },
          { action: 'Додавање новог предмета', timestamp: '2024-01-14 16:45' },
          { action: 'Измена профила', timestamp: '2024-01-14 14:20' }
        ]
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Simulacija čuvanja - u stvarnosti bi pozvali API
      setProfileData(prev => ({
        ...prev,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email
      }));
      setIsEditing(false);
      alert('Профил је успешно ажуриран!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Грешка при чувању профила!');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      firstName: '',
      lastName: '',
      email: ''
    });
  };

  const getLevelName = (level: number) => {
    return (NIVOI_PRISTUPA as any)[level] || "❌ Нема приступ";
  };

  const getLevelColor = (level: number) => {
    const colors = {
      2: '#4caf50', // Zelena - Potpisnik
      3: '#2196f3', // Plava - Obrađivač
      5: '#9c27b0'  // Ljubičasta - Admin
    };
    return (colors as any)[level] || '#e0e0e0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <PermissionGuard routeName="/profile" requiredPermission="read" userId={user?.id || undefined}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👤 ПРОФИЛ КОРИСНИКА
          </h1>
          <p className="text-gray-600">
            Управљање личним подацима и активностима
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 ОСНОВНИ ПОДАЦИ
            </h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                УРЕДИ ПРОФИЛ
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Презиме
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Емаил
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  САЧУВАЈ
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  ОТКАЖИ
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Име</p>
                <p className="text-lg text-gray-900">{profileData.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Презиме</p>
                <p className="text-lg text-gray-900">{profileData.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Емаил</p>
                <p className="text-lg text-gray-900">{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Улога</p>
                <p className="text-lg text-gray-900">{profileData.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Статус</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  profileData.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profileData.isActive ? '✅ Активан' : '⏳ На чекању'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ниво приступа</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {profileData.nivoPristupa} - {getLevelName(profileData.nivoPristupa)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Датум регистрације</p>
                <p className="text-lg text-gray-900">{profileData.createdAt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Nivo pristupa vizuelni prikaz */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 НИВО ПРИСТУПА
          </h2>
          <div className="space-y-4">
            <div
              style={{
                background: `linear-gradient(90deg, ${getLevelColor(profileData.nivoPristupa)} ${profileData.nivoPristupa * 20}%, #e0e0e0 ${profileData.nivoPristupa * 20}%)`,
                height: '40px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}
            >
              {getLevelName(profileData.nivoPristupa)}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 5].map((level) => (
                <div
                  key={level}
                  className={`h-3 rounded-full ${
                    level <= profileData.nivoPristupa 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                  }`}
                  title={`Ниво ${level} - ${getLevelName(level)}`}
                />
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Доступне функционалности:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Преглед профила</li>
                {profileData.nivoPristupa >= 2 && <li>✅ ✍️ Потписивање докумената</li>}
                {profileData.nivoPristupa >= 3 && <li>✅ 📋 Обрађивање предмета</li>}
                {profileData.nivoPristupa >= 5 && <li>✅ 👑 Администрација система</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                📊
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">УКУПНО АКЦИЈА</p>
                <p className="text-2xl font-bold text-gray-900">{profileData.totalActions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                🕒
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ПОСЛЕДЊА ПРИЈАВА</p>
                <p className="text-lg font-bold text-gray-900">{profileData.lastLogin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                📅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ЧЛАН ОД</p>
                <p className="text-lg font-bold text-gray-900">{profileData.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🕒 НЕДАВНЕ АКТИВНОСТИ
          </h2>
          <div className="space-y-3">
            {profileData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
                <div className="text-blue-600">
                  ✓
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
