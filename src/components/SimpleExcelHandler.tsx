"use client";
import React, { useState } from 'react';

interface SimpleExcelHandlerProps {
  baseUrl?: string;
}

const SimpleExcelHandler: React.FC<SimpleExcelHandlerProps> = ({
  baseUrl = 'http://localhost:8080'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Proveri da li je Excel fajl
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setMessage('Molimo izaberite Excel fajl (.xlsx ili .xls)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage('Upload u toku...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulacija progress-a
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // NOVO - ispravan endpoint sa table parametrom
      // ❌ Stari (pogrešan) endpoint: POST /api/euk/ugrozena-lica-t1/batch
      // ✅ Novi (ispravan) endpoint: POST /api/import/excel
      formData.append('table', 'euk.ugrozeno_lice_t1');

      const response = await fetch(`${baseUrl}/api/import/excel`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(`✅ Upload uspešan! ${result.processed || 0} zapisa je importovano.`);
      
      // Resetuj input
      event.target.value = '';

    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage(`❌ Greška pri upload-u: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setMessage('Download u toku...');

    try {
      // Simulacija progress-a
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 15, 90));
      }, 150);

      const response = await fetch(`${baseUrl}/api/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      clearInterval(progressInterval);
      setDownloadProgress(100);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ugrozena_lica_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage('✅ Download uspešan! Fajl je preuzet.');

    } catch (error: any) {
      console.error('Download error:', error);
      setMessage(`❌ Greška pri download-u: ${error.message}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Excel Handler</h3>
          <p className="text-sm text-gray-600">Jednostavan upload i download Excel fajlova</p>
        </div>
        <div className="text-2xl">📊</div>
      </div>

      <div className="space-y-4">
        {/* Upload Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">📤 Upload Excel</h4>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isUploading ? 'Upload u toku...' : 'Izaberi Excel fajl'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            
            {isUploading && (
              <div className="flex-1">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">{uploadProgress}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">📥 Download Excel</h4>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isDownloading ? 'Download u toku...' : 'Preuzmi Excel'}
            </button>
            
            {isDownloading && (
              <div className="flex-1">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-green-600 mt-1">{downloadProgress}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-2">
                {message.includes('✅') ? '✅' : '❌'}
              </div>
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Informacije</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Upload:</strong> POST /api/import/excel sa table parametrom</li>
            <li>• <strong>Download:</strong> GET /api/export/excel</li>
            <li>• <strong>Table:</strong> euk.ugrozeno_lice_t1 (T1 tabela)</li>
            <li>• <strong>Format:</strong> Podaci počinju od reda 10</li>
            <li>• <strong>Validacija:</strong> Backend proverava JMBG i obavezna polja</li>
            <li>• <strong>Batch:</strong> Backend obrađuje po 1000 redova</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleExcelHandler;
