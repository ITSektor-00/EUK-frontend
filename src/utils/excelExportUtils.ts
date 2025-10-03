import { ExportType, DownloadOptions, ExportProgress, ExportConfig } from '../types/excel-export';

/**
 * Utility funkcije za Excel export
 */

// Helper funkcija za download fajla
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Generisanje imena fajla sa timestamp-om
export const generateFilename = (
  type: ExportType, 
  options: DownloadOptions = {}
): string => {
  const { addTimestamp = true, timestampFormat = 'YYYY-MM-DD_HH-mm-ss' } = options;
  
  let filename = `ugrozena_lica_${type}`;
  
  if (addTimestamp) {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    filename += `_${timestamp}`;
  }
  
  filename += '.xlsx';
  
  return filename;
};

// Formatiranje veličine fajla
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Simulacija progress-a (za testiranje)
export const simulateProgress = (
  onProgress: (progress: number) => void,
  interval: number = 200
): NodeJS.Timeout => {
  let progress = 0;
  
  return setInterval(() => {
    progress += Math.random() * 15; // Random increment
    if (progress > 90) progress = 90; // Stop at 90%
    onProgress(Math.round(progress));
  }, interval);
};

// Kreiranje progress objekta
export const createProgress = (
  current: number,
  total: number,
  stage: ExportProgress['stage'] = 'processing'
): ExportProgress => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const messages = {
    preparing: 'Priprema podataka...',
    processing: 'Obrađuje se tabela...',
    generating: 'Generiše se Excel fajl...',
    downloading: 'Preuzimanje fajla...',
    complete: 'Izvoz završen!'
  };
  
  return {
    current,
    total,
    percentage,
    stage,
    message: messages[stage]
  };
};

// Validacija export tipa
export const isValidExportType = (type: string): type is ExportType => {
  return type === 't1' || type === 't2';
};

// Kreiranje error poruke
export const createErrorMessage = (type: ExportType, error: any): string => {
  const baseMessage = `Greška pri izvozu ${type} tabele`;
  
  if (error instanceof Error) {
    return `${baseMessage}: ${error.message}`;
  }
  
  if (typeof error === 'string') {
    return `${baseMessage}: ${error}`;
  }
  
  return `${baseMessage}: Nepoznata greška`;
};

// Retry logika
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < attempts - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        console.log(`Retry attempt ${i + 1}/${attempts} after ${backoffDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  throw lastError;
};

// Timeout wrapper
export const withTimeout = <T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
    })
  ]);
};

// Export sa retry i timeout
export const exportWithRetry = async (
  type: ExportType,
  config: ExportConfig,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const exportFn = async (): Promise<Blob> => {
    const response = await fetch(`${config.baseUrl}/api/export/excel/${type}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob();
  };
  
  const exportWithTimeout = () => withTimeout(exportFn(), config.timeout);
  
  return retryWithBackoff(exportWithTimeout, config.retryAttempts);
};

// Progress tracking hook
export const useProgressTracking = () => {
  const [progress, setProgress] = useState<ExportProgress>({
    current: 0,
    total: 100,
    percentage: 0,
    stage: 'preparing',
    message: 'Priprema...'
  });
  
  const updateProgress = (newProgress: Partial<ExportProgress>) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };
  
  const resetProgress = () => {
    setProgress({
      current: 0,
      total: 100,
      percentage: 0,
      stage: 'preparing',
      message: 'Priprema...'
    });
  };
  
  return { progress, updateProgress, resetProgress };
};

// Import useState za hook
import { useState } from 'react';

// Export status helper
export const getExportStatusColor = (status: 'idle' | 'exporting' | 'success' | 'error'): string => {
  const colors = {
    idle: 'text-gray-500',
    exporting: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500'
  };
  
  return colors[status] || colors.idle;
};

// Export status icon
export const getExportStatusIcon = (status: 'idle' | 'exporting' | 'success' | 'error'): string => {
  const icons = {
    idle: '⏸️',
    exporting: '⏳',
    success: '✅',
    error: '❌'
  };
  
  return icons[status] || icons.idle;
};

// Formatiranje vremena
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Validacija konfiguracije
export const validateExportConfig = (config: Partial<ExportConfig>): ExportConfig => {
  return {
    baseUrl: config.baseUrl || 'http://localhost:8080',
    timeout: config.timeout || 30000,
    retryAttempts: config.retryAttempts || 3,
    progressInterval: config.progressInterval || 200
  };
};
