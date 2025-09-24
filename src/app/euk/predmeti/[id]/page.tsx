"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { apiService } from '../../../../services/api';
import ErrorHandler from '../../../components/ErrorHandler';

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  rokZaZavrsetak: string;
  kategorijaId: number;
  kategorijaNaziv?: string;
  brojUgrozenihLica?: number;
  datumKreiranja?: string;
  kategorija?: {
    kategorijaId: number;
    naziv: string;
  };
}

interface Kategorija {
  kategorijaId: number;
  naziv: string;
}

export default function PredmetDetaljiPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [predmet, setPredmet] = useState<Predmet | null>(null);
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const predmetId = params.id as string;

  const fetchPredmet = useCallback(async () => {
    if (!token || !predmetId) return;
    
    try {
      console.log('Fetching predmet with ID:', predmetId);
      // TODO: Implement getPredmetById in apiService
      // const data = await apiService.getPredmetById(parseInt(predmetId), token);
      // setPredmet(data);
      
      // For now, simulate data
      setPredmet({
        predmetId: parseInt(predmetId),
        nazivPredmeta: 'Тест предмет',
        status: 'активан',
        odgovornaOsoba: 'Тест особа',
        prioritet: 'средњи',
        rokZaZavrsetak: '2025-12-31',
        kategorijaId: 1,
        datumKreiranja: '2025-01-01',
        brojUgrozenihLica: 5
      });
    } catch (err) {
      console.error('Error fetching predmet:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju предмета');
    } finally {
      setLoading(false);
    }
  }, [token, predmetId]);

  const fetchKategorije = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await apiService.getKategorije('', token);
      setKategorije(data);
    } catch (err) {
      console.error('Greška pri učitavanju kategorija:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token && predmetId) {
      fetchPredmet();
      fetchKategorije();
    }
  }, [fetchPredmet, fetchKategorije]);

  const getKategorijaNaziv = (kategorijaId: number) => {
    const kategorija = kategorije.find(k => k.kategorijaId === kategorijaId);
    return kategorija?.naziv || 'Непознато';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'активан': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
      case 'затворен': return { bg: '#f8fafc', text: '#475569', border: '#64748b' };
      case 'на_чекању': return { bg: '#fffbeb', text: '#92400e', border: '#f59e0b' };
      case 'у_обради': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const getPrioritetColor = (prioritet: string) => {
    switch (prioritet) {
      case 'низак': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
      case 'средњи': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6' };
      case 'висок': return { bg: '#fff7ed', text: '#c2410c', border: '#f97316' };
      case 'критичан': return { bg: '#fef2f2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorHandler error={error} onRetry={fetchPredmet} />
    );
  }

  if (!predmet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Предмет није пронађен</h2>
          <button
            onClick={() => router.push('/euk/predmeti')}
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors duration-200"
          >
            Назад на листу предмета
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(predmet.status);
  const prioritetColors = getPrioritetColor(predmet.prioritet);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/euk/predmeti')}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-14 h-14 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img 
                src="/ikoniceSidebar/beleIkonice/predmetiBelo.png" 
                alt="EUK Predmeti" 
                className="w-9 h-9"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Предмет {predmet.predmetId}</h1>
              <p className="text-base text-gray-600">Детаљни преглед предмета</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Основне информације</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-lg">📝</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Назив предмета</label>
                    <p className="text-xl font-bold text-gray-900">{predmet.nazivPredmeta}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-lg">👤</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Одговорна особа</label>
                    <p className="text-lg font-semibold text-gray-900">{predmet.odgovornaOsoba}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-lg">📅</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Датум креирања</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {predmet.datumKreiranja ? new Date(predmet.datumKreiranja).toLocaleDateString('sr-RS') : 'Непознато'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600 text-lg">⏰</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Рок за завршетак</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {predmet.rokZaZavrsetak ? new Date(predmet.rokZaZavrsetak).toLocaleDateString('sr-RS') : 'Непознато'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Priority Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Статус и приоритет</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-600 mb-3">Статус</label>
                  <div
                    className="inline-block px-6 py-3 rounded-2xl text-lg font-bold shadow-lg"
                    style={{
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      border: `2px solid ${statusColors.border}`,
                      borderRadius: '24px',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      minWidth: '120px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {predmet.status}
                  </div>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-600 mb-3">Приоритет</label>
                  <div
                    className="inline-block px-6 py-3 rounded-2xl text-lg font-bold shadow-lg"
                    style={{
                      backgroundColor: prioritetColors.bg,
                      color: prioritetColors.text,
                      border: `2px solid ${prioritetColors.border}`,
                      borderRadius: '24px',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      minWidth: '120px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {predmet.prioritet}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Additional Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Додатне информације</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-lg">🏷️</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Категорија</label>
                    <p className="text-lg font-semibold text-gray-900">{getKategorijaNaziv(predmet.kategorijaId)}</p>
                  </div>
                </div>
                {predmet.brojUgrozenihLica && (
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Број угрожених лица</label>
                      <p className="text-lg font-semibold text-gray-900">{predmet.brojUgrozenihLica}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <span className="text-white text-xl">ℹ️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Брзе информације</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600 text-xl">🔢</span>
                    <span className="text-gray-600 font-medium">ID:</span>
                  </div>
                  <span className="font-bold text-xl text-blue-700">{predmet.predmetId}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 text-xl">🎯</span>
                    <span className="text-gray-600 font-medium">Статус:</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">{predmet.status}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-600 text-xl">⚡</span>
                    <span className="text-gray-600 font-medium">Приоритет:</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">{predmet.prioritet}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
