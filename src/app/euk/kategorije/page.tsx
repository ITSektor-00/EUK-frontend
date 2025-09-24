"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import { PermissionGuard } from '@/components/PermissionGuard';
import { webSocketService } from '../../../services/websocketService';

import NovoKategorijaModal from './NovoKategorijaModal';
import KategorijaStatistika from './KategorijaStatistika';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportDialog from '../../components/ExportDialog';

import { KategorijaT1, KategorijaFormData, KategorijaResponse } from './types';

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function KategorijePage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [kategorije, setKategorije] = useState<KategorijaT1[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingKategorija, setEditingKategorija] = useState<KategorijaT1 | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sort configuration
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'tabela' | 'statistika'>('tabela');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Funkcija za refresh podataka
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKategorije();
    setRefreshing(false);
  };

  const fetchKategorije = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('Fetching all kategorije from database...');

      // Učitaj sve podatke kroz više stranica da pokrijemo celu bazu
      let allKategorije: KategorijaT1[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const params = new URLSearchParams();
        params.append('size', '1000'); // Maksimalna dozvoljena veličina stranice
        params.append('page', currentPage.toString());

        console.log(`Fetching page ${currentPage}...`);
        const data = await apiService.getKategorije(params.toString(), token!);
        const pageData = data.content || data;

        if (Array.isArray(pageData) && pageData.length > 0) {
          allKategorije = [...allKategorije, ...pageData];
          currentPage++;

          // Ako je broj rezultata manji od size, to je poslednja stranica
          if (pageData.length < 1000) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }

      console.log(`Fetched ${allKategorije.length} total records from ${currentPage} pages`);
      setKategorije(allKategorije);
    } catch (err) {
      console.error('Error fetching kategorije:', err);
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
        await fetchKategorije(false);
        return;
      }

      // Pripremi filtere za server - pretražuje celu bazu, ne samo trenutnu stranicu
      const serverFilters: Record<string, unknown> = {};

      // Dodaj samo ne-prazne filtere - server će pretražiti celu bazu
      if (filters.naziv.trim()) serverFilters.naziv = filters.naziv.trim();

      console.log('Sending filters to server for full database search:', serverFilters);

      // Koristi napredni filter endpoint za server-side pretragu kroz celu bazu
      const searchResults = await apiService.searchKategorijeByFilters(serverFilters, token);
      const kategorijeData = searchResults.content || searchResults;
      setKategorije(kategorijeData);

      console.log('Server returned:', kategorijeData.length, 'results from full database search');
    } catch (err) {
      console.error('Error in filter search:', err);
      setError(err instanceof Error ? err.message : 'Greška pri pretrazi');
    } finally {
      setLoading(false);
    }
  };

  // Load data when token is available - JEDNOM PRI UČITAVANJU STRANICE
  useEffect(() => {
    if (token) {
      fetchKategorije();
    }
  }, [token]); // Prazan dependency array - učitava se samo jednom

  // WebSocket za real-time updates
  useEffect(() => {
    if (!token) return;

    console.log('Subscribing to WebSocket updates for kategorije...');

    // Subscribe na kategorije updates
    webSocketService.subscribeToKategorijeUpdates((data) => {
      console.log('Kategorije update received:', data);

      // Handle different types of updates
      if (data.type === 'kategorija_updated' || data.type === 'kategorija_created' || data.type === 'kategorija_deleted') {
        console.log('Refreshing kategorije data due to WebSocket update');
        fetchKategorije(false); // Don't show loading spinner for background updates
      }
    });

    // Subscribe na general messages
    webSocketService.subscribeToGeneralMessages((data) => {
      console.log('General message received:', data);
    });

    // Cleanup na unmount - ne zatvaramo konekciju jer je shared service
    return () => {
      console.log('Unsubscribing from WebSocket updates');
      webSocketService.unsubscribe('/topic/kategorije');
      webSocketService.unsubscribe('/topic/messages');
    };
  }, [token]);

  const handleModalSuccess = () => {
    fetchKategorije();
  };

  // Funkcija za slanje poruka preko WebSocket-a
  const sendWebSocketMessage = (content: string, type: string = 'general') => {
    webSocketService.sendMessage(content, type);
  };

  // Funkcija za notifikaciju promene kategorije
  const notifyKategorijaChange = (type: 'created' | 'updated' | 'deleted', kategorijaId: number) => {
    webSocketService.notifyKategorijaChange(type, kategorijaId);
  };

  // Custom kebab menu functions
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });

    // Apply sorting to kategorije
    const sortedKategorije = [...kategorije].sort((a, b) => {
      let aValue: any = a[field as keyof KategorijaT1];
      let bValue: any = b[field as keyof KategorijaT1];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
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

    setKategorije(sortedKategorije);
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
      setLoading(true);

      // Read Excel file using XLSX (JavaScript equivalent of openpyxl)
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        type: 'array',
        cellStyles: true,
        cellNF: true,
        cellHTML: false
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      console.log('Import file loaded successfully');

      // Get the range to find data
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      console.log('Import range:', worksheet['!ref']);

      // Extract data using openpyxl-style approach
      const importData: any[] = [];
      const columns = [
        'kategorijaId', 'naziv'
      ];

      // Iterate through all rows (openpyxl style)
      for (let row = 1; row <= range.e.r + 1; row++) {
        const rowData: any = {};
        let hasData = false;

        // Check if this row has any data (openpyxl style check)
        for (let col = 0; col < columns.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
          const cell = worksheet[cellAddress];
          if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
            hasData = true;
            break;
          }
        }

        // Skip empty rows (openpyxl style)
        if (!hasData) {
          continue;
        }

        // Check for footer patterns (signature, potpis, etc.)
        const cellA = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 0 })];
        if (cellA && cellA.v && typeof cellA.v === 'string') {
          const cellValue = cellA.v.toString().toLowerCase();
          if (cellValue.includes('potpis') || cellValue.includes('signature') ||
              cellValue.includes('м.п.') || cellValue.includes('заменик') ||
              cellValue.includes('секретар') || cellValue.includes('градска управа')) {
            console.log(`Stopping at row ${row} - footer pattern detected: ${cellValue}`);
            break;
          }
        }

        // Extract data from A-B columns (2 columns) - openpyxl style
        for (let col = 0; col < columns.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
          const cell = worksheet[cellAddress];
          const value = cell ? cell.v : null;

          if (value !== null && value !== undefined && value !== '') {
            rowData[columns[col]] = value;
          }
        }

        // Only add if we have essential data
        if (rowData.naziv) {
          importData.push(rowData);
        }
      }

      console.log(`Extracted ${importData.length} records for import`);
      console.log('Sample import data:', importData[0]);
      console.log('All import data:', importData);

      if (importData.length === 0) {
        alert('Nema podataka za import! Proverite da li je Excel fajl u ispravnom formatu.');
        return;
      }

      // Import data to backend using batch processing
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Batch configuration
      const BATCH_SIZE = 100; // Process 100 items at a time
      const BATCH_DELAY = 200; // 200ms delay between batches

      console.log(`Starting batch import of ${importData.length} items with batch size ${BATCH_SIZE}`);

      // Show initial progress
      console.log(`Početak importa: ${importData.length} zapisa u ${Math.ceil(importData.length / BATCH_SIZE)} batch-ova\nProcijenjeno vreme: ~${Math.round(Math.ceil(importData.length / BATCH_SIZE) * 0.2)} minuta`);

      // Process data in batches
      console.log(`Processing ${importData.length} items in batches of ${BATCH_SIZE}`);
      for (let i = 0; i < importData.length; i += BATCH_SIZE) {
        const batch = importData.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(importData.length / BATCH_SIZE);

        console.log(`Processing batch ${batchNumber}/${totalBatches} with ${batch.length} items`);

        try {
          // Prepare batch data
          const batchData = batch.map(item => {
            // Validate essential data
            if (!item.naziv) {
              throw new Error('Nedostaje naziv kategorije');
            }

            return {
              naziv: (item.naziv || '').toString()
            };
          });

          // Try batch API
          try {
            const response = await apiService.createKategorijaBatch(batchData, token!);
            console.log(`Batch API response:`, response);

            if (response && response.totalProcessed) {
              successCount += response.totalProcessed;
              console.log(`✅ Batch ${batchNumber}/${totalBatches}: ${response.totalProcessed} records processed via batch API`);
            } else {
              throw new Error('Batch API returned empty response');
            }
          } catch (batchError) {
            console.log(`Batch API failed, falling back to individual requests for batch ${batchNumber}`);

            // Fallback to individual requests
            let batchSuccessCount = 0;
            for (const item of batchData) {
              try {
                const response = await apiService.createKategorija(item, token!);
                if (response) {
                  batchSuccessCount++;
                }
              } catch (itemError) {
                console.error(`Individual item failed:`, itemError);
                // Continue with next item instead of stopping
              }
            }

            successCount += batchSuccessCount;
            console.log(`✅ Batch ${batchNumber}/${totalBatches}: ${batchSuccessCount}/${batchData.length} records processed via fallback`);
          }

        } catch (error) {
          errorCount += batch.length;
          const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
          errors.push(`Batch ${batchNumber}: ${errorMessage}`);
          console.error(`❌ Batch ${batchNumber}/${totalBatches} failed:`, error);

          // If too many errors, stop importing
          if (errorCount >= 1000) {
            console.error('Too many errors, stopping import');
            break;
          }
        }

        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < importData.length) {
          console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      // Show results
      if (errorCount === 0) {
        alert(`Uspešno je importovano ${successCount} zapisa!`);
      } else {
        alert(`Import završen!\nUspešno: ${successCount}\nGreške: ${errorCount}\n\nPrve greške:\n${errors.slice(0, 5).join('\n')}`);
      }

      // Refresh data
      await fetchKategorije();

    } catch (error) {
      console.error('Import error:', error);
      alert('Greška pri importu fajla! Proverite da li je fajl u ispravnom Excel formatu.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (selectedColumns: string[], format: string, data: Record<string, unknown>[]) => {
    // Filter data to only include selected columns
    const filteredData = data.map(item => {
      const filteredItem: Record<string, unknown> = {};
      selectedColumns.forEach(col => {
        filteredItem[col] = item[col];
      });
      return filteredItem;
    });

    switch (format) {
      case 'csv':
        const csv = generateCsv(csvConfig)(filteredData as Record<string, string | number>[]);
        download(csvConfig)(csv);
        break;
      case 'excel':
        try {
          console.log('Starting Excel export...');

          // Create a new workbook
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(filteredData);
          
          // Set column widths
          const columnWidths = selectedColumns.map(col => ({ wch: Math.max(col.length, 15) }));
          worksheet['!cols'] = columnWidths;
          
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Kategorije');
          
          // Generate filename
          let filename = 'ЕУК-Категорије';
          filename += '.xlsx';

          XLSX.writeFile(workbook, filename);
          console.log(`Excel file saved: ${filename} with ${filteredData.length} rows`);

        } catch (error) {
          console.error('Error with Excel export:', error);
        }
        break;
      case 'pdf':
        // Create PDF with Unicode support
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        // Add title
        pdf.setFontSize(16);
        pdf.text('ЕУК-Категорије', 14, 20);

        // Prepare table data
        const tableData = filteredData.map(item =>
          selectedColumns.map(col => item[col] || '')
        );

        // Add table
        autoTable(pdf, {
          head: [selectedColumns.map(col => {
            // Map ćirilične nazive na latinične za PDF kompatibilnost
            const headerMap: Record<string, string> = {
              'kategorijaId': 'ID',
              'naziv': 'Назив',
            };
            return headerMap[col] || col;
          })],
          body: tableData,
          startY: 30,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        // Generate filename
        const pdfFilename = 'ЕУК-Категорије.pdf';
        pdf.save(pdfFilename);
        break;
      default:
        console.log('Unknown format:', format);
    }
  };

  const columns: GridColDef[] = useMemo(() => ([
    {
      field: 'kategorijaId',
      headerName: 'ID',
      width: 100,
      renderHeader: () => renderSimpleHeader('ID')
    },
    {
      field: 'naziv',
      headerName: 'назив',
      width: 300,
      renderHeader: () => renderSimpleHeader('назив')
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
              setEditingKategorija(params.row);
              setShowModal(true);
            }}
            className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Уреди категорију"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete icon */}
          <button
            onClick={async () => {
              if (confirm('Да ли сте сигурни да желите да обришете ову категорију?')) {
                try {
                  await apiService.deleteKategorija(params.row.kategorijaId!, token!);
                  fetchKategorije();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Greška pri brisanju');
                }
              }
            }}
            className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Обриши категорију"
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
    naziv: ''
  });

  // Apply sorting to data (filtering is now done server-side)
  const filteredData = useMemo(() => {
    console.log('Applying sorting to data. Total kategorije:', kategorije.length);

    // Server-side filtering is now handled in handleFilterSearch
    // This useMemo only handles sorting
    const sorted = [...kategorije];

    // Apply sorting
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof KategorijaT1];
        const bValue = b[sortConfig.field as keyof KategorijaT1];

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

    console.log('Sorted data length:', sorted.length);
    return sorted;
  }, [kategorije, sortConfig]);

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

  // Debug logging
  useEffect(() => {
    console.log('DataGrid debug:', {
      kategorijeLength: kategorije.length,
      filteredDataLength: filteredData.length,
      columnsLength: columns.length,
      loading,
      error,
      kategorijeSample: kategorije.slice(0, 3).map(u => ({ id: u.kategorijaId, naziv: u.naziv })),
      filteredDataSample: filteredData.slice(0, 3).map(u => ({ id: u.kategorijaId, naziv: u.naziv }))
    });
  }, [kategorije.length, filteredData.length, columns.length, loading, error, kategorije, filteredData]);

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
                  src="/ikoniceSidebar/beleIkonice/categoryBelo.png"
                  alt="EUK Kategorije"
                  className="w-9 h-9"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ЕУК Категорије</h1>
                <p className="text-base text-gray-600">Управљање категоријама за ЕУК систем</p>
              </div>
            </div>
          </div>

          {error && (
            <ErrorHandler error={error} onRetry={fetchKategorije} />
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
                  <PermissionGuard routeName="/euk/kategorije" requiredPermission="write" userId={user?.id || undefined}>
                    <button
                      onClick={() => {
                        setEditingKategorija(null);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                    >
                      <Add className="w-4 h-4" />
                      Додај нову категорију
                    </button>
                  </PermissionGuard>
                  <PermissionGuard routeName="/euk/kategorije" requiredPermission="read" userId={user?.id || undefined}>
                    <button
                      onClick={() => setExportDialogOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                    >
                      <FileDownload className="w-4 h-4" />
                      Извоз
                    </button>
                  </PermissionGuard>
                  <PermissionGuard routeName="/euk/kategorije" requiredPermission="write" userId={user?.id || undefined}>
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 text-sm font-medium cursor-pointer">
                      <FileUpload className="w-4 h-4" />
                      Увоз
                      <input
                        type="file"
                        accept=".xlsx,.xls"
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
                        {/* Naziv */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Назив</label>
                          <input
                            type="text"
                            placeholder="Претражи по називу..."
                            value={filters.naziv}
                            onChange={(e) => setFilters(prev => ({ ...prev, naziv: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Акције</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFilters({
                                naziv: ''
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
                    columns={columns}
                    getRowId={(row) => row.kategorijaId || Math.random()}
                    paginationModel={{ page: currentPage, pageSize: pageSize }}
                    onPaginationModelChange={(model) => {
                      setCurrentPage(model.page);
                      setPageSize(model.pageSize);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    checkboxSelection
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
                                Укупно: <span className="font-semibold text-gray-800">{kategorije.length}</span> категорија
                              </span>
                              {filteredData.length !== kategorije.length && (
                                <span className="text-sm text-gray-600">
                                  Филтрирано: <span className="font-semibold text-gray-800">{filteredData.length}</span>
                                </span>
                              )}
                              {Object.values(filters).some(value => value !== undefined && value !== null && value.toString().trim() !== '') && (
                                <span className="text-sm text-blue-600">
                                  Активни филтери (цела база): <span className="font-semibold">{Object.values(filters).filter(v => v !== undefined && v !== null && v.toString().trim() !== '').length}</span>
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
                                  <option value={25}>25</option>
                                  <option value={50}>50</option>
                                  <option value={100}>100</option>
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
                                <span className="px-3 py-1 text-xs bg-white border border-gray-300 rounded">
                                  Страница {currentPage + 1} од {totalPages}
                                </span>
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
            <KategorijaStatistika kategorije={kategorije} />
          )}

          {/* New Kategorija Modal */}
          <NovoKategorijaModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingKategorija(null);
            }}
            onSuccess={handleModalSuccess}
            editingKategorija={editingKategorija}
            token={token!}
          />

          <ExportDialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            columns={columns
              .filter(col => col.field !== 'actions') // Uklanjamo actions kolonu iz izvoza
              .map(col => ({ accessorKey: col.field, header: col.headerName || col.field }))}
            data={filteredData as unknown as Record<string, unknown>[]}
            onExport={handleExport}
          />
        </div>
      </div>
    </>
  );
}