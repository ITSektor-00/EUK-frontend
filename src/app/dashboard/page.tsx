"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import Link from 'next/link';

interface DashboardStats {
  ugrozenaLicaT1: number;
  ugrozenaLicaT2: number;
  predmeti: number;
  kategorije: number;
}



export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    ugrozenaLicaT1: 0,
    ugrozenaLicaT2: 0,
    predmeti: 0,
    kategorije: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcija za učitavanje statistika
  const loadDashboardData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [
        ugrozenaLicaT1Count,
        ugrozenaLicaT2Count,
        predmetiCount,
        kategorijeCount
      ] = await Promise.allSettled([
        // T1 - pokušaj count, pa fallback na paginated
        apiService.getUgrozenaLicaCount(token).catch(() => 
          apiService.getUgrozenaLica('size=1&page=0', token).then(data => ({ count: data.totalElements || 0 }))
        ),
        // T2 - pokušaj count, pa fallback na paginated
        apiService.getUgrozenaLicaT2Count(token).catch(() => 
          apiService.getUgrozenaLicaT2('size=1&page=0', token).then(data => ({ count: data.totalElements || 0 }))
        ),
        // Predmeti - uvek koristi paginated pristup
        apiService.getPredmeti('size=1&page=0', token).then(data => ({ count: data.totalElements || 0 })),
        // Kategorije - pokušaj count, pa fallback na paginated
        apiService.getKategorijeCount(token).catch(() => 
          apiService.getKategorije('size=1&page=0', token).then(data => ({ count: data.totalElements || 0 }))
        )
      ]);

      // Izdvoj podatke iz Promise.allSettled rezultata
      const statsData = {
        ugrozenaLicaT1: ugrozenaLicaT1Count.status === 'fulfilled' ? (ugrozenaLicaT1Count.value?.totalCount || ugrozenaLicaT1Count.value?.count || 0) : 0,
        ugrozenaLicaT2: ugrozenaLicaT2Count.status === 'fulfilled' ? (ugrozenaLicaT2Count.value?.totalCount || ugrozenaLicaT2Count.value?.count || 0) : 0,
        predmeti: predmetiCount.status === 'fulfilled' ? (predmetiCount.value?.count || 0) : 0,
        kategorije: kategorijeCount.status === 'fulfilled' ? (kategorijeCount.value?.totalCount || kategorijeCount.value?.count || 0) : 0
      };


      setStats(statsData);

      // Uklonjen simulirani recent activity - zameniti sa realnim podacima

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh svakih 5 minuta
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, user]);

  // Funkcija za formatiranje brojeva
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('sr-RS').format(num);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header sa system status */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Добродошли, {user?.username || 'Korisnik'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
              Ево прегледа вашег ЕУК система и најновијих активности.
            </p>
          </div>
          
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">Грешка: {error}</span>
            </div>
          </div>
        )}


        {/* Loading State */}
        {loading && (
          <div className="mb-8 flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg text-gray-600">Учитавање података...</span>
            </div>
          </div>
        )}

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Ugrožena lica T1 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Угрожена лица Т1</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.ugrozenaLicaT1)}</p>
                <p className="text-xs text-gray-500 mt-1">Активни записници</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ugrožena lica T2 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Угрожена лица Т2</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.ugrozenaLicaT2)}</p>
                <p className="text-xs text-gray-500 mt-1">Енергетски записници</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Predmeti */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Предмети</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.predmeti)}</p>
                <p className="text-xs text-gray-500 mt-1">Активни предмети</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Kategorije */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Категорије</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.kategorije)}</p>
                <p className="text-xs text-gray-500 mt-1">Активне категорије</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Брзе акције</h2>
          <div className="space-y-4">
              <Link href="/euk/ugrozena-lica" className="group block">
              <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Додај угрожено лице</h3>
                    <p className="text-sm text-gray-600">Креирај ново угрожено лице</p>
                </div>
              </div>
            </Link>

              <Link href="/euk/predmeti" className="group block">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Нови предмет</h3>
                    <p className="text-sm text-gray-600">Креирај нови предмет</p>
                  </div>
                </div>
              </Link>

              <Link href="/euk/stampanje" className="group block">
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Штампање</h3>
                    <p className="text-sm text-gray-600">Штампај документе</p>
                  </div>
                </div>
              </Link>

              <Link href="/euk/kategorije" className="group block">
                <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Категорије</h3>
                    <p className="text-sm text-gray-600">Управљај категоријама</p>
                  </div>
                </div>
              </Link>
          </div>
        </div>

      </div>
    </div>
  );
} 