'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Description, Download, Upload, Storage } from '@mui/icons-material';

export default function FormulariPage() {
  const [activeTab, setActiveTab] = useState('resenja');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Формулари</h1>
          <p className="text-gray-600 mt-2">Генерисање Word решења и докумената</p>
        </div>
      </div>

      <div className="w-full">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('resenja')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'resenja' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Description className="h-4 w-4" />
            Решења
          </button>
          <button
            onClick={() => setActiveTab('izvestaji')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'izvestaji' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Storage className="h-4 w-4" />
            Извештаји
          </button>
          <button
            onClick={() => setActiveTab('predlozi')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'predlozi' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            Предлози
          </button>
          <button
            onClick={() => setActiveTab('ostalo')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'ostalo' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="h-4 w-4" />
            Остало
          </button>
        </div>

        {activeTab === 'resenja' && (
          <div className="mt-6">
            <div className="card p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Генерисање решења</h2>
                  <p className="text-gray-600 mb-6">
                    Овде можете генерисати Word решења за енергетски угрожене купце.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ručni unos */}
                  <div className="card p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <Description className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ручни унос података</h3>
                      <p className="text-gray-600 mb-4">
                        Унесите податке ручно и генеришите решење
                      </p>
                      <button 
                        className="btn btn-primary w-full"
                        onClick={() => window.location.href = '/formulari/rucni-unos'}
                      >
                        <Description className="h-4 w-4 mr-2" />
                        Отвори форму
                      </button>
                    </div>
                  </div>

                  {/* Izbor iz baze */}
                  <div className="card p-6 border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                    <div className="text-center">
                      <Storage className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Избор из базе података</h3>
                      <p className="text-gray-600 mb-4">
                        Изаберите лице из базе и генеришите решење
                      </p>
                      <button 
                        className="btn btn-secondary w-full"
                        onClick={() => window.location.href = '/formulari/izbor-iz-baze'}
                      >
                        <Storage className="h-4 w-4 mr-2" />
                        Изабери из базе
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'izvestaji' && (
          <div className="mt-6">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Извештаји</h2>
              <p className="text-gray-600">Функционалност за извештаје ће бити додата у будућим верзијама.</p>
            </div>
          </div>
        )}

        {activeTab === 'predlozi' && (
          <div className="mt-6">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Предлози</h2>
              <p className="text-gray-600">Функционалност за предлоге ће бити додата у будућим верзијама.</p>
            </div>
          </div>
        )}

        {activeTab === 'ostalo' && (
          <div className="mt-6">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Остали документи</h2>
              <p className="text-gray-600">Функционалност за остале документе ће бити додата у будућим верзијама.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
