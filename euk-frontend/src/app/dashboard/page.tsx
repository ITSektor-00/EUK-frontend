'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ApiTest } from '../../components/ApiTest';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Добродошли у EUK платформу</h1>
            
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Информације о кориснику:</h2>
                <p><strong>Корисничко име:</strong> {user.username}</p>
                <p><strong>E-mail:</strong> {user.email}</p>
                <p><strong>Име:</strong> {user.firstName}</p>
                <p><strong>Презиме:</strong> {user.lastName}</p>
                <p><strong>Улога:</strong> {user.role}</p>
                <p><strong>Активност:</strong> {user.isActive ? 'Активан' : 'Неактиван'}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Одјави се
              </button>
            </div>
          </div>

          {/* API Test Section */}
          <ApiTest />
        </div>
      </div>
    </ProtectedRoute>
  );
} 