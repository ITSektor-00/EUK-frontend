"use client";
import React, { useState, useMemo } from 'react';
import { Chip } from '@mui/material';

import { KategorijaT1 } from './types';

interface KategorijaStatistikaProps {
  kategorije: KategorijaT1[];
}

export default function KategorijaStatistika({ kategorije }: KategorijaStatistikaProps) {
  // Calculate statistics
  const ukupno = kategorije.length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Укупно категорија</p>
              <p className="text-3xl font-bold text-gray-900">{ukupno}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <img
                src="/ikoniceSidebar/category.png"
                alt="Kategorije"
                className="w-6 h-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simple List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Све категорије</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {kategorije.map((kategorija, index) => (
            <div key={kategorija.kategorijaId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{kategorija.naziv}</span>
              </div>
              <span className="text-sm text-gray-500">#{kategorija.kategorijaId}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}