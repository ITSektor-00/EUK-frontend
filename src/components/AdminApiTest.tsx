'use client';

import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TestResult {
  test: string;
  result: string;
  success: boolean;
  timestamp: string;
}

const AdminApiTest: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { test, result, success, timestamp }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testCreateUserRoute = async () => {
    if (!token) {
      addResult('Create User Route', 'Nije ulogovan', false);
      return;
    }

    setLoading(true);
    try {
      // Test sa validnim podacima
      const response = await apiService.createUserRoute(1, 2, 3, token);
      addResult('Create User Route', `✅ Uspešno kreirana ruta: ${JSON.stringify(response)}`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
      addResult('Create User Route', `❌ Greška: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateUserRoute = async () => {
    if (!token) {
      addResult('Update User Route', 'Nije ulogovan', false);
      return;
    }

    setLoading(true);
    try {
      // Test ažuriranja rute
      const response = await apiService.updateUserRoute(1, 2, 4, token);
      addResult('Update User Route', `✅ Uspešno ažurirana ruta: ${JSON.stringify(response)}`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
      addResult('Update User Route', `❌ Greška: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteUserRoute = async () => {
    if (!token) {
      addResult('Delete User Route', 'Nije ulogovan', false);
      return;
    }

    setLoading(true);
    try {
      // Test brisanja rute
      const response = await apiService.deleteUserRoute(1, 2, token);
      addResult('Delete User Route', `✅ Uspešno obrisana ruta: ${JSON.stringify(response)}`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
      addResult('Delete User Route', `❌ Greška: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateUserLevel = async () => {
    if (!token) {
      addResult('Update User Level', 'Nije ulogovan', false);
      return;
    }

    setLoading(true);
    try {
      // Test ažuriranja nivoa korisnika
      const response = await apiService.updateUserLevel(1, 3, token);
      addResult('Update User Level', `✅ Uspešno ažuriran nivo: ${JSON.stringify(response)}`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
      addResult('Update User Level', `❌ Greška: ${errorMessage}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testValidation = async () => {
    if (!token) {
      addResult('Validation Test', 'Nije ulogovan', false);
      return;
    }

    setLoading(true);
    try {
      // Test sa neispravnim podacima
      await apiService.createUserRoute(0, 0, 0, token);
      addResult('Validation Test', '❌ Trebalo je da baci grešku za neispravne podatke', false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
      if (errorMessage.includes('obavezni') || errorMessage.includes('1 i 5')) {
        addResult('Validation Test', `✅ Validacija radi: ${errorMessage}`, true);
      } else {
        addResult('Validation Test', `❌ Neočekivana greška: ${errorMessage}`, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    
    const tests = [
      { name: 'Validation', fn: testValidation },
      { name: 'Create User Route', fn: testCreateUserRoute },
      { name: 'Update User Route', fn: testUpdateUserRoute },
      { name: 'Update User Level', fn: testUpdateUserLevel },
      { name: 'Delete User Route', fn: testDeleteUserRoute }
    ];

    for (const test of tests) {
      await test.fn();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay između testova
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Potrebna autentifikacija</h3>
        <p className="text-yellow-700">Morate biti ulogovani kao admin da biste testirali endpoint-e.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🔧 Admin API Test - User Routes
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Kontrole</h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testValidation}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              Validation Test
            </button>
            
            <button
              onClick={testCreateUserRoute}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Route
            </button>
            
            <button
              onClick={testUpdateUserRoute}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Update Route
            </button>
            
            <button
              onClick={testUpdateUserLevel}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Update Level
            </button>
            
            <button
              onClick={testDeleteUserRoute}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete Route
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
            >
              Pokreni sve testove
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Obriši rezultate
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Status Informacije</h3>
          
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Autentifikacija:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? 'Ulogovan' : 'Nije ulogovan'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Token:</span>
              <span className={token ? 'text-green-600' : 'text-red-600'}>
                {token ? 'Prisutan' : 'Nedostaje'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Test Status:</span>
              <span className={loading ? 'text-blue-600' : 'text-gray-600'}>
                {loading ? 'U toku...' : 'Gotovo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Rezultati testova</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-400 text-green-800' 
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm mt-1">{result.result}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Testirani endpoint-i:</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li><strong>POST /api/admin/user-routes</strong> - Kreiranje user route-a</li>
          <li><strong>PUT /api/admin/user-routes/{'{userId}/{routeId}'}</strong> - Ažuriranje nivoa dozvole</li>
          <li><strong>DELETE /api/admin/user-routes/{'{userId}/{routeId}'}</strong> - Brisanje user route-a</li>
          <li><strong>PUT /api/admin/users/{'{userId}/level'}</strong> - Ažuriranje nivoa korisnika</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminApiTest;
