// Excel Import TypeScript Types

export interface ImportStatus {
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  processedRows: number;
  totalRows: number;
  progress: number;
  elapsedTimeMs?: number;
  elapsedTimeSeconds?: number;
  lastError?: string;
}

export interface TableDetails {
  tableName: string;
  entityName: string;
  columnCount: number;
  columns: string[];
  displayNames: string[];
}

export interface ImportResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  filename?: string;
  table?: string;
  size?: number;
  expectedColumns?: number;
  timestamp?: number;
  error?: string;
}

export interface TablesResponse {
  status: 'SUCCESS' | 'ERROR';
  tables: string[];
  tableDetails: Record<string, TableDetails>;
}

export interface ExcelImportComponentProps {
  onImportComplete?: (response: ImportResponse) => void;
  onImportError?: (error: any) => void;
  baseUrl?: string;
}

// Error types
export interface ImportError {
  error: 'EMPTY_FILE' | 'INVALID_FILE_TYPE' | 'INVALID_TABLE' | 'INTERNAL_ERROR' | 'UNKNOWN';
  message: string;
  details?: string;
}

// File validation types
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Progress tracking types
export interface ProgressUpdate {
  processedRows: number;
  totalRows: number;
  progress: number;
  currentRow?: number;
  estimatedTimeRemaining?: number;
}

// Table format specifications
export interface TableFormatSpec {
  tableName: string;
  requiredColumns: string[];
  optionalColumns: string[];
  columnOrder: string[];
  dataTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  validations: Record<string, ValidationRule[]>;
}

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'range' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Import statistics
export interface ImportStatistics {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errors: ImportError[];
}

// Batch processing types
export interface BatchImportConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  parallelProcessing: boolean;
}

export interface BatchImportResult {
  batchId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
  results: ImportStatistics[];
}

// Excel file structure types
export interface ExcelFileInfo {
  filename: string;
  size: number;
  lastModified: Date;
  sheetCount: number;
  sheetNames: string[];
  totalRows: number;
  totalColumns: number;
}

export interface ExcelSheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  dataTypes: string[];
  hasData: boolean;
}

// API endpoint types
export interface ImportTablesRequest {
  includeDetails?: boolean;
  filter?: string[];
}

export interface ImportExcelRequest {
  file: File;
  table: string;
  options?: ImportOptions;
}

export interface ImportOptions {
  skipValidation?: boolean;
  updateExisting?: boolean;
  batchSize?: number;
  dryRun?: boolean;
}

export interface ImportStatusRequest {
  includeProgress?: boolean;
  includeErrors?: boolean;
}

// Response types for different endpoints
export type ImportTablesResponse = TablesResponse;

export interface ImportExcelResponse extends ImportResponse {
  importId?: string;
  estimatedTime?: number;
}

export interface ImportStatusResponse {
  importId: string;
  status: ImportStatus;
  statistics?: ImportStatistics;
  progress?: ProgressUpdate;
  errors?: ImportError[];
}

// Utility types
export type ImportStatusType = ImportStatus['status'];
export type ImportResponseType = ImportResponse['status'];
export type TableName = string;

// Event types for component communication
export interface ImportEvent {
  type: 'START' | 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'CANCEL';
  data?: any;
  timestamp: Date;
}

export interface ImportEventListener {
  (event: ImportEvent): void;
}

// Configuration types
export interface ExcelImportConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  pollingInterval: number;
  enableProgressTracking: boolean;
  enableErrorReporting: boolean;
}

// Default configuration
export const DEFAULT_IMPORT_CONFIG: ExcelImportConfig = {
  baseUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'),
  timeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.xlsx', '.xls'],
  pollingInterval: 2000, // 2 seconds
  enableProgressTracking: true,
  enableErrorReporting: true,
};

// Table format specifications for each supported table
export const TABLE_FORMATS: Record<string, TableFormatSpec> = {
  'euk.ugrozeno_lice_t1': {
    tableName: 'euk.ugrozeno_lice_t1',
    requiredColumns: ['redni_broj', 'ime', 'prezime'],
    optionalColumns: ['jmbg', 'ptt_broj', 'grad_opstina', 'mesto', 'ulica_i_broj', 'broj_clanova_domacinstva', 'osnov_sticanja_statusa', 'ed_broj_broj_mernog_uredjaja', 'potrosnja_i_povrsina_combined', 'iznos_umanjenja_sa_pdv', 'broj_racuna', 'datum_izdavanja_racuna', 'datum_trajanja_prava'],
    columnOrder: ['redni_broj', 'ime', 'prezime', 'jmbg', 'ptt_broj', 'grad_opstina', 'mesto', 'ulica_i_broj', 'broj_clanova_domacinstva', 'osnov_sticanja_statusa', 'ed_broj_broj_mernog_uredjaja', 'potrosnja_i_povrsina_combined', 'iznos_umanjenja_sa_pdv', 'broj_racuna', 'datum_izdavanja_racuna', 'datum_trajanja_prava'],
    dataTypes: {
      'redni_broj': 'string',
      'ime': 'string',
      'prezime': 'string',
      'jmbg': 'string',
      'ptt_broj': 'string',
      'grad_opstina': 'string',
      'mesto': 'string',
      'ulica_i_broj': 'string',
      'broj_clanova_domacinstva': 'number',
      'osnov_sticanja_statusa': 'string',
      'ed_broj_broj_mernog_uredjaja': 'string',
      'potrosnja_i_povrsina_combined': 'string',
      'iznos_umanjenja_sa_pdv': 'number',
      'broj_racuna': 'string',
      'datum_izdavanja_racuna': 'date',
      'datum_trajanja_prava': 'date'
    },
    validations: {
      'redni_broj': [
        { type: 'required', message: 'Redni broj je obavezan' }
      ],
      'ime': [
        { type: 'required', message: 'Ime je obavezno' },
        { type: 'length', value: { min: 1, max: 100 }, message: 'Ime mora imati između 1 i 100 karaktera' }
      ],
      'prezime': [
        { type: 'required', message: 'Prezime je obavezno' },
        { type: 'length', value: { min: 1, max: 100 }, message: 'Prezime mora imati između 1 i 100 karaktera' }
      ],
      'jmbg': [
        { type: 'format', value: /^\d{13}$/, message: 'JMBG mora imati tačno 13 cifara' }
      ]
    }
  },
  'euk.ugrozeno_lice_t2': {
    tableName: 'euk.ugrozeno_lice_t2',
    requiredColumns: ['redni_broj', 'ime', 'prezime'],
    optionalColumns: ['jmbg', 'ptt_broj', 'grad_opstina', 'mesto', 'ulica_i_broj'],
    columnOrder: ['redni_broj', 'ime', 'prezime', 'jmbg', 'ptt_broj', 'grad_opstina', 'mesto', 'ulica_i_broj'],
    dataTypes: {
      'redni_broj': 'string',
      'ime': 'string',
      'prezime': 'string',
      'jmbg': 'string',
      'ptt_broj': 'string',
      'grad_opstina': 'string',
      'mesto': 'string',
      'ulica_i_broj': 'string'
    },
    validations: {
      'redni_broj': [
        { type: 'required', message: 'Redni broj je obavezan' }
      ],
      'ime': [
        { type: 'required', message: 'Ime je obavezno' }
      ],
      'prezime': [
        { type: 'required', message: 'Prezime je obavezno' }
      ]
    }
  }
};
