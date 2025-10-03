"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import { PermissionGuard } from '@/components/PermissionGuard';

import NovoUgrozenoLiceT2Modal from './NovoUgrozenoLiceT2Modal';
import UgrozenoLicaT2Statistika from './UgrozenoLicaT2Statistika';

// Material UI Imports
import { Paper } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Icons Imports
import { Add, FileDownload, FileUpload } from '@mui/icons-material';

// Export imports
import { mkConfig, generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';
import ExportDialog from '../../components/ExportDialog';

import { UgrozenoLiceT2 } from './types';

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function UgrozenoLiceT2Page() {
  const { token, user } = useAuth();
  const [ugrozenaLicaT2, setUgrozenaLicaT2] = useState<UgrozenoLiceT2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Simple import state
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState<{
    processedRecords: number;
    totalRecords: number;
    processingTimeMs: number;
    filename: string;
  } | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUgrozenoLice, setEditingUgrozenoLice] = useState<UgrozenoLiceT2 | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'tabela' | 'statistika'>('tabela');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // State za custom selekciju
  const [customSelectedIds, setCustomSelectedIds] = useState<Set<number>>(new Set());
  
  // Toggle funkcija za selekciju
  const toggleRowSelection = (id: number) => {
    setCustomSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (customSelectedIds.size > 0) {
      setCustomSelectedIds(new Set());
    } else {
      const allIds = new Set(ugrozenaLicaT2.map(row => row.ugrozenoLiceId).filter((id): id is number => Boolean(id)));
      setCustomSelectedIds(allIds);
    }
  };

  // Filter states
  const [filters, setFilters] = useState({
    redniBroj: '',
    ime: '',
    prezime: '',
    jmbg: '',
    gradOpstina: '',
    mesto: '',
    edBroj: ''
  });

  const fetchUgrozenaLicaT2 = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('size', '1000');
      params.append('page', '0');
      
      const data = await apiService.getUgrozenaLicaT2(params.toString(), token!);
      const pageData = data.content || data;
      setUgrozenaLicaT2(Array.isArray(pageData) ? pageData : []);
    } catch (err) {
      console.error('Error fetching ugrozena lica T2:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUgrozenaLicaT2();
    setRefreshing(false);
  };

  const handleFilterSearch = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const hasFilters = Object.values(filters).some(value => value && value.toString().trim() !== '');
      
      if (!hasFilters) {
        await fetchUgrozenaLicaT2(false);
        return;
      }

      // Use basic search for now
      const params = new URLSearchParams();
      if (filters.ime.trim()) params.append('ime', filters.ime.trim());
      if (filters.prezime.trim()) params.append('prezime', filters.prezime.trim());
      if (filters.jmbg.trim()) params.append('jmbg', filters.jmbg.trim());
      
      const searchResults = await apiService.getUgrozenaLicaT2(params.toString(), token);
      const ugrozenaLicaData = searchResults.content || searchResults;
      setUgrozenaLicaT2(ugrozenaLicaData);
    } catch (err) {
      console.error('Error in filter search:', err);
      setError(err instanceof Error ? err.message : 'Greška pri pretrazi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUgrozenaLicaT2();
    }
  }, [token]);

  const handleModalSuccess = () => {
    fetchUgrozenaLicaT2();
  };

  // Backend Excel export sa template-om
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Funkcija za konverziju ćirilice u latinicu za PDF
  const cirilicaULatinicu = (text: string): string => {
    if (!text) return text;
    
    const cirilicaLatiniskiMap: Record<string, string> = {
      'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
      'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ',
      'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž', 'З': 'Z', 'з': 'z',
      'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
      'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm',
      'Н': 'N', 'н': 'n', 'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o',
      'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
      'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
      'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c',
      'Ч': 'Č', 'ч': 'č', 'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'ш': 'š'
    };
    
    return text.split('').map(char => cirilicaLatiniskiMap[char] || char).join('');
  };

  const handleBackendExcelExport = async (selectedIds?: number[]) => {
    try {
      setIsExporting(true);
      setExportError(null);
      
      console.log('📤 Starting backend Excel export with T2 template...');
      
      let url: string;
      let options: RequestInit;
      
      if (selectedIds && selectedIds.length > 0) {
        // Export filtered data
        url = 'http://localhost:8080/api/export/dynamic/t2/filtered';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ids: selectedIds })
        };
        console.log(`📊 Exporting ${selectedIds.length} selected T2 records...`);
      } else {
        // Export all data
        url = 'http://localhost:8080/api/export/dynamic/t2';
        options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        console.log('📊 Exporting all T2 records...');
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ЕУК_Т2_Извештај.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Decode URI component if needed
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            console.log('Filename already decoded or not URI encoded');
          }
        }
      }
      
      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log(`✅ Excel file downloaded: ${filename}`);
      
    } catch (error) {
      console.error('❌ Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Грешка при извозу');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setIsImporting(true);
      setShowErrorPopup(false);
      setErrorMessage('');
      
      // Send original Excel file directly as MultipartFile
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table', 'euk.ugrozeno_lice_t2'); // 🔴 VAŽNO ZA T2!
      
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Greška pri importu fajla');
        setShowErrorPopup(true);
        return;
      }
      
      const result = await response.json();
      
      // Check if import was successful
      if (result.status === 'SUCCESS') {
        // Store import result
        setImportResult({
          processedRecords: result.processedRecords,
          totalRecords: result.totalRecords,
          processingTimeMs: result.processingTimeMs,
          filename: result.filename
        });
        
        // Refresh data
        await fetchUgrozenaLicaT2();
        
        // Show success popup with actual data
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        setErrorMessage(result.message || 'Import failed');
        setShowErrorPopup(true);
      }
      
    } catch (error) {
      setErrorMessage('Greška pri komunikaciji sa serverom');
      setShowErrorPopup(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (selectedColumns: string[], format: string, data: Record<string, unknown>[]) => {
    // Za Excel format, koristi backend sa template-om
    if (format === 'excel') {
      // Extract IDs from data
      const ids = data
        .map(item => item.ugrozenoLiceId)
        .filter((id): id is number => typeof id === 'number');
      
      // If we have selected rows from custom selection, use those instead
      const selectedIds = customSelectedIds.size > 0 
        ? Array.from(customSelectedIds) 
        : (ids.length < ugrozenaLicaT2.length ? ids : undefined);
      
      await handleBackendExcelExport(selectedIds);
      return;
    }
    
    // Filter data to only include selected columns
    const filteredData = data.map(item => {
      const filteredItem: Record<string, unknown> = {};
      selectedColumns.forEach(col => {
        // Za JMBG dodaj prefix da se čuva kao tekst u Excel-u
        if (col === 'jmbg' && item[col]) {
          // Dodaj tab karakter da Excel tretira kao tekst
          filteredItem[col] = `\t${item[col]}`;
        } else {
        filteredItem[col] = item[col];
        }
      });
      return filteredItem;
    });

    switch (format) {
      case 'csv':
        const csv = generateCsv(csvConfig)(filteredData as Record<string, string | number>[]);
        download(csvConfig)(csv);
        break;
      case 'pdf':
        // PDF export je uklonjen - koristi se backend stampanje
        console.log('PDF export je uklonjen. Koristite stampanje stranicu za PDF generisanje.');
        break;
      default:
        console.log('Unknown format:', format);
    }
  };

  const renderSimpleHeader = useCallback((title: string) => {
    return <span className="font-semibold text-gray-900">{title}</span>;
  }, []);

  const columns: GridColDef[] = useMemo(() => ([
    { 
      field: 'redniBroj', 
      headerName: 'редни број', 
      width: 120,
      renderHeader: () => renderSimpleHeader('редни број')
    },
    { 
      field: 'ime', 
      headerName: 'име', 
      width: 150,
      renderHeader: () => renderSimpleHeader('име')
    },
    { 
      field: 'prezime', 
      headerName: 'презиме', 
      width: 150,
      renderHeader: () => renderSimpleHeader('презиме')
    },
    { 
      field: 'jmbg', 
      headerName: 'јмбг', 
      width: 140,
      renderHeader: () => renderSimpleHeader('јмбг')
    },
    { 
      field: 'pttBroj', 
      headerName: 'птт број', 
      width: 100,
      renderHeader: () => renderSimpleHeader('птт број')
    },
    { 
      field: 'gradOpstina', 
      headerName: 'град/општина', 
      width: 150,
      renderHeader: () => renderSimpleHeader('град/општина')
    },
    { 
      field: 'mesto', 
      headerName: 'место', 
      width: 120,
      renderHeader: () => renderSimpleHeader('место')
    },
    { 
      field: 'ulicaIBroj', 
      headerName: 'улица и број', 
      width: 180,
      renderHeader: () => renderSimpleHeader('улица и број')
    },
    { 
      field: 'edBroj', 
      headerName: 'ед број', 
      width: 120,
      renderHeader: () => renderSimpleHeader('ед број')
    },
    { 
      field: 'pokVazenjaResenjaOStatusu', 
      headerName: 'покриће важења решења', 
      width: 200,
      renderHeader: () => renderSimpleHeader('покриће важења решења')
    },
    {
      field: 'actions',
      headerName: 'акције',
      width: 150,
      sortable: false,
      filterable: false,
      headerAlign: 'left',
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex items-center justify-center gap-2 h-full w-full">
          <button
            onClick={() => {
              setEditingUgrozenoLice(params.row);
              setShowModal(true);
            }}
            className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Уреди угрожено лице"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={async () => {
              if (confirm('Да ли сте сигурни да желите да обришете ово угрожено лице?')) {
                try {
                  const result = await apiService.deleteUgrozenoLiceT2(params.row.ugrozenoLiceId!, token!);
                  console.log('Delete result:', result);
                  fetchUgrozenaLicaT2();
                } catch (err) {
                  console.error('Delete error:', err);
                  setError(err instanceof Error ? err.message : 'Greška pri brisanju');
                }
              }
            }}
            className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Обриши угрожено лице"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    },
  ]), [renderSimpleHeader, token]);

  // Dodaj custom checkbox kolonu na početak
  const columnsWithSelection: GridColDef[] = useMemo(() => [
    {
      field: 'customSelect',
      headerName: '',
      name: 'customSelect',
      width: 50,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <input
          type="checkbox"
          checked={customSelectedIds.size > 0 && customSelectedIds.size === ugrozenaLicaT2.length}
          ref={checkbox => {
            if (checkbox) checkbox.indeterminate = customSelectedIds.size > 0 && customSelectedIds.size < ugrozenaLicaT2.length;
          }}
          onChange={toggleSelectAll}
          className="cursor-pointer"
        />
      ),
      renderCell: (params: GridRenderCellParams) => (
        <input
          type="checkbox"
          checked={customSelectedIds.has(params.row.ugrozenoLiceId)}
          onChange={() => toggleRowSelection(params.row.ugrozenoLiceId)}
          className="cursor-pointer"
        />
      ),
    },
    ...columns
  ], [customSelectedIds, ugrozenaLicaT2.length, toggleSelectAll, toggleRowSelection, columns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <img 
                  src="/ikoniceSidebar/beleIkonice/ugrozenaLicaBelo.png" 
                  alt="EUK Ugrožena lica T2" 
                  className="w-9 h-9"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ЕУК-Т2 Угрожена лица</h1>
                <p className="text-base text-gray-600">Управљање угроженим лицима за ЕУК-Т2 систем</p>
              </div>
            </div>
          </div>

          {error && (
            <ErrorHandler error={error} onRetry={fetchUgrozenaLicaT2} />
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('tabela')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-[140px] h-[44px] justify-center cursor-pointer ${
                    activeTab === 'tabela'
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <img 
                    src={activeTab === 'tabela' ? "/ikoniceSidebar/beleIkonice/tableBelo.svg" : "/ikoniceSidebar/table.svg"} 
                    alt="Table" 
                    className="w-6 h-6" 
                  />
                  Табела
                </button>
                <button
                  onClick={() => setActiveTab('statistika')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-[140px] h-[44px] justify-center cursor-pointer ${
                    activeTab === 'statistika'
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <svg 
                    className="!w-6 !h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    width="24" 
                    height="24"
                    style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Статистика
                </button>
              </div>

              {activeTab === 'tabela' && (
                <div className="flex gap-4 items-center">
                  {/* Import loader */}
                  {isImporting && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Увоз у току...</span>
                    </div>
                  )}
                  
                  {/* Export loader */}
                  {isExporting && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-md">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Извоз у току...</span>
                    </div>
                  )}
                  
                  {/* Export error */}
                  {exportError && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{exportError}</span>
                      <button
                        onClick={() => setExportError(null)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="write" userId={user?.id || undefined}>
                    <button
                      onClick={() => {
                        setEditingUgrozenoLice(null);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                    >
                      <Add className="w-4 h-4" />
                      Додај ново угрожено лице
                    </button>
                  </PermissionGuard>
                  
                  <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="read" userId={user?.id || undefined}>
                    <button
                      onClick={() => setExportDialogOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                    >
                      <FileDownload className="w-4 h-4" />
                      Извоз
                    </button>
                    {customSelectedIds.size > 0 && (
                      <button
                        onClick={() => setExportDialogOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium cursor-pointer shadow-md"
                      >
                        <FileDownload className="w-4 h-4" />
                        Извоз означених ({customSelectedIds.size})
                      </button>
                    )}
                  </PermissionGuard>
                  
                  <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="write" userId={user?.id || undefined}>
                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm font-medium cursor-pointer ${
                      isImporting 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                    }`}>
                      {isImporting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FileUpload className="w-4 h-4" />
                      )}
                      {isImporting ? 'Увоз у току...' : 'Увоз'}
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        disabled={isImporting}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImport(file);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </PermissionGuard>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                  >
                    Филтери
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'tabela' ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Filters Section */}
              {showFilters && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Филтери и претрага</h4>
                      <p className="text-sm text-gray-600 mt-1">Филтрирај угрожена лица по различитим критеријумима</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Редни број</label>
                        <input
                          type="text"
                          placeholder="Претражи по редном броју..."
                          value={filters.redniBroj}
                          onChange={(e) => setFilters(prev => ({ ...prev, redniBroj: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Име</label>
                        <input
                          type="text"
                          placeholder="Претражи по имену..."
                          value={filters.ime}
                          onChange={(e) => setFilters(prev => ({ ...prev, ime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Презиме</label>
                        <input
                          type="text"
                          placeholder="Претражи по презимену..."
                          value={filters.prezime}
                          onChange={(e) => setFilters(prev => ({ ...prev, prezime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЈМБГ-у..."
                          value={filters.jmbg}
                          onChange={(e) => setFilters(prev => ({ ...prev, jmbg: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Град/Општина</label>
                        <input
                          type="text"
                          placeholder="Претражи по граду/општини..."
                          value={filters.gradOpstina}
                          onChange={(e) => setFilters(prev => ({ ...prev, gradOpstina: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Место</label>
                        <input
                          type="text"
                          placeholder="Претражи по месту..."
                          value={filters.mesto}
                          onChange={(e) => setFilters(prev => ({ ...prev, mesto: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЕД број</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЕД броју..."
                          value={filters.edBroj}
                          onChange={(e) => setFilters(prev => ({ ...prev, edBroj: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Акције</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFilters({
                              redniBroj: '',
                              ime: '',
                              prezime: '',
                              jmbg: '',
                              gradOpstina: '',
                              mesto: '',
                              edBroj: ''
                            })}
                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer text-sm"
                          >
                            Очисти
                          </button>
                          <button
                            onClick={handleFilterSearch}
                            className="flex-1 px-3 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-medium cursor-pointer text-sm"
                          >
                            Претражи
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* DataGrid Table */}
              <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={ugrozenaLicaT2}
                  columns={columnsWithSelection}
                  getRowId={(row) => row.ugrozenoLiceId || Math.random()}
                  paginationModel={{ page: currentPage, pageSize: pageSize }}
                  onPaginationModelChange={(model) => {
                    setCurrentPage(model.page);
                    setPageSize(model.pageSize);
                  }}
                  pageSizeOptions={[10, 20, 30]}
                  disableRowSelectionOnClick
                  disableColumnMenu
                  disableColumnSorting
                  sx={{ 
                    border: 0,
                    '& .MuiDataGrid-cell': {
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      '& .MuiDataGrid-menuIcon, & .MuiDataGrid-sortIcon, & .MuiDataGrid-columnMenuIcon, & .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-sortIconContainer, & .MuiDataGrid-iconButton': {
                        display: 'none'
                      }
                    }
                  }}
                  slots={{
                    footer: () => (
                      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-600">
                              Укупно: <span className="font-semibold text-gray-800">{ugrozenaLicaT2.length}</span> угрожених лица Т2
                            </span>
                            {customSelectedIds.size > 0 && (
                              <span className="text-sm text-blue-600">
                                Означено: <span className="font-semibold text-blue-800">{customSelectedIds.size}</span> за извоз
                              </span>
                            )}
                            <button
                              onClick={handleRefresh}
                              disabled={refreshing}
                              className="flex items-center gap-2 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Освежи податке"
                            >
                              <svg className={`w-3 h-3 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {refreshing ? 'Освежавам...' : 'Освежи'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              </Paper>
            </div>
          ) : (
            <UgrozenoLicaT2Statistika ugrozenaLicaT2={ugrozenaLicaT2} />
          )}

          {/* Modal */}
          <NovoUgrozenoLiceT2Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingUgrozenoLice(null);
            }}
            onSuccess={handleModalSuccess}
            editingUgrozenoLice={editingUgrozenoLice}
            token={token!}
          />

          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            columns={columns
              .filter(col => col.field !== 'actions')
              .map(col => ({ accessorKey: col.field, header: col.headerName || col.field }))}
            data={ugrozenaLicaT2 as unknown as Record<string, unknown>[]}
            selectedRows={Array.from(customSelectedIds) as any}
            onExport={handleExport}
          />

          {/* Success Popup */}
          {showSuccessPopup && importResult && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">Увоз завршен!</div>
                  <div className="text-sm text-green-100">
                    {importResult.processedRecords}/{importResult.totalRecords} записа увезено
                  </div>
                  <div className="text-xs text-green-200">
                    {importResult.filename} • {(importResult.processingTimeMs / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Popup */}
          {showErrorPopup && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
              <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Грешка при увозу</div>
                  <div className="text-sm text-red-100 mt-1">
                    {errorMessage}
                  </div>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="text-red-200 hover:text-white text-xs font-medium underline mt-2"
                  >
                    Затвори
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
