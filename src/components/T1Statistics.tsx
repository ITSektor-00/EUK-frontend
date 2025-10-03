"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface T1StatisticsProps {
  ugrozenaLica: any[];
}

const T1Statistics: React.FC<T1StatisticsProps> = ({ ugrozenaLica }) => {
  const { token } = useAuth();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const stats = await apiService.getUgrozenaLicaStatistics(token);
        setStatistics(stats);
      } catch (error) {
        console.error('Greška pri dohvatanju T1 statistika:', error);
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
  const totalCount = ugrozenaLica.length;
  const withEdBroj = ugrozenaLica.filter(item => item.edBroj || item.edBrojMernogUredjaja).length;
  const withIznos = ugrozenaLica.filter(item => item.iznosUmanjenjaSaPdv && item.iznosUmanjenjaSaPdv > 0).length;
  const withBrojRacuna = ugrozenaLica.filter(item => item.brojRacuna).length;
  
  // Grupisanje po osnovu sticanja statusa
  const osnovSticanjaStats = ugrozenaLica.reduce((acc: any, item) => {
    const osnov = item.osnovSticanjaStatusa || 'Nepoznato';
    acc[osnov] = (acc[osnov] || 0) + 1;
    return acc;
  }, {});

  // Grupisanje po gradu/opštini
  const gradOpstinaStats = ugrozenaLica.reduce((acc: any, item) => {
    const grad = item.gradOpstina || 'Nepoznato';
    acc[grad] = (acc[grad] || 0) + 1;
    return acc;
  }, {});

  // Top 5 gradova
  const topGradovi = Object.entries(gradOpstinaStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="t1-statistics bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">T1 Statistike</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Osnovne statistike */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ukupno T1 lica</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sa iznosom</p>
              <p className="text-2xl font-bold text-gray-900">{withIznos}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sa brojem računa</p>
              <p className="text-2xl font-bold text-gray-900">{withBrojRacuna}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Osnov sticanja statusa */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Osnov sticanja statusa</h3>
          <div className="space-y-3">
            {Object.entries(osnovSticanjaStats).map(([osnov, count]) => (
              <div key={osnov} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{osnov}</span>
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

export default T1Statistics;
