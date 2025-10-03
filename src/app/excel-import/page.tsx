"use client";
import { useState } from "react";
import ExcelImportComponent from "../../components/ExcelImportComponent";

interface ImportResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  filename?: string;
  table?: string;
  size?: number;
  expectedColumns?: number;
  timestamp?: number;
  error?: string;
}

export default function ExcelImportPage() {
  const [importResults, setImportResults] = useState<ImportResponse[]>([]);
  const [lastImport, setLastImport] = useState<ImportResponse | null>(null);

  const handleImportComplete = (response: ImportResponse) => {
    console.log('Import completed:', response);
    setLastImport(response);
    setImportResults(prev => [response, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const handleImportError = (error: any) => {
    console.error('Import error:', error);
    const errorResponse: ImportResponse = {
      status: 'ERROR',
      message: typeof error === 'string' ? error : 'Nepoznata greška',
      error: typeof error === 'string' ? error : error?.message || 'Nepoznata greška'
    };
    setLastImport(errorResponse);
    setImportResults(prev => [errorResponse, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Excel Import Sistem</h1>
              <p className="text-base text-gray-600">Univerzalni import za sve tabele u EUK aplikaciji</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Import Component */}
          <div className="lg:col-span-2">
            <ExcelImportComponent
              onImportComplete={handleImportComplete}
              onImportError={handleImportError}
              baseUrl="http://localhost:8080"
            />
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            {/* Last Import Result */}
            {lastImport && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Poslednji Import
                </h3>
                <div className={`p-4 rounded-lg ${
                  lastImport.status === 'SUCCESS' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-5 h-5 mr-2 ${
                      lastImport.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lastImport.status === 'SUCCESS' ? '✓' : '✕'}
                    </div>
                    <span className={`font-semibold ${
                      lastImport.status === 'SUCCESS' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {lastImport.status === 'SUCCESS' ? 'Uspešno' : 'Greška'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    lastImport.status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {lastImport.message}
                  </p>
                  {lastImport.filename && (
                    <p className="text-xs text-gray-600 mt-1">
                      Fajl: {lastImport.filename}
                    </p>
                  )}
                  {lastImport.table && (
                    <p className="text-xs text-gray-600">
                      Tabela: {lastImport.table}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Import History */}
            {importResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Istorija Import-a
                </h3>
                <div className="space-y-3">
                  {importResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.status === 'SUCCESS' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 mr-2 rounded-full ${
                            result.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900">
                            {result.filename || 'Nepoznat fajl'}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      {result.table && (
                        <p className="text-xs text-gray-600 mt-1">
                          {result.table}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Instrukcije
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">1. Odaberite tabelu</h4>
                  <p>Izaberite tabelu u koju želite da importujete podatke</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">2. Pripremite Excel fajl</h4>
                  <p>Fajl mora imati kolone u redosledu koji je prikazan u format info sekciji</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">3. Upload i praćenje</h4>
                  <p>Kliknite &quot;Počni import&quot; i pratite napredak u real-time</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">4. Rezultati</h4>
                  <p>Nakon završetka, rezultati će se prikazati ovde</p>
                </div>
              </div>
            </div>

            {/* Supported Tables */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Podržane Tabele
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Ugrožena lica T1</span>
                  <span className="text-blue-600 font-medium">16 kolona</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Ugrožena lica T2</span>
                  <span className="text-blue-600 font-medium">8 kolona</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Kategorije</span>
                  <span className="text-blue-600 font-medium">1 kolona</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Predmeti</span>
                  <span className="text-blue-600 font-medium">1 kolona</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Korisnici</span>
                  <span className="text-blue-600 font-medium">4 kolone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
