"use client";
import { useState } from "react";
import axios from "axios";

interface FileUploadProps {
  onUploadComplete?: (response: any) => void;
  onUploadError?: (error: any) => void;
  uploadUrl?: string;
  acceptedTypes?: string;
  maxFileSize?: number; // u MB
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  uploadUrl = "http://localhost:8080/api/import/excel",
  acceptedTypes = ".xlsx,.xls",
  maxFileSize = 10 // 10MB default
}: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Proveri veličinu fajla
    if (file.size > maxFileSize * 1024 * 1024) {
      setErrorMessage(`Fajl je prevelik. Maksimalna veličina je ${maxFileSize}MB`);
      setUploadStatus('error');
      return;
    }

    // Proveri tip fajla
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setErrorMessage(`Nedozvoljen tip fajla. Dozvoljeni tipovi: ${acceptedTypes}`);
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
    setProgress(0);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setErrorMessage('Molimo izaberite fajl');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(uploadUrl, formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
        timeout: 300000 // 5 minuta timeout
      });

      setUploadStatus('success');
      setProgress(100);
      onUploadComplete?.(response.data);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Greška pri upload-u fajla'
      );
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setSelectedFile(null);
    setIsUploading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Izaberite Excel fajl
          </label>
          <input 
            type="file" 
            name="file" 
            accept={acceptedTypes}
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maksimalna veličina: {maxFileSize}MB | Tipovi: {acceptedTypes}
          </p>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-blue-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={resetUpload}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Upload napredak</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center">
              {progress < 100 ? 'Upload u toku...' : 'Upload završen!'}
            </p>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="w-5 h-5 text-green-600 mr-2">✓</div>
              <p className="text-sm text-green-800">Fajl je uspešno upload-ovan!</p>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-600 mr-2">✕</div>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Upload u toku...
              </div>
            ) : (
              'Upload Fajl'
            )}
          </button>
          
          {uploadStatus === 'success' && (
            <button
              type="button"
              onClick={resetUpload}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Novi Upload
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
