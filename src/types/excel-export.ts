// Excel Export TypeScript tipovi

export interface ExportStatus {
  isExporting: boolean;
  progress: number;
  error?: string;
}

export interface ExportResponse {
  blob: Blob;
  filename: string;
  size: number;
  type: string;
}

export interface ExportHistoryEntry {
  type: 't1' | 't2';
  filename: string;
  timestamp: string;
  size?: number;
  status: 'success' | 'error';
}

export interface ExcelExportComponentProps {
  baseUrl?: string;
  onExportComplete?: (type: string, filename: string) => void;
  onExportError?: (type: string, error: string) => void;
  showHistory?: boolean;
  maxHistoryEntries?: number;
}

export interface TableInfo {
  title: string;
  description: string;
  columns: number;
  features: string[];
  color: 'blue' | 'green';
}

export interface ExportConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  progressInterval: number;
}

export interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'complete';
  message: string;
}

// Helper funkcije tipovi
export type ExportType = 't1' | 't2';

export type ExportStage = 'preparing' | 'processing' | 'generating' | 'downloading' | 'complete';

export interface DownloadOptions {
  filename?: string;
  addTimestamp?: boolean;
  timestampFormat?: string;
}

// API Response tipovi
export interface ExportStatusResponse {
  message: string;
  status: 'idle' | 'processing' | 'error';
  progress?: number;
}

export interface ExportError {
  code: string;
  message: string;
  details?: any;
}

// Event tipovi za WebSocket ili Server-Sent Events
export interface ExportProgressEvent {
  type: 'progress';
  data: ExportProgress;
}

export interface ExportCompleteEvent {
  type: 'complete';
  data: {
    filename: string;
    size: number;
    downloadUrl: string;
  };
}

export interface ExportErrorEvent {
  type: 'error';
  data: ExportError;
}

export type ExportEvent = ExportProgressEvent | ExportCompleteEvent | ExportErrorEvent;

// Utility funkcije tipovi
export interface FileDownloader {
  download: (blob: Blob, filename: string) => void;
  createDownloadUrl: (blob: Blob) => string;
  revokeDownloadUrl: (url: string) => void;
}

export interface ProgressTracker {
  start: () => void;
  update: (progress: number) => void;
  complete: () => void;
  error: (error: string) => void;
}

// Template tipovi
export interface ExcelTemplate {
  name: string;
  path: string;
  headerRows: number;
  dataStartRow: number;
  footerRows: number[];
  columns: string[];
}

export interface TemplateConfig {
  t1: ExcelTemplate;
  t2: ExcelTemplate;
}

// Export konfiguracija
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  progressInterval: 200
};

export const TABLE_INFO: Record<ExportType, TableInfo> = {
  t1: {
    title: 'T1 Tabela',
    description: 'Kompletna struktura sa energetskim podacima',
    columns: 15,
    features: [
      'Energetski podaci',
      'Potrošnja i površina',
      'Iznos umanjenja sa PDV',
      'Datum izdavanja računa'
    ],
    color: 'blue'
  },
  t2: {
    title: 'T2 Tabela',
    description: 'Pojednostavljena struktura',
    columns: 15,
    features: [
      'Osnovni podaci',
      'Potrošnja kWh',
      'Zagrevana površina',
      'Iznos umanjenja'
    ],
    color: 'green'
  }
};
