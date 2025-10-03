"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import { PermissionGuard } from '@/components/PermissionGuard';
import { webSocketService } from '../../../services/websocketService';

import NovoUgrozenoLiceModal from './NovoUgrozenoLiceModal';
import UgrozenaLicaStatistika from './UgrozenaLicaStatistika';
import UrediUgrozenoLiceModal from './UrediUgrozenoLiceModal';
// Material UI Imports
import {
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Icons Imports
import { Add, FileDownload, FileUpload } from '@mui/icons-material';

// Export imports
import { mkConfig, generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';
import ExportDialog from '../../components/ExportDialog';

import { UgrozenoLiceT1, UgrozenoLiceFormData, UgrozenoLiceResponse } from './types';

interface Kategorija {
  kategorijaId: number;
  naziv: string;
  skracenica: string;
}

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function UgrozenaLicaPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [ugrozenaLica, setUgrozenaLica] = useState<UgrozenoLiceT1[]>([]);
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  

  // Simple import state
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [importResult, setImportResult] = useState<{
    processedRecords: number;
    totalRecords: number;
    processingTimeMs: number;
    filename: string;
  } | null>(null);


  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUgrozenoLice, setEditingUgrozenoLice] = useState<UgrozenoLiceT1 | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort configuration
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  
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
      const allIds = new Set(filteredData.map(row => row.ugrozenoLiceId).filter((id): id is number => Boolean(id)));
      setCustomSelectedIds(allIds);
    }
  };

  // Funkcija za refresh podataka
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUgrozenaLica(),
      fetchKategorije()
    ]);
    setRefreshing(false);
  };

  const fetchUgrozenaLica = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching ugrozena lica from backend...');
      
      // Učitaj sve podatke kroz više stranica da pokrijemo celu bazu
      let allUgrozenaLica: UgrozenoLiceT1[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      
      while (hasMoreData) {
        const params = new URLSearchParams();
        params.append('size', '1000'); // Maksimalna dozvoljena veličina stranice
        params.append('page', currentPage.toString());
        
        console.log(`📄 Fetching page ${currentPage + 1} (size: 1000)...`);
        const data = await apiService.getUgrozenaLica(params.toString(), token!);
        const pageData = data.content || data;
        
        console.log(`✅ Page ${currentPage + 1} received: ${Array.isArray(pageData) ? pageData.length : 0} records`);
        
        if (Array.isArray(pageData) && pageData.length > 0) {
          allUgrozenaLica = [...allUgrozenaLica, ...pageData];
          currentPage++;
          
          // Ako je broj rezultata manji od size, to je poslednja stranica
          if (pageData.length < 1000) {
            console.log(`🏁 Last page reached (${pageData.length} < 1000)`);
            hasMoreData = false;
          }
          } else {
          console.log('🛑 No more data available');
          hasMoreData = false;
        }
      }
      
      console.log(`✨ Total records loaded: ${allUgrozenaLica.length}`);
      setUgrozenaLica(allUgrozenaLica);
    } catch (err) {
      console.error('❌ Error fetching ugrozena lica:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Filter pretraga - koristi server-side pretragu kroz celu bazu
  const handleFilterSearch = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Proveri da li ima bilo koji filter
      const hasFilters = Object.values(filters).some(value => value && value.toString().trim() !== '');
      
      if (!hasFilters) {
        // Ako nema filtera, učitaj sve podatke iz baze
        await fetchUgrozenaLica(false);
            return;
      }
      
      // Pripremi filtere za server - pretražuje celu bazu, ne samo trenutnu stranicu
      const serverFilters: Record<string, unknown> = {};
      
      // Dodaj samo ne-prazne filtere - server će pretražiti celu bazu
      if (filters.redniBroj.trim()) serverFilters.redniBroj = filters.redniBroj.trim();
      if (filters.ime.trim()) serverFilters.ime = filters.ime.trim();
      if (filters.prezime.trim()) serverFilters.prezime = filters.prezime.trim();
      if (filters.jmbg.trim()) serverFilters.jmbg = filters.jmbg.trim();
      if (filters.gradOpstina.trim()) serverFilters.gradOpstina = filters.gradOpstina.trim();
      if (filters.mesto.trim()) serverFilters.mesto = filters.mesto.trim();
      if (filters.osnovSticanjaStatusa.trim()) serverFilters.osnovStatusa = filters.osnovSticanjaStatusa.trim(); // Backend očekuje 'osnovStatusa'
      if (filters.edBrojBrojMernogUredjaja.trim()) serverFilters.edBrojBrojMernogUredjaja = filters.edBrojBrojMernogUredjaja.trim();
      if (filters.datumTrajanjaPravaOd.trim()) serverFilters.datumTrajanjaPravaOd = filters.datumTrajanjaPravaOd.trim();
      if (filters.datumTrajanjaPravaDo.trim()) serverFilters.datumTrajanjaPravaDo = filters.datumTrajanjaPravaDo.trim();
      
      // Dodaj size parametar za pretragu cele baze
      serverFilters.size = 50000; // Backend max size
      serverFilters.page = 0;
      
      console.log('Sending filters to server for full database search:', serverFilters);
      
      // Koristi napredni filter endpoint za server-side pretragu kroz celu bazu
      const searchResults = await apiService.searchUgrozenoLiceByFilters(serverFilters, token);
      const ugrozenaLicaData = searchResults.content || searchResults;
      setUgrozenaLica(ugrozenaLicaData);
      
      console.log('Server returned:', ugrozenaLicaData.length, 'results from full database search');
    } catch (err) {
      console.error('Error in filter search:', err);
      setError(err instanceof Error ? err.message : 'Greška pri pretrazi');
    } finally {
      setLoading(false);
    }
  };

  const fetchKategorije = async () => {
    try {
      const data = await apiService.getKategorije('', token!);
      setKategorije(data);
    } catch (err) {
      console.error('Greška pri učitavanju kategorija:', err);
    }
  };

  // Load data when token is available - JEDNOM PRI UČITAVANJU STRANICE
  useEffect(() => {
    if (token) {
      fetchUgrozenaLica();
      fetchKategorije();
    }
  }, [token]); // Prazan dependency array - učitava se samo jednom

  // WebSocket za real-time updates
  useEffect(() => {
    if (!token) return;

    console.log('Subscribing to WebSocket updates for ugrozena lica...');
    
    // Subscribe na ugrozena lica updates
    webSocketService.subscribeToPredmetiUpdates((data) => {
      console.log('Ugrozena lica update received:', data);
      
      // Handle different types of updates
      if (data.type === 'ugrozeno_lice_updated' || data.type === 'ugrozeno_lice_created' || data.type === 'ugrozeno_lice_deleted') {
        console.log('Refreshing ugrozena lica data due to WebSocket update');
        fetchUgrozenaLica(false); // Don't show loading spinner for background updates
      }
    });

    // Subscribe na general messages
    webSocketService.subscribeToGeneralMessages((data) => {
      console.log('General message received:', data);
    });

    // Cleanup na unmount - ne zatvaramo konekciju jer je shared service
    return () => {
      console.log('Unsubscribing from WebSocket updates');
      webSocketService.unsubscribe('/topic/ugrozena-lica');
      webSocketService.unsubscribe('/topic/messages');
    };
  }, [token]);

  const handleModalSuccess = () => {
    fetchUgrozenaLica();
  };

  // Funkcija za dobijanje naziva kategorije po skraćenici
  const getKategorijaNaziv = (skracenica: string) => {
    const kategorija = kategorije.find(k => k.skracenica === skracenica);
    return kategorija ? `${kategorija.skracenica} - ${kategorija.naziv}` : skracenica;
  };

  // Funkcija za slanje poruka preko WebSocket-a
  const sendWebSocketMessage = (content: string, type: string = 'general') => {
    webSocketService.sendMessage(content, type);
  };

  // Funkcija za notifikaciju promene ugroženog lica
  const notifyUgrozenoLiceChange = (type: 'created' | 'updated' | 'deleted', ugrozenoLiceId: number) => {
    webSocketService.notifyPredmetChange(type, ugrozenoLiceId);
  };

  // Custom kebab menu functions
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    
    // Apply sorting to ugrozena lica
    const sortedUgrozenaLica = [...ugrozenaLica].sort((a, b) => {
      let aValue: any = a[field as keyof UgrozenoLiceT1];
      let bValue: any = b[field as keyof UgrozenoLiceT1];
      
      // Handle special cases
      if (field === 'datumIzdavanjaRacuna') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (field === 'datumTrajanjaPrava') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // For Serbian alphabet sorting
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    setUgrozenaLica(sortedUgrozenaLica);
  };

  const handleFilter = (_field: string) => {
    setShowFilters(true);
  };

  // Simple header renderer - no kebab menu
  const renderSimpleHeader = useCallback((title: string) => {
    return (
      <span className="font-semibold text-gray-900">{title}</span>
    );
  }, []);

  // Export functions
  const handleImport = async (file: File) => {
    try {
      setIsImporting(true);
      
      console.log('Sending Excel file to backend via /api/import/excel...');
      
      // Send original Excel file directly as MultipartFile
      const formData = new FormData();
      formData.append('file', file);
      formData.append('table', 'euk.ugrozeno_lice_t1');
      
      const response = await fetch('http://localhost:8080/api/import/excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Import failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Import response:', result);
      
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
        await fetchUgrozenaLica();
        
        // Show success popup with actual data
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        
        console.log(`✅ Import completed: ${result.processedRecords}/${result.totalRecords} records in ${result.processingTimeMs}ms`);
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      // Silent error handling - no alerts
    } finally {
      setIsImporting(false);
    }
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
      
      console.log('📤 Starting backend Excel export with template...');
      
      let url: string;
      let options: RequestInit;
      
      if (selectedIds && selectedIds.length > 0) {
        // Export filtered data
        url = `${process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'}/api/export/dynamic/filtered`;
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ids: selectedIds })
        };
        console.log(`📊 Exporting ${selectedIds.length} selected records...`);
    } else {
        // Export all data
        url = `${process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'}/api/export/dynamic`;
        options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        console.log('📊 Exporting all records...');
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ЕУК_Извештај.xlsx';
      
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
        : (ids.length < ugrozenaLica.length ? ids : undefined);
      
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
      field: 'brojClanovaDomacinstva', 
      headerName: 'број чланова', 
      width: 120,
      renderHeader: () => renderSimpleHeader('број чланова')
    },
    { 
      field: 'osnovSticanjaStatusa', 
      headerName: 'основ стицања', 
      width: 140,
      renderHeader: () => renderSimpleHeader('основ стицања'),
      renderCell: (params: GridRenderCellParams) => {
        const osnov = params.value;
        const kategorijaNaziv = getKategorijaNaziv(osnov);
        
        return (
          <div
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '0.7rem',
              fontWeight: '500',
              display: 'inline-block',
              minWidth: '60px',
              height: '24px',
              lineHeight: '16px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              verticalAlign: 'middle'
            }}
            title={kategorijaNaziv}
          >
            {osnov}
          </div>
        );
      }
    },
    { 
      field: 'edBrojBrojMernogUredjaja', 
      headerName: 'ед број', 
      width: 120,
      renderHeader: () => renderSimpleHeader('ед број')
    },
    { 
      field: 'potrosnjaIPovrsinaCombined', 
      headerName: 'потрошња и површина', 
      width: 200,
      renderHeader: () => renderSimpleHeader('потрошња и површина')
    },
    { 
      field: 'iznosUmanjenjaSaPdv', 
      headerName: 'износ умањења са пдв', 
      width: 180,
      renderHeader: () => renderSimpleHeader('износ умањења са пдв')
    },
    { 
      field: 'brojRacuna', 
      headerName: 'број рачуна', 
      width: 120,
      renderHeader: () => renderSimpleHeader('број рачуна')
    },
    { 
      field: 'datumIzdavanjaRacuna', 
      headerName: 'датум издавања рачуна', 
      width: 180,
      renderHeader: () => renderSimpleHeader('датум издавања рачуна'),
      renderCell: (params: GridRenderCellParams) => (
        params.value ? new Date(params.value).toLocaleDateString('sr-RS') : '-'
      )
    },
    {
      field: 'datumTrajanjaPrava',
      headerName: 'датум трајања права',
      width: 180,
      renderHeader: () => renderSimpleHeader('датум трајања права'),
      renderCell: (params: GridRenderCellParams) => (
        params.value ? new Date(params.value).toLocaleDateString('sr-RS') : '-'
      )
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
          {/* Edit icon */}
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
          
          {/* Delete icon */}
          <button
            onClick={async () => {
              if (confirm('Да ли сте сигурни да желите да обришете ово угрожено лице?')) {
                try {
                  await apiService.deleteUgrozenoLice(params.row.ugrozenoLiceId!, token!);
        fetchUgrozenaLica();
                } catch (err) {
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

  // Filter states
  const [filters, setFilters] = useState({
    redniBroj: '',
    ime: '',
    prezime: '',
    jmbg: '',
    gradOpstina: '',
    mesto: '',
    osnovSticanjaStatusa: '',
    edBrojBrojMernogUredjaja: '',  // 🆕 NOVO - ED broj
    datumTrajanjaPravaOd: '',  // 🆕 NOVO
    datumTrajanjaPravaDo: ''   // 🆕 NOVO
  });
  
  // Apply sorting to data (filtering is now done server-side)
  const filteredData = useMemo(() => {
    
    // Server-side filtering is now handled in handleFilterSearch
    // This useMemo only handles sorting
    const sorted = [...ugrozenaLica];

    // Apply sorting
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof UgrozenoLiceT1];
        const bValue = b[sortConfig.field as keyof UgrozenoLiceT1];
        
        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (!bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sorted;
  }, [ugrozenaLica, sortConfig]);

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
          checked={customSelectedIds.size > 0 && customSelectedIds.size === filteredData.length}
          ref={checkbox => {
            if (checkbox) checkbox.indeterminate = customSelectedIds.size > 0 && customSelectedIds.size < filteredData.length;
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
  ], [customSelectedIds, filteredData.length, toggleSelectAll, toggleRowSelection, columns]);
  
  // Pagination functions
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    const maxPage = Math.ceil(filteredData.length / pageSize) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const totalPages = Math.ceil(filteredData.length / pageSize);


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
                  alt="EUK Ugrožena lica" 
                  className="w-9 h-9"
                />
        </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ЕУК-Т1 Угрожена лица</h1>
                <p className="text-base text-gray-600">Управљање угроженим лицима за ЕУК-Т1 систем</p>
      </div>
        </div>
      </div>


          {error && (
            <ErrorHandler error={error} onRetry={fetchUgrozenaLica} />
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {/* Left side - Tab navigation */}
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

              {/* Right side - Action buttons (only show for table tab) */}
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
                            e.target.value = ''; // Reset input
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
        <>
              {/* Table Container with Horizontal Scroll */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Filters Section */}
                {showFilters && (
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Филтери и претрага</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Филтери претражују целу базу података. Сви подаци се учитавају аутоматски.
                        </p>
          </div>
                      
                      {/* Filter Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Redni broj */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Редни број</label>
                          <input
                            type="text"
                            placeholder="Претражи по редном броју..."
                            value={filters.redniBroj}
                            onChange={(e) => setFilters(prev => ({ ...prev, redniBroj: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
            />
          </div>

                        {/* Ime */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Име</label>
                          <input
                            type="text"
                            placeholder="Претражи по имену..."
                            value={filters.ime}
                            onChange={(e) => setFilters(prev => ({ ...prev, ime: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
            </div>

                        {/* Prezime */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Презиме</label>
                          <input
                            type="text"
                            placeholder="Претражи по презимену..."
                            value={filters.prezime}
                            onChange={(e) => setFilters(prev => ({ ...prev, prezime: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
          </div>

                        {/* JMBG */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                          <input
                            type="text"
                            placeholder="Претражи по ЈМБГ-у..."
                            value={filters.jmbg}
                            onChange={(e) => setFilters(prev => ({ ...prev, jmbg: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
            />
          </div>

                        {/* Grad/Opština */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Град/Општина</label>
                          <input
                            type="text"
                            placeholder="Претражи по граду/општини..."
                            value={filters.gradOpstina}
                            onChange={(e) => setFilters(prev => ({ ...prev, gradOpstina: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
                        </div>

                        {/* Mesto */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Место</label>
                          <input
                            type="text"
                            placeholder="Претражи по месту..."
                            value={filters.mesto}
                            onChange={(e) => setFilters(prev => ({ ...prev, mesto: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
            />
          </div>

                        {/* Osnov sticanja statusa */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Основ стицања статуса</label>
                          <select
                            value={filters.osnovSticanjaStatusa}
                            onChange={(e) => setFilters(prev => ({ ...prev, osnovSticanjaStatusa: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                          >
                            <option value="">Сви основи</option>
                            {kategorije.map(kat => (
                              <option key={kat.kategorijaId} value={kat.skracenica}>
                                {kat.skracenica} - {kat.naziv}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ED broj */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">ЕД број</label>
                          <input
                            type="text"
                            placeholder="Претражи по ЕД броју..."
                            value={filters.edBrojBrojMernogUredjaja}
                            onChange={(e) => setFilters(prev => ({ ...prev, edBrojBrojMernogUredjaja: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
                        </div>

                        {/* Datum trajanja prava - OD */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Датум трајања права - ОД</label>
                          <input
                            type="date"
                            value={filters.datumTrajanjaPravaOd}
                            onChange={(e) => setFilters(prev => ({ ...prev, datumTrajanjaPravaOd: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
            </div>

                        {/* Datum trajanja prava - DO */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Датум трајања права - ДО</label>
                          <input
                            type="date"
                            value={filters.datumTrajanjaPravaDo}
                            onChange={(e) => setFilters(prev => ({ ...prev, datumTrajanjaPravaDo: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                            min={filters.datumTrajanjaPravaOd || new Date().toISOString().split('T')[0]}
                          />
            </div>

                        {/* Action buttons */}
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
                                osnovSticanjaStatusa: '',
                                edBrojBrojMernogUredjaja: '',
                                datumTrajanjaPravaOd: '',
                                datumTrajanjaPravaDo: ''
                              })}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer text-sm"
                            >
                              Очисти
                            </button>
                            <button
                              onClick={handleFilterSearch}
                              className="flex-1 px-3 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-medium cursor-pointer text-sm"
                              title="Претражи целу базу података"
                            >
                              Претражи базу ({filteredData.length})
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
                    rows={filteredData}
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
                        '& .MuiDataGrid-menuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-columnMenuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButtonContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIconContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButton': {
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
                                Укупно: <span className="font-semibold text-gray-800">{ugrozenaLica.length}</span> угрожених лица
                              </span>
                              {filteredData.length !== ugrozenaLica.length && (
                                <span className="text-sm text-gray-600">
                                  Филтрирано: <span className="font-semibold text-gray-800">{filteredData.length}</span>
                                </span>
                              )}
                              {customSelectedIds.size > 0 && (
                                <span className="text-sm text-blue-600">
                                  Означено: <span className="font-semibold text-blue-800">{customSelectedIds.size}</span> за извоз
                                </span>
                              )}
                              {Object.values(filters).some(value => value && value.toString().trim() !== '') && (
                                <span className="text-sm text-blue-600">
                                  Активни филтери (цела база): <span className="font-semibold">{Object.values(filters).filter(v => v && v.toString().trim() !== '').length}</span>
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

                            <div className="flex items-center gap-4">
                              {/* Pagination Info */}
                               <div className="flex items-center gap-3 text-sm text-gray-600">
                                 <span>Прикажи:</span>
                                 <select 
                                   value={pageSize}
                                   className="px-2 py-1 border border-gray-300 rounded text-xs bg-white cursor-pointer"
                                   onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                 >
                                   <option value={10}>10</option>
                                   <option value={20}>20</option>
                                   <option value={30}>30</option>
                                 </select>
                                 <span>по страници</span>
                               </div>
                              
                              {/* Page Navigation */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 0}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                
                                <div className="flex items-center gap-1 text-xs">
                                  <span>Страница</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    defaultValue={currentPage + 1}
                                    key={currentPage}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const page = parseInt((e.target as HTMLInputElement).value);
                                        if (page >= 1 && page <= totalPages) {
                                          setCurrentPage(page - 1);
                                        } else {
                                          (e.target as HTMLInputElement).value = (currentPage + 1).toString();
                                        }
                                      }
                                    }}
                                    className="w-12 px-2 py-1 text-center border border-gray-300 rounded bg-white cursor-text"
                                  />
                                  <span>од {totalPages}</span>
                                </div>
                                
                                <button
                                  onClick={goToNextPage}
                                  disabled={currentPage >= totalPages - 1}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
            </div>
            </div>
                        </div>
                      )
                    }}
                  />
                </Paper>
          </div>
        </>
      ) : (
        <UgrozenaLicaStatistika ugrozenaLica={ugrozenaLica} />
      )}

          {/* New UgrozenoLice Modal */}
          <NovoUgrozenoLiceModal
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
              .filter(col => col.field !== 'actions' && col.field !== 'datumTrajanjaPrava') // Uklanjamo actions i datumTrajanjaPrava kolone iz izvoza, datumIzdavanjaRacuna ostaje
              .map(col => ({ accessorKey: col.field, header: col.headerName || col.field }))}
            data={filteredData as unknown as Record<string, unknown>[]}
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
    </div>
    </div>
    </>
  );
} 
