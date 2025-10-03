"use client";
import React, { useState, useCallback } from 'react';

interface ExportStatus {
  isExporting: boolean;
  progress: number;
  error?: string;
}

interface ExcelExportComponentProps {
  baseUrl?: string;
  onExportComplete?: (type: string, filename: string) => void;
  onExportError?: (type: string, error: string) => void;
}

const ExcelExportComponent: React.FC<ExcelExportComponentProps> = ({
  baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'),
  onExportComplete,
  onExportError
}) => {
  const [exportStatus, setExportStatus] = useState<{
    t1: ExportStatus;
    t2: ExportStatus;
  }>({
    t1: { isExporting: false, progress: 0 },
    t2: { isExporting: false, progress: 0 }
  });

  // Helper funkcija za download
  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  // Export sa progress tracking-om
  const exportWithProgress = useCallback(async (type: 't1' | 't2') => {
    setExportStatus(prev => ({
      ...prev,
      [type]: { isExporting: true, progress: 0, error: undefined }
    }));

    try {
      // Simulacija progress-a (u realnoj implementaciji bi bio server-sent events)
      const progressInterval = setInterval(() => {
        setExportStatus(prev => ({
          ...prev,
          [type]: { 
            isExporting: true, 
            progress: Math.min(prev[type].progress + 10, 90),
            error: undefined
          }
        }));
      }, 200);

      const response = await fetch(`${baseUrl}/api/export/excel/${type}`);
      
      if (!response.ok) {
        throw new Error(`Greška pri izvozu ${type} tabele: ${response.status} ${response.statusText}`);
      }

      clearInterval(progressInterval);
      
      const blob = await response.blob();
      const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
      const filename = `ugrozena_lica_${type}_${timestamp}.xlsx`;
      
      // Download fajl
      downloadFile(blob, filename);

      setExportStatus(prev => ({
        ...prev,
        [type]: { isExporting: false, progress: 100, error: undefined }
      }));

      onExportComplete?.(type, filename);

      // Reset progress after 1 second
      setTimeout(() => {
        setExportStatus(prev => ({
          ...prev,
          [type]: { isExporting: false, progress: 0, error: undefined }
        }));
      }, 1000);

    } catch (error: any) {
      console.error(`Error exporting ${type}:`, error);
      const errorMessage = error.message || 'Nepoznata greška';
      
      setExportStatus(prev => ({
        ...prev,
        [type]: { isExporting: false, progress: 0, error: errorMessage }
      }));
      
      onExportError?.(type, errorMessage);
    }
  }, [baseUrl, downloadFile, onExportComplete, onExportError]);

  const getTableInfo = (type: 't1' | 't2') => {
    if (type === 't1') {
      return {
        title: 'T1 Tabela',
        description: 'Kompletna struktura sa energetskim podacima',
        columns: 15,
        features: [
          'Energetski podaci',
          'Potrošnja i površina',
          'Iznos umanjenja sa PDV',
          'Datum izdavanja računa'
        ]
      };
    } else {
      return {
        title: 'T2 Tabela',
        description: 'Pojednostavljena struktura',
        columns: 15,
        features: [
          'Osnovni podaci',
          'Potrošnja kWh',
          'Zagrevana površina',
          'Iznos umanjenja'
        ]
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Excel Export</h2>
        <p className="text-gray-600">Izvezite podatke u Excel format sa template-om</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* T1 Export Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900">T1 Tabela</h3>
              <p className="text-blue-700 text-sm">Kompletna struktura sa energetskim podacima</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>15 kolona</strong> - Energetski podaci, potrošnja, iznos umanjenja
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Energetski podaci</li>
              <li>• Potrošnja i površina</li>
              <li>• Iznos umanjenja sa PDV</li>
              <li>• Datum izdavanja računa</li>
            </ul>
          </div>
          
          <button 
            onClick={() => exportWithProgress('t1')}
            disabled={exportStatus.t1.isExporting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {exportStatus.t1.isExporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Izvoz u toku...
              </div>
            ) : (
              'Izvezi T1 tabelu'
            )}
          </button>
          
          {/* Progress Bar */}
          {exportStatus.t1.isExporting && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">Napredak</span>
                <span className="text-sm font-bold text-blue-600">{exportStatus.t1.progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${exportStatus.t1.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {exportStatus.t1.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-600 mr-2">✕</div>
                <p className="text-red-800 text-sm">{exportStatus.t1.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* T2 Export Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-900">T2 Tabela</h3>
              <p className="text-green-700 text-sm">Pojednostavljena struktura</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-green-800 mb-2">
              <strong>15 kolona</strong> - Osnovni podaci, potrošnja kWh, zagrevana površina
            </p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Osnovni podaci</li>
              <li>• Potrošnja kWh</li>
              <li>• Zagrevana površina</li>
              <li>• Iznos umanjenja</li>
            </ul>
          </div>
          
          <button 
            onClick={() => exportWithProgress('t2')}
            disabled={exportStatus.t2.isExporting}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {exportStatus.t2.isExporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Izvoz u toku...
              </div>
            ) : (
              'Izvezi T2 tabelu'
            )}
          </button>
          
          {/* Progress Bar */}
          {exportStatus.t2.isExporting && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">Napredak</span>
                <span className="text-sm font-bold text-green-600">{exportStatus.t2.progress}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${exportStatus.t2.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {exportStatus.t2.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-600 mr-2">✕</div>
                <p className="text-red-800 text-sm">{exportStatus.t2.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informacije o izvozu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Template funkcionalnosti</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Zaglavlje:</strong> Fiksno na vrhu</li>
              <li>• <strong>Tabela:</strong> Počinje od reda 10</li>
              <li>• <strong>Footer:</strong> Redovi 36 i 39 (pomeraju se naniže)</li>
              <li>• <strong>Format:</strong> Podaci se upisuju od reda 10 nadole</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Tehničke karakteristike</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Kolona opseg:</strong> A-O (indeks 0-14)</li>
              <li>• <strong>Footer zaštita:</strong> Ostaje netaknut</li>
              <li>• <strong>Automatsko imenovanje:</strong> Sa timestamp-om</li>
              <li>• <strong>Error handling:</strong> Prikaz grešaka korisniku</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelExportComponent;
