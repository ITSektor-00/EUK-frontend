'use client';

import { useState } from 'react';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';

export const ApiTest: React.FC = () => {
  const { apiCall, loading: hookLoading, error: hookError } = useApi();
  const [testResults, setTestResults] = useState<{
    hello?: string;
    status?: string;
    echo?: string;
    cors?: any;
  }>({});
  const [loading, setLoading] = useState<{
    hello: boolean;
    status: boolean;
    echo: boolean;
    cors: boolean;
  }>({
    hello: false,
    status: false,
    echo: false,
    cors: false
  });
  const [echoMessage, setEchoMessage] = useState('Test poruka');

  const testHello = async () => {
    setLoading(prev => ({ ...prev, hello: true }));
    try {
      const result = await apiService.testHello();
      setTestResults(prev => ({ ...prev, hello: result }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, hello: `Greška: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, hello: false }));
    }
  };

  const testStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    try {
      const result = await apiService.testStatus();
      setTestResults(prev => ({ ...prev, status: result }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, status: `Greška: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const testEcho = async () => {
    setLoading(prev => ({ ...prev, echo: true }));
    try {
      const result = await apiService.testEcho(echoMessage);
      setTestResults(prev => ({ ...prev, echo: result }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, echo: `Greška: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, echo: false }));
    }
  };

  const testCORS = async () => {
    setLoading(prev => ({ ...prev, cors: true }));
    try {
      const result = await apiService.testCORS();
      setTestResults(prev => ({ ...prev, cors: result }));
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, cors: `Greška: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, cors: false }));
    }
  };

  const testAllEndpoints = async () => {
    try {
      // Test hello
      const helloResult = await apiService.testHello();
      setTestResults(prev => ({ ...prev, hello: helloResult }));

      // Test status
      const statusResult = await apiService.testStatus();
      setTestResults(prev => ({ ...prev, status: statusResult }));

      // Test CORS
      const corsResult = await apiService.testCORS();
      setTestResults(prev => ({ ...prev, cors: corsResult }));

    } catch (err: any) {
      console.error('Test failed:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">API Test Endpoints</h3>
      
      {/* Test All Button */}
      <div className="mb-4">
        <button
          onClick={testAllEndpoints}
          disabled={hookLoading}
          className="btn btn-primary"
        >
          {hookLoading ? 'Testiranje...' : 'Testiraj sve endpoint-e'}
        </button>
        {hookError && <div className="mt-2 text-red-600">Greška: {hookError}</div>}
      </div>
      
      <div className="space-y-4">
        {/* Test Hello */}
        <div className="border p-4 rounded">
          <h4 className="font-medium mb-2">Test Hello Endpoint</h4>
          <button
            onClick={testHello}
            disabled={loading.hello}
            className="btn btn-primary mr-2"
          >
            {loading.hello ? 'Testiranje...' : 'Test Hello'}
          </button>
          {testResults.hello && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Rezultat:</strong> {testResults.hello}
            </div>
          )}
        </div>

        {/* Test Status */}
        <div className="border p-4 rounded">
          <h4 className="font-medium mb-2">Test Status Endpoint</h4>
          <button
            onClick={testStatus}
            disabled={loading.status}
            className="btn btn-secondary mr-2"
          >
            {loading.status ? 'Testiranje...' : 'Test Status'}
          </button>
          {testResults.status && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Rezultat:</strong> {testResults.status}
            </div>
          )}
        </div>

        {/* Test Echo */}
        <div className="border p-4 rounded">
          <h4 className="font-medium mb-2">Test Echo Endpoint</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={echoMessage}
              onChange={(e) => setEchoMessage(e.target.value)}
              placeholder="Unesite poruku za echo"
              className="input flex-1"
            />
            <button
              onClick={testEcho}
              disabled={loading.echo}
              className="btn btn-success"
            >
              {loading.echo ? 'Testiranje...' : 'Test Echo'}
            </button>
          </div>
          {testResults.echo && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Rezultat:</strong> {testResults.echo}
            </div>
          )}
        </div>

        {/* Test CORS */}
        <div className="border p-4 rounded">
          <h4 className="font-medium mb-2">Test CORS Endpoint</h4>
          <button
            onClick={testCORS}
            disabled={loading.cors}
            className="btn btn-info mr-2"
          >
            {loading.cors ? 'Testiranje...' : 'Test CORS'}
          </button>
          {testResults.cors && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <strong>Rezultat:</strong> 
              <pre className="mt-1 text-xs overflow-auto">
                {JSON.stringify(testResults.cors, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* All Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-medium mb-2">Svi rezultati:</h4>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 