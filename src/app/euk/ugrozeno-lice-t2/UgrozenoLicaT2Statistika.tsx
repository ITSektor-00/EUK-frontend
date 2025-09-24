"use client";
import React from 'react';
import { UgrozenoLiceT2 } from './types';

interface UgrozenoLicaT2StatistikaProps {
  ugrozenaLicaT2: UgrozenoLiceT2[];
}

export default function UgrozenoLicaT2Statistika({ ugrozenaLicaT2 }: UgrozenoLicaT2StatistikaProps) {
  // Osnovne statistike
  const totalCount = ugrozenaLicaT2.length;
  
  // Statistike po gradovima
  const gradoviStats = ugrozenaLicaT2.reduce((acc, lice) => {
    const grad = lice.gradOpstina || 'Неодређено';
    acc[grad] = (acc[grad] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistike po mestima
  const mestaStats = ugrozenaLicaT2.reduce((acc, lice) => {
    const mesto = lice.mesto || 'Неодређено';
    acc[mesto] = (acc[mesto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistike po ED brojevima
  const edBrojStats = ugrozenaLicaT2.reduce((acc, lice) => {
    const edBroj = lice.edBroj || 'Неодређено';
    acc[edBroj] = (acc[edBroj] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sortiranje statistika
  const topGradovi = Object.entries(gradoviStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const topMesta = Object.entries(mestaStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const topEdBrojevi = Object.entries(edBrojStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Osnovne statistike */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Укупно угрожених лица</p>
              <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Број градова</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(gradoviStats).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Број места</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(mestaStats).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Број ЕД бројева</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(edBrojStats).length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 gradova */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ 10 градова</h3>
        <div className="space-y-3">
          {topGradovi.map(([grad, count], index) => (
            <div key={grad} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{grad}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(count / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 mesta */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ 10 места</h3>
        <div className="space-y-3">
          {topMesta.map(([mesto, count], index) => (
            <div key={mesto} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{mesto}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(count / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 ED brojeva */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ 10 ЕД бројева</h3>
        <div className="space-y-3">
          {topEdBrojevi.map(([edBroj, count], index) => (
            <div key={edBroj} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{edBroj}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(count / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
