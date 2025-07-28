'use client';

import { useState } from 'react';
import { apiService } from '../services/api';

export const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    hello?: string;
    status?: string;
    echo?: string;
  }>({});
  const [loading, setLoading] = useState<{
    hello: boolean;
    status: boolean;
    echo: boolean;
  }>({
    hello: false,
    status: false,
    echo: false
  });
  const [echoMessage, setEchoMessage] = useState('Test poruka');

  const testHello = async () => {
    setLoading(prev => ({ ...prev, hello: true }));
    try {
      const result = await apiService.testHello();
      setTestResults(prev => ({ ...prev, hello: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, hello: `Greška: ${error}` }));
    } finally {
      setLoading(prev => ({ ...prev, hello: false }));
    }
  };

  const testStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    try {
      const result = await apiService.testStatus();
      setTestResults(prev => ({ ...prev, status: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, status: `Greška: ${error}` }));
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const testEcho = async () => {
    setLoading(prev => ({ ...prev, echo: true }));
    try {
      const result = await apiService.testEcho({ message: echoMessage });
      setTestResults(prev => ({ ...prev, echo: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, echo: `Greška: ${error}` }));
    } finally {
      setLoading(prev => ({ ...prev, echo: false }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">API Test Endpoints</h3>
      
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
      </div>
    </div>
  );
}; 