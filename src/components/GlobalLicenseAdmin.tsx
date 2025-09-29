'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalLicense } from '../contexts/GlobalLicenseContext';
import { globalLicenseService } from '../services/globalLicenseService';

interface GlobalLicenseAdminProps {
  className?: string;
}

const GlobalLicenseAdmin: React.FC<GlobalLicenseAdminProps> = ({ className = '' }) => {
  const { globalLicenseInfo, refreshGlobalLicense } = useGlobalLicense();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showExtendForm, setShowExtendForm] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    licenseKey: '',
    startDate: '',
    endDate: ''
  });

  const [extendForm, setExtendForm] = useState({
    newEndDate: ''
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await globalLicenseService.createGlobalLicense(createForm);
      setSuccess('Globalna licenca je uspešno kreirana!');
      setShowCreateForm(false);
      setCreateForm({ licenseKey: '', startDate: '', endDate: '' });
      await refreshGlobalLicense();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju licence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await globalLicenseService.extendGlobalLicense(extendForm);
      setSuccess('Globalna licenca je uspešno produžena!');
      setShowExtendForm(false);
      setExtendForm({ newEndDate: '' });
      await refreshGlobalLicense();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri produženju licence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateExpired = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await globalLicenseService.deactivateExpiredGlobalLicenses();
      setSuccess('Istekle globalne licence su uspešno deaktivirane!');
      await refreshGlobalLicense();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri deaktivaciji licenci');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (hasValidLicense: boolean, isExpiringSoon: boolean) => {
    if (!hasValidLicense) return 'text-red-600 bg-red-100';
    if (isExpiringSoon) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (hasValidLicense: boolean, isExpiringSoon: boolean) => {
    if (!hasValidLicense) return 'Istekla';
    if (isExpiringSoon) return 'Ističe uskoro';
    return 'Važeća';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upravljanje globalnom licencom</h2>
        <button
          onClick={refreshGlobalLicense}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Osveži
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Current License Status */}
      {globalLicenseInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Trenutni status licence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(
                globalLicenseInfo.hasValidLicense,
                globalLicenseInfo.isExpiringSoon
              )}`}>
                {getStatusText(globalLicenseInfo.hasValidLicense, globalLicenseInfo.isExpiringSoon)}
              </span>
            </div>
            <div>
              <span className="font-medium">Datum isteka:</span>
              <span className="ml-2">{formatDate(globalLicenseInfo.endDate)}</span>
            </div>
            <div>
              <span className="font-medium">Dana do isteka:</span>
              <span className="ml-2">{globalLicenseInfo.daysUntilExpiry}</span>
            </div>
            <div>
              <span className="font-medium">Poruka:</span>
              <span className="ml-2">{globalLicenseInfo.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Kreiraj novu licencu
          </button>
          
          <button
            onClick={() => setShowExtendForm(!showExtendForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⏰ Produži licencu
          </button>
          
          <button
            onClick={handleDeactivateExpired}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            🗑️ Deaktiviraj istekle
          </button>
        </div>

        {/* Create License Form */}
        {showCreateForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Kreiraj novu globalnu licencu</h3>
            <form onSubmit={handleCreateLicense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ključ licence
                </label>
                <input
                  type="text"
                  value={createForm.licenseKey}
                  onChange={(e) => setCreateForm({ ...createForm, licenseKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GLOBAL-LICENSE-2024"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum početka
                  </label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum isteka
                  </label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Kreiranje...' : 'Kreiraj licencu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Extend License Form */}
        {showExtendForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Produži globalnu licencu</h3>
            <form onSubmit={handleExtendLicense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novi datum isteka
                </label>
                <input
                  type="date"
                  value={extendForm.newEndDate}
                  onChange={(e) => setExtendForm({ ...extendForm, newEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Produžavanje...' : 'Produži licencu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExtendForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLicenseAdmin;
