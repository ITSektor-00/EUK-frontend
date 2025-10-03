"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ExportType, 
  ExportProgress, 
  ExportConfig, 
  ExportHistoryEntry,
  DEFAULT_EXPORT_CONFIG 
} from '../types/excel-export';
import { 
  downloadFile, 
  generateFilename, 
  formatFileSize, 
  createProgress,
  exportWithRetry,
  validateExportConfig 
} from '../utils/excelExportUtils';

interface AdvancedExcelExportComponentProps {
  baseUrl?: string;
  config?: Partial<ExportConfig>;
  onExportComplete?: (type: ExportType, filename: string, size: number) => void;
  onExportError?: (type: ExportType, error: string) => void;
  showHistory?: boolean;
  maxHistoryEntries?: number;
  enableWebSocket?: boolean;
}

const AdvancedExcelExportComponent: React.FC<AdvancedExcelExportComponentProps> = ({
  baseUrl = 'http://localhost:8080',
  config = {},
  onExportComplete,
  onExportError,
  showHistory = true,
  maxHistoryEntries = 10,
  enableWebSocket = false
}) => {
  const exportConfig = validateExportConfig({ ...config, baseUrl });
  
  const [exportStatus, setExportStatus] = useState<Record<ExportType, {
    isExporting: boolean;
    progress: ExportProgress;
    error?: string;
  }>>({
    t1: { isExporting: false, progress: createProgress(0, 100, 'preparing') },
    t2: { isExporting: false, progress: createProgress(0, 100, 'preparing') }
  });
  
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket konekcija
  useEffect(() => {
    if (enableWebSocket) {
      connectWebSocket();
      return () => disconnectWebSocket();
    }
  }, [enableWebSocket, baseUrl]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = baseUrl.replace('http', 'ws') + '/ws/export';
      wsRef.current = new WebSocket(wsUrl);
      
      setConnectionStatus('connecting');
      
      wsRef.current.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connected for export progress');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, [baseUrl]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    const { type, exportType, progress, error } = data;
    
    if (type === 'export_progress' && exportType) {
      setExportStatus(prev => ({
        ...prev,
        [exportType]: {
          ...prev[exportType as keyof typeof prev],
          progress: progress || prev[exportType as keyof typeof prev].progress
        }
      }));
    } else if (type === 'export_complete' && exportType) {
      setExportStatus(prev => ({
        ...prev,
        [exportType]: {
          isExporting: false,
          progress: createProgress(100, 100, 'complete'),
          error: undefined
        }
      }));
    } else if (type === 'export_error' && exportType) {
      setExportStatus(prev => ({
        ...prev,
        [exportType]: {
          isExporting: false,
          progress: createProgress(0, 100, 'preparing'),
          error: error || 'Nepoznata greška'
        }
      }));
    }
  }, []);

  // Export sa naprednim progress tracking-om
  const exportWithProgress = useCallback(async (type: ExportType) => {
    setExportStatus(prev => ({
      ...prev,
      [type]: {
        isExporting: true,
        progress: createProgress(0, 100, 'preparing'),
        error: undefined
      }
    }));

    // Dodaj u istoriju
    const historyEntry: ExportHistoryEntry = {
      type,
      filename: generateFilename(type),
      timestamp: new Date().toLocaleString('sr-RS'),
      status: 'success'
    };

    try {
      // Simulacija progress-a ako nema WebSocket
      if (!enableWebSocket) {
        const progressInterval = setInterval(() => {
          setExportStatus(prev => {
            const current = prev[type].progress;
            const newProgress = Math.min(current.percentage + Math.random() * 15, 90);
            
            return {
              ...prev,
              [type]: {
                ...prev[type],
                progress: createProgress(newProgress, 100, 'processing')
              }
            };
          });
        }, exportConfig.progressInterval);

        progressIntervalRef.current = progressInterval;
      }

      // Izvršavanje export-a
      const blob = await exportWithRetry(type, exportConfig);
      
      // Očisti interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Finalni progress
      setExportStatus(prev => ({
        ...prev,
        [type]: {
          isExporting: false,
          progress: createProgress(100, 100, 'complete'),
          error: undefined
        }
      }));

      // Download fajl
      const filename = generateFilename(type);
      downloadFile(blob, filename);
      
      // Ažuriraj istoriju
      historyEntry.size = blob.size;
      setExportHistory(prev => [historyEntry, ...prev.slice(0, maxHistoryEntries - 1)]);
      
      onExportComplete?.(type, filename, blob.size);

      // Reset progress after delay
      setTimeout(() => {
        setExportStatus(prev => ({
          ...prev,
          [type]: {
            isExporting: false,
            progress: createProgress(0, 100, 'preparing'),
            error: undefined
          }
        }));
      }, 2000);

    } catch (error: any) {
      // Očisti interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      const errorMessage = error.message || 'Nepoznata greška';
      
      setExportStatus(prev => ({
        ...prev,
        [type]: {
          isExporting: false,
          progress: createProgress(0, 100, 'preparing'),
          error: errorMessage
        }
      }));

      // Dodaj grešku u istoriju
      historyEntry.status = 'error';
      setExportHistory(prev => [historyEntry, ...prev.slice(0, maxHistoryEntries - 1)]);
      
      onExportError?.(type, errorMessage);
    }
  }, [exportConfig, enableWebSocket, onExportComplete, onExportError, maxHistoryEntries]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const getStatusColor = (type: ExportType) => {
    const status = exportStatus[type];
    if (status.error) return 'red';
    if (status.isExporting) return 'blue';
    return 'gray';
  };

  const getStatusIcon = (type: ExportType) => {
    const status = exportStatus[type];
    if (status.error) return '❌';
    if (status.isExporting) return '⏳';
    if (status.progress.percentage === 100) return '✅';
    return '⏸️';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Napredni Excel Export</h2>
            <p className="text-gray-600">Export sa real-time progress tracking-om</p>
          </div>
          
          {/* Connection Status */}
          {enableWebSocket && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'Povezan' : 
                 connectionStatus === 'connecting' ? 'Povezuje se...' : 'Nije povezan'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* T1 Export Card */}
        <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 ${
          getStatusColor('t1') === 'red' ? 'border-red-300' :
          getStatusColor('t1') === 'blue' ? 'border-blue-300' : 'border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
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
            <div className="text-2xl">{getStatusIcon('t1')}</div>
          </div>
          
          {/* Progress Bar */}
          {exportStatus.t1.isExporting && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {exportStatus.t1.progress.message}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {exportStatus.t1.progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${exportStatus.t1.progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => exportWithProgress('t1')}
            disabled={exportStatus.t1.isExporting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {exportStatus.t1.isExporting ? 'Izvoz u toku...' : 'Izvezi T1 tabelu'}
          </button>
          
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
        <div className={`bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 ${
          getStatusColor('t2') === 'red' ? 'border-red-300' :
          getStatusColor('t2') === 'blue' ? 'border-green-300' : 'border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
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
            <div className="text-2xl">{getStatusIcon('t2')}</div>
          </div>
          
          {/* Progress Bar */}
          {exportStatus.t2.isExporting && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">
                  {exportStatus.t2.progress.message}
                </span>
                <span className="text-sm font-bold text-green-600">
                  {exportStatus.t2.progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${exportStatus.t2.progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => exportWithProgress('t2')}
            disabled={exportStatus.t2.isExporting}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {exportStatus.t2.isExporting ? 'Izvoz u toku...' : 'Izvezi T2 tabelu'}
          </button>
          
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

      {/* Export History */}
      {showHistory && exportHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Istorija izvoza</h3>
          <div className="space-y-3">
            {exportHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    entry.type === 't1' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <span className="font-medium text-gray-900">
                      {entry.type === 't1' ? 'T1 Tabela' : 'T2 Tabela'}
                    </span>
                    <span className="text-gray-500 ml-2">•</span>
                    <span className="text-gray-600 ml-2">{entry.filename}</span>
                    {entry.size && (
                      <span className="text-gray-500 ml-2">
                        ({formatFileSize(entry.size)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    entry.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.status === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="text-sm text-gray-500">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedExcelExportComponent;
