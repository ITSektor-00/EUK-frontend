"use client";
import React, { useState, useEffect } from 'react';

interface ImportStatus {
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  processedRows: number;
  totalRows: number;
  progress: number;
  elapsedTimeMs?: number;
  elapsedTimeSeconds?: number;
  lastError?: string;
}

interface TableDetails {
  tableName: string;
  entityName: string;
  columnCount: number;
  columns: string[];
  displayNames: string[];
}

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

interface TablesResponse {
  status: 'SUCCESS' | 'ERROR';
  tables: string[];
  tableDetails: Record<string, TableDetails>;
}

interface ExcelImportComponentProps {
  onImportComplete?: (response: ImportResponse) => void;
  onImportError?: (error: any) => void;
  baseUrl?: string;
}

const ExcelImportComponent: React.FC<ExcelImportComponentProps> = ({
  onImportComplete,
  onImportError,
  baseUrl = 'http://localhost:8080'
}) => {
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [tableDetails, setTableDetails] = useState<Record<string, TableDetails>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Učitaj dostupne tabele
  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/import/tables`);
        const data: TablesResponse = await response.json();
        
        if (data.status === 'SUCCESS') {
          setAvailableTables(data.tables);
          setTableDetails(data.tableDetails);
        } else {
          setError('Greška pri učitavanju tabela');
        }
      } catch (err) {
        console.error('Error loading tables:', err);
        setError('Greška pri povezivanju sa serverom');
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [baseUrl]);

  // Polling za status
  const pollStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/import/status`);
      const status: ImportStatus = await response.json();
      
      setImportStatus(status);
      
      if (status.status === 'PROCESSING') {
        setTimeout(pollStatus, 2000);
      } else if (status.status === 'COMPLETED') {
        setIsImporting(false);
        onImportComplete?.({
          status: 'SUCCESS',
          message: 'Import završen uspešno!',
          filename: selectedFile?.name,
          table: selectedTable
        });
      } else if (status.status === 'ERROR') {
        setIsImporting(false);
        const errorMsg = status.lastError || 'Nepoznata greška';
        onImportError?.(errorMsg);
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setIsImporting(false);
      onImportError?.(err);
    }
  };

  // Upload fajla
  const handleUpload = async () => {
    if (!selectedFile || !selectedTable) {
      setError('Molimo odaberite fajl i tabelu');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('table', selectedTable);

    try {
      setIsImporting(true);
      setError('');
      
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData
      });
      
      const data: ImportResponse = await response.json();
      
      if (data.status === 'SUCCESS') {
        pollStatus(); // Počni polling
      } else {
        setIsImporting(false);
        setError(data.message || 'Greška pri pokretanju importa');
        onImportError?.(data);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setIsImporting(false);
      setError('Greška pri upload-u fajla');
      onImportError?.(err);
    }
  };

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Molimo odaberite Excel fajl (.xlsx ili .xls)');
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setSelectedTable('');
    setImportStatus(null);
    setIsImporting(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Učitavanje tabela...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Excel Import</h2>
        <p className="text-gray-600">Importujte podatke iz Excel fajlova u bazu podataka</p>
      </div>
      
      {/* Table selection */}
      <div className="mb-6">
        <label htmlFor="table-select" className="block text-sm font-semibold text-gray-700 mb-2">
          Odaberite tabelu:
        </label>
        <select 
          id="table-select"
          value={selectedTable} 
          onChange={(e) => setSelectedTable(e.target.value)}
          disabled={isImporting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Odaberite tabelu</option>
          {availableTables.map(table => (
            <option key={table} value={table}>
              {table} ({tableDetails[table]?.columnCount || 0} kolona)
            </option>
          ))}
        </select>
      </div>

      {/* File upload */}
      <div className="mb-6">
        <label htmlFor="file-input" className="block text-sm font-semibold text-gray-700 mb-2">
          Odaberite Excel fajl:
        </label>
        <input 
          id="file-input"
          type="file" 
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isImporting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Podržani formati: .xlsx, .xls | Maksimalna veličina: 10MB
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-600 mr-2">✕</div>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Upload button */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleUpload} 
          disabled={isImporting || !selectedFile || !selectedTable}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {isImporting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Import u toku...
            </div>
          ) : (
            'Počni import'
          )}
        </button>
        
        {!isImporting && (selectedFile || selectedTable) && (
          <button 
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress tracking */}
      {importStatus && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status uvoza</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900 capitalize">{importStatus.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progres</p>
              <p className="font-semibold text-blue-600">{importStatus.progress?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Obrađeno</p>
              <p className="font-semibold text-gray-900">{importStatus.processedRows} / {importStatus.totalRows}</p>
            </div>
            {importStatus.elapsedTimeSeconds && (
              <div>
                <p className="text-sm text-gray-600">Vreme</p>
                <p className="font-semibold text-gray-900">{importStatus.elapsedTimeSeconds.toFixed(1)}s</p>
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${importStatus.progress || 0}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Table format info */}
      {selectedTable && tableDetails[selectedTable] && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Format Excel fajla za {selectedTable}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2"><strong>Broj kolona:</strong> {tableDetails[selectedTable].columnCount}</p>
              <p className="text-sm text-gray-600"><strong>Entitet:</strong> {tableDetails[selectedTable].entityName}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Kolone:</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {tableDetails[selectedTable].displayNames.map((name, index) => (
                  <div key={index} className="flex items-center">
                    <span className="font-mono text-blue-600 mr-1">{String.fromCharCode(65 + index)}:</span>
                    <span className="text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImportComponent;
