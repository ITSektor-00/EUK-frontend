"use client";
import React from 'react';
import { UgrozenoLice } from './types';

interface UgrozenaLicaStatistikaProps {
  ugrozenaLica: UgrozenoLice[];
}

export default function UgrozenaLicaStatistika({ ugrozenaLica }: UgrozenaLicaStatistikaProps) {
  const totalUgrozenaLica = ugrozenaLica.length;
  
  // Statistika po državama rođenja
  const drzaveRodjenja = ugrozenaLica.reduce((acc, lice) => {
    const drzava = lice.drzavaRodjenja || 'Nepoznato';
    acc[drzava] = (acc[drzava] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistika po mestima rođenja
  const mestaRodjenja = ugrozenaLica.reduce((acc, lice) => {
    const mesto = lice.mestoRodjenja || 'Nepoznato';
    acc[mesto] = (acc[mesto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistika po opštinama rođenja
  const opstineRodjenja = ugrozenaLica.reduce((acc, lice) => {
    const opstina = lice.opstinaRodjenja || 'Nepoznato';
    acc[opstina] = (acc[opstina] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Statistika po predmetima
  const predmeti = ugrozenaLica.reduce((acc, lice) => {
    const predmetId = lice.predmetId || 0;
    acc[predmetId] = (acc[predmetId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Sortiranje po broju
  const sortByCount = (obj: Record<string | number, number>) => {
    return Object.entries(obj).sort(([,a], [,b]) => b - a);
  };

  const topDrzave = sortByCount(drzaveRodjenja).slice(0, 5);
  const topMesta = sortByCount(mestaRodjenja).slice(0, 5);
  const topOpstine = sortByCount(opstineRodjenja).slice(0, 5);
  const topPredmeti = sortByCount(predmeti).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Glavna statistika */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ukupno ugroženih lica</p>
              <p className="text-2xl font-bold text-gray-900">{totalUgrozenaLica}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Različitih država</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(drzaveRodjenja).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Različitih mesta</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(mestaRodjenja).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Različitih predmeta</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(predmeti).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detaljna statistika */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top države rođenja */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 država rođenja</h3>
          <div className="space-y-3">
            {topDrzave.map(([drzava, count]) => (
              <div key={drzava} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{drzava}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalUgrozenaLica) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top mesta rođenja */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 mesta rođenja</h3>
          <div className="space-y-3">
            {topMesta.map(([mesto, count]) => (
              <div key={mesto} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{mesto}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalUgrozenaLica) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top opštine rođenja */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 opština rođenja</h3>
          <div className="space-y-3">
            {topOpstine.map(([opstina, count]) => (
              <div key={opstina} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{opstina}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalUgrozenaLica) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top predmeti */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 predmeta</h3>
          <div className="space-y-3">
            {topPredmeti.map(([predmetId, count]) => (
              <div key={predmetId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Predmet {predmetId}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalUgrozenaLica) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
