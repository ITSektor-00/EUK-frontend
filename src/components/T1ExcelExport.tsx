"use client";
import React, { useState } from 'react';

interface T1ExcelExportProps {
  baseUrl?: string;
  onExportComplete?: (filename: string) => void;
  onExportError?: (error: string) => void;
}

const T1ExcelExport: React.FC<T1ExcelExportProps> = ({
  baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'),
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setError(null);

    // Simulacija progress-a
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 90);
        return newProgress;
      });
    }, 200);

    try {

      const response = await fetch(`${baseUrl}/api/export/excel/t1`);
      
      if (!response.ok) {
        throw new Error(`Greška pri izvozu T1 tabele: ${response.status} ${response.statusText}`);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const blob = await response.blob();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `ugrozena_lica_t1_${timestamp}.xlsx`;
      
      // Download fajl
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onExportComplete?.(filename);

      // Reset progress after delay
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 1000);

    } catch (error: any) {
      clearInterval(progressInterval);
      const errorMessage = error.message || 'Nepoznata greška';
      setError(errorMessage);
      setIsExporting(false);
      setProgress(0);
      onExportError?.(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Excel Export - T1 Tabela</h3>
          <p className="text-sm text-gray-600">Izvezite podatke u Excel format sa template-om</p>
        </div>
        <div className="text-2xl">📊</div>
      </div>

      <div className="space-y-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center"
        >
          {isExporting ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Izvoz u toku...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Izvezi T1 tabelu
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">Napredak</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-600 mr-2">✕</div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Informacije o izvozu</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Template:</strong> Koristi se postojeći Excel template sa zaglavljem</li>
            <li>• <strong>Format:</strong> Podaci se upisuju od reda 10 nadole</li>
            <li>• <strong>Kolone:</strong> A-O (15 kolona)</li>
            <li>• <strong>Footer:</strong> Ostaje netaknut i pomera se naniže</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default T1ExcelExport;
