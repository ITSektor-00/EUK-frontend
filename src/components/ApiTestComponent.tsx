'use client';

import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useRetry } from '../hooks/useRetry';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { webSocketService } from '../services/websocketService';

const ApiTestComponent: React.FC = () => {
  const { apiCall, loading, error } = useApi();
  const { executeWithRetry, isRetrying, retryCount } = useRetry({
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: (error) => {
      // Retry za network greške i 5xx greške
      return error.message.includes('Failed to fetch') || 
             error.message.includes('NetworkError') ||
             error.message.includes('500') ||
             error.message.includes('502') ||
             error.message.includes('503');
    }
  });
  
  const { token, isAuthenticated } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (test: string, result: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { test, result, success, timestamp }]);
  };

  const runBasicApiTest = async () => {
    try {
      const result = await apiCall('/api/test/hello');
      addResult('Basic API Test', `Success: ${result}`, true);
    } catch (err) {
      addResult('Basic API Test', `Error: ${err}`, false);
    }
  };

  const runRetryTest = async () => {
    try {
      const result = await executeWithRetry(async () => {
        // Simuliraj grešku za demonstraciju retry logike
        const response = await fetch('/api/test/fail');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Simulated error for retry test`);
        }
        return response.json();
      });
      addResult('Retry Test', `Success: ${JSON.stringify(result)}`, true);
    } catch (err) {
      addResult('Retry Test', `Failed after ${retryCount} retries: ${err}`, false);
    }
  };

  const runAuthTest = async () => {
    if (!isAuthenticated || !token) {
      addResult('Auth Test', 'User not authenticated', false);
      return;
    }

    try {
      const result = await apiCall('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      addResult('Auth Test', `User: ${result.username}`, true);
    } catch (err) {
      addResult('Auth Test', `Error: ${err}`, false);
    }
  };

  const runCredentialsValidationTest = async () => {
    try {
      // Test sa neispravnim credentials-ima
      await apiService.signIn({
        usernameOrEmail: '',
        password: ''
      });
      addResult('Credentials Validation', 'Should have failed but succeeded', false);
    } catch (err) {
      addResult('Credentials Validation', `Correctly rejected: ${err}`, true);
    }
  };

  const runWebSocketTest = async () => {
    try {
      // Test WebSocket konekcije
      if (webSocketService.isConnectedToWebSocket()) {
        addResult('WebSocket Test', '✅ WebSocket je već povezan', true);
        
        // Test slanje poruke
        webSocketService.sendMessage('Test message from ApiTestComponent', 'test');
        addResult('WebSocket Message', '✅ Poruka poslata preko WebSocket-a', true);
      } else {
        addResult('WebSocket Test', '⚠️ WebSocket nije povezan - pokušava se povezivanje...', false);
        
        // Pokušaj ponovnog povezivanja
        setTimeout(() => {
          if (webSocketService.isConnectedToWebSocket()) {
            addResult('WebSocket Reconnect', '✅ WebSocket uspešno povezan nakon retry-a', true);
          } else {
            addResult('WebSocket Reconnect', '❌ WebSocket i dalje nije povezan', false);
          }
        }, 3000);
      }
    } catch (err) {
      addResult('WebSocket Test', `❌ Greška: ${err}`, false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    setTestResults([]);
    
    const tests = [
      { name: 'Basic API', fn: runBasicApiTest },
      { name: 'Retry Logic', fn: runRetryTest },
      { name: 'Auth Test', fn: runAuthTest },
      { name: 'Credentials Validation', fn: runCredentialsValidationTest },
      { name: 'WebSocket Test', fn: runWebSocketTest }
    ];

    for (const test of tests) {
      setTestResults(prev => [...prev, `Running ${test.name}...`]);
      await test.fn();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay između testova
    }
    
    setTestResults(prev => [...prev, 'All tests completed!']);
  };

  const clearResults = () => {
    setResults([]);
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        API Test Komponent - Poboljšanja Error Handling-a
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Kontrole</h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runBasicApiTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Basic API Test
            </button>
            
            <button
              onClick={runRetryTest}
              disabled={isRetrying}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Retry Test {isRetrying && `(${retryCount}/3)`}
            </button>
            
            <button
              onClick={runAuthTest}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Auth Test
            </button>
            
            <button
              onClick={runCredentialsValidationTest}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              Credentials Validation
            </button>
            
            <button
              onClick={runWebSocketTest}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              WebSocket Test
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={runAllTests}
              disabled={loading || isRetrying}
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
              <span className="font-medium">API Loading:</span>
              <span className={loading ? 'text-blue-600' : 'text-gray-600'}>
                {loading ? 'U toku...' : 'Gotovo'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Retry u toku:</span>
              <span className={isRetrying ? 'text-orange-600' : 'text-gray-600'}>
                {isRetrying ? `Pokušaj ${retryCount}/3` : 'Ne'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Autentifikacija:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? 'Ulogovan' : 'Nije ulogovan'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">WebSocket:</span>
              <span className={webSocketService.isConnectedToWebSocket() ? 'text-green-600' : 'text-red-600'}>
                {webSocketService.isConnectedToWebSocket() ? 'Povezan' : 'Nije povezan'}
              </span>
            </div>
            
            {error && (
              <div className="flex justify-between">
                <span className="font-medium">API Greška:</span>
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Progress */}
      {testResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Progress</h3>
          <div className="bg-blue-50 p-4 rounded-md">
            {testResults.map((result, index) => (
              <div key={index} className="text-blue-800">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Poboljšanja koja se testiraju:</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Poboljšana validacija credentials-a</li>
          <li>Retry logika sa eksponencijalnim backoff-om</li>
          <li>Bolje error handling sa specifičnim porukama</li>
          <li>Validacija token-a i API odgovora</li>
          <li>Automatsko brisanje sesije za 401 greške</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTestComponent;
