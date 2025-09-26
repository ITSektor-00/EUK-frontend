'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { licenseService } from '../services/licenseService';

const LicenseDebug: React.FC = () => {
  const { user, token } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLicenseAPI = async () => {
    if (!user?.id || !token) {
      setDebugInfo({ error: 'No user or token' });
      return;
    }

    setLoading(true);
    try {
      console.log('Testing license API...');
      
      // Test 1: Check license status
      const statusResult = await licenseService.checkLicenseStatus(user.id, token);
      console.log('Status result:', statusResult);
      
      // Test 2: Check license
      const checkResult = await licenseService.checkLicense(user.id, token);
      console.log('Check result:', checkResult);
      
      // Test 3: Get user licenses
      const userLicensesResult = await licenseService.getUserLicenses(user.id, token);
      console.log('User licenses result:', userLicensesResult);
      
      setDebugInfo({
        status: statusResult,
        check: checkResult,
        userLicenses: userLicensesResult,
        user: user,
        token: token ? 'present' : 'missing'
      });
    } catch (error) {
      console.error('Debug test error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded">No user logged in</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">License API Debug</h3>
      
      <div className="mb-4">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
      </div>
      
      <button
        onClick={testLicenseAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test License API'}
      </button>
      
      {debugInfo && (
        <div className="mt-4 p-4 bg-white rounded border">
          <h4 className="font-bold mb-2">Debug Results:</h4>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LicenseDebug;
