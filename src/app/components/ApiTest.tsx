import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ApiResult {
  status: number | string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

interface ApiResults {
  [key: string]: ApiResult;
}

export default function ApiTest() {
  const { token } = useAuth();
  const [results, setResults] = useState<ApiResults>({});
  const [loading, setLoading] = useState<string | null>(null);

  const baseURL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com');

  const testEndpoint = async (endpoint: string, name: string) => {
    setLoading(name);
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testAll = () => {
    testEndpoint('/api/euk/kategorije', 'Kategorije');
    testEndpoint('/api/euk/predmeti', 'Predmeti');
    testEndpoint('/api/euk/ugrozena-lica', 'Ugrožena lica');
    testEndpoint('/api/auth/me', 'Auth Me');
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      <p className="text-sm text-gray-600 mb-4">Backend URL: {baseURL}</p>
      
      <div className="mb-4">
        <button
          onClick={testAll}
          disabled={loading !== null}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? `Testiram ${loading}...` : 'Testiraj sve API-je'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]: [string, ApiResult]) => (
          <div key={name} className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">{name}</h4>
            <div className="text-sm">
              <p>Status: <span className={result.ok ? 'text-green-600' : 'text-red-600'}>{result.status}</span></p>
              {result.data !== undefined && (
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <p className="text-red-600 mt-2">{result.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
