"use client";
import React, { useState } from 'react';
import { NIVOI_PRISTUPA } from './RouteGuard';
import { apiService } from '@/services/api';

// Definicija uloga u sistemu - pojednostavljen sistem
const SYSTEM_ROLES = {
  KORISNIK: {
    name: 'KORISNIK',
    displayName: 'Корисник',
    description: 'Приступ EUK функционалностима',
    icon: '👤',
    level: 1
  },
  ADMIN: {
    name: 'ADMIN',
    displayName: 'Администратор',
    description: 'Пун приступ систему',
    icon: '👑',
    level: 5
  }
};

interface UserLevelManagerProps {
  userId: number;
  currentLevel: number;
  userName: string;
  userRole: string;
  onLevelChange: (newLevel: number) => void;
  token: string;
}

export const UserLevelManager: React.FC<UserLevelManagerProps> = ({
  userId,
  currentLevel,
  userName,
  userRole,
  onLevelChange,
  token
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newLevel, setNewLevel] = useState(currentLevel);
  const [loading, setLoading] = useState(false);

  const getLevelColor = (level: number) => {
    const colors = {
      1: '#2196f3', // Plava
      5: '#9c27b0'  // Ljubičasta
    };
    return (colors as any)[level] || '#e0e0e0';
  };

  const getLevelIcon = (level: number) => {
    const icons = {
      1: '👤', // Korisnik
      5: '👑'  // Admin
    };
    return (icons as any)[level] || '⚪';
  };

  const getAvailableLevels = () => {
    if (userRole === 'ADMIN') {
      return [5]; // Samo admin nivo
    } else if (userRole === 'KORISNIK') {
      return [1]; // Samo korisnik nivo
    }
    return [1, 5]; // Svi nivoi ako uloga nije definisana
  };

  const getLevelDisplayName = (level: number) => {
    const names = {
      1: '👤 Корисник',
      5: '👑 Администратор'
    };
    return (names as any)[level] || `Ниво ${level}`;
  };

  const handleSave = async () => {
    if (newLevel === currentLevel) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await apiService.updateUserLevel(userId, newLevel, token);
      onLevelChange(newLevel);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user level:', error);
      alert('Грешка при ажурирању нивоа корисника!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewLevel(currentLevel);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🎯 Управљање нивоом приступа
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Уреди ниво
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Trenutni nivo */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl">{getLevelIcon(currentLevel)}</div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Корисник: {userName}</div>
            <div className="text-lg font-semibold text-gray-900">
              {getLevelDisplayName(currentLevel)}
            </div>
          </div>
        </div>

        {/* Vizuelni prikaz nivoa */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Тренутни ниво приступа:</div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{getLevelIcon(currentLevel)}</span>
            <div>
              <div className="font-medium text-gray-900">
                {getLevelDisplayName(currentLevel)}
              </div>
              <div className="text-sm text-gray-600">
                Ниво {currentLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Editing mode */}
        {isEditing && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              Изаберите нови ниво приступа:
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {getAvailableLevels().map((level) => (
                <label
                  key={level}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    newLevel === level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={level}
                    checked={newLevel === level}
                    onChange={(e) => setNewLevel(parseInt(e.target.value))}
                    className="sr-only"
                  />
                  <div className="text-2xl">{getLevelIcon(level)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getLevelDisplayName(level)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {level === 1 && 'Корисник - приступ EUK функционалностима'}
                      {level === 5 && 'Администратор - приступ свим функционалностима'}
                    </div>
                  </div>
                  {newLevel === level && (
                    <div className="text-blue-500">✓</div>
                  )}
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Чувам...' : 'Сачувај ниво'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Откажи
              </button>
            </div>
          </div>
        )}

        {/* Dostupne funkcionalnosti */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Системске улоге:</div>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
              <div
                key={key}
                className={`flex items-center space-x-2 text-sm ${
                  currentLevel === role.level ? 'text-green-600 bg-green-50 p-2 rounded' : 'text-gray-400'
                }`}
              >
                <span>{currentLevel === role.level ? '✅' : '❌'}</span>
                <span>{role.icon} {role.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
