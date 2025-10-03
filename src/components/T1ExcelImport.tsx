"use client";
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileUpload } from '@mui/icons-material';

interface T1ExcelImportProps {
  onImportSuccess: (result: any) => void;
  onImportError: (error: string) => void;
}

const T1ExcelImport: React.FC<T1ExcelImportProps> = ({ onImportSuccess, onImportError }) => {
  const { token } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleImport = async (file: File) => {
    if (!token) {
      onImportError('Token je potreban za import');
      return;
    }

    try {
      setIsImporting(true);
      
      // Send original Excel file directly as MultipartFile
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table', 'euk.ugrozeno_lice_t1'); // T1 tabela
      
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        onImportError(errorData.error || 'Greška pri importu T1 fajla');
        return;
      }
      
      const result = await response.json();
      
      // Check if import was successful
      if (result.status === 'SUCCESS') {
        onImportSuccess(result);
      } else {
        onImportError(result.message || 'T1 Import failed');
      }
      
    } catch (error) {
      onImportError('Greška pri komunikaciji sa serverom');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleImport(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="t1-excel-import">
      <label 
        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium cursor-pointer ${
          isImporting 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isImporting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FileUpload className="w-4 h-4" />
        )}
        {isImporting ? 'T1 Import u toku...' : 'T1 Excel Import'}
        <input
          type="file"
          accept=".xlsx,.xls"
          disabled={isImporting}
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
      
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center">
              <FileUpload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">Spustite T1 Excel fajl ovde</p>
              <p className="text-sm text-gray-600">Podržani formati: .xlsx, .xls</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default T1ExcelImport;
