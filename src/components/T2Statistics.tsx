"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface T2StatisticsProps {
  ugrozenaLicaT2: any[];
}

const T2Statistics: React.FC<T2StatisticsProps> = ({ ugrozenaLicaT2 }) => {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const stats = await apiService.getUgrozenaLicaT2Statistics(token);
        setStatistics(stats);
      } catch (error) {
        console.error('Greška pri dohvatanju T2 statistika:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Lokalne statistike iz podataka
  const totalCount = ugrozenaLicaT2.length;
  const withEdBroj = ugrozenaLicaT2.filter(item => item.edBroj).length;
  const withPokVazenja = ugrozenaLicaT2.filter(item => item.pokVazenjaResenjaOStatusu).length;
  
  // Grupisanje po gradu/opštini
  const gradOpstinaStats = ugrozenaLicaT2.reduce((acc: any, item) => {
    const grad = item.gradOpstina || 'Nepoznato';
    acc[grad] = (acc[grad] || 0) + 1;
    return acc;
  }, {});

  // Grupisanje po mestu
  const mestoStats = ugrozenaLicaT2.reduce((acc: any, item) => {
    const mesto = item.mesto || 'Nepoznato';
    acc[mesto] = (acc[mesto] || 0) + 1;
    return acc;
  }, {});

  // Top 5 gradova
  const topGradovi = Object.entries(gradOpstinaStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Top 5 mesta
  const topMesta = Object.entries(mestoStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="t2-statistics bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">T2 Statistike</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Osnovne statistike */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ukupno T2 lica</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sa ED brojem</p>
              <p className="text-2xl font-bold text-gray-900">{withEdBroj}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sa periodom važenja</p>
              <p className="text-2xl font-bold text-gray-900">{withPokVazenja}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top gradovi */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 gradova/opština</h3>
          <div className="space-y-3">
            {topGradovi.map(([grad, count]) => (
              <div key={grad} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{grad}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((count as number) / totalCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top mesta */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 mesta</h3>
          <div className="space-y-3">
            {topMesta.map(([mesto, count]) => (
              <div key={mesto} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{mesto}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${((count as number) / totalCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Server statistike */}
      {statistics && (
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Server statistike</h3>
          <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(statistics, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default T2Statistics;
