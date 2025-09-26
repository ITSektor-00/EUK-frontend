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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  const handleImport = async (file: File) => {
    try {
      setLoading(true);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const importData: any[] = [];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      for (let row = 1; row <= range.e.r; row++) {
        const rowData: any = {};
        const columns = ['redniBroj', 'ime', 'prezime', 'jmbg', 'pttBroj', 'gradOpstina', 'mesto', 'ulicaIBroj', 'edBroj', 'pokVazenjaResenjaOStatusu'];
        
        let hasData = false;
        for (let col = 0; col < 10; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
            hasData = true;
            rowData[columns[col]] = cell.v;
          }
        }
        
        if (hasData && (rowData.redniBroj || rowData.ime || rowData.prezime || rowData.jmbg)) {
          importData.push(rowData);
        }
      }
      
      if (importData.length === 0) {
        alert('Nema podataka za import!');
        return;
      }

      await apiService.createUgrozenoLiceT2Batch(importData, token!);
      alert(`Uspešno importovano ${importData.length} zapisa!`);
      await fetchUgrozenaLicaT2();
      
    } catch (error) {
      console.error('Import error:', error);
      alert('Greška pri importu fajla!');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (selectedColumns: string[], format: string, data: Record<string, unknown>[]) => {
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
          // Load Excel template for T2
          const templateResponse = await fetch('/excelTemplate/ЕУК-T2.xlsx');
          const templateBuffer = await templateResponse.arrayBuffer();
          
          const templateWorkbook = XLSX.read(templateBuffer, { 
            type: 'array',
            cellStyles: true,
            cellNF: true,
            cellHTML: false
          });
          
          const templateSheetName = templateWorkbook.SheetNames[0];
          const templateWorksheet = templateWorkbook.Sheets[templateSheetName];
          
          // Prepare data for T2 template - columns: A-J (10 columns)
          const dataToAdd = ugrozenaLicaT2.map(item => [
            item.ugrozenoLiceId || '',           // A: ID
            item.redniBroj || '',                // B: Redni broj
            item.ime || '',                      // C: Ime
            item.prezime || '',                  // D: Prezime
            item.jmbg || '',                     // E: JMBG
            item.pttBroj || '',                  // F: PTT broj
            item.gradOpstina || '',              // G: Grad/Opština
            item.mesto || '',                    // H: Mesto
            item.ulicaIBroj || '',               // I: Ulica i broj
            item.edBroj || '',                   // J: ED broj
            item.pokVazenjaResenjaOStatusu || '' // K: Pokriće važenja rešenja
          ]);
          
          // Insert data starting from row 9 (A9)
          const startRow = 9;
          for (let i = 0; i < dataToAdd.length; i++) {
            const rowData = dataToAdd[i];
            const rowNum = startRow + i;
            
            for (let j = 0; j < rowData.length; j++) {
              const cellAddress = XLSX.utils.encode_cell({ r: rowNum - 1, c: j });
              templateWorksheet[cellAddress] = { v: rowData[j] };
            }
          }
          
          // Update range
          const range = XLSX.utils.decode_range(templateWorksheet['!ref'] || 'A1');
          range.e.r = Math.max(range.e.r, startRow + dataToAdd.length - 1);
          templateWorksheet['!ref'] = XLSX.utils.encode_range(range);
          
          // Generate filename
          const filename = `ЕУК-Т2-Угрожена-лица-${new Date().toISOString().split('T')[0]}.xlsx`;
          
          XLSX.writeFile(templateWorkbook, filename);
        } catch (error) {
          console.error('Error with Excel template export:', error);
          // Fallback to simple Excel export
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(filteredData);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Ugrozena Lica T2');
          XLSX.writeFile(workbook, 'ugrozena-lica-t2.xlsx');
        }
        break;
      case 'pdf':
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        pdf.setFontSize(16);
        pdf.text('ЕУК-Т2 Угрожена лица', 14, 20);
        
        const tableData = filteredData.map(item => 
          selectedColumns.map(col => item[col] || '')
        );
        
        autoTable(pdf, {
          head: [selectedColumns.map(col => {
            const headerMap: Record<string, string> = {
              'ugrozenoLiceId': 'ID',
              'redniBroj': 'Redni broj',
              'ime': 'Ime',
              'prezime': 'Prezime',
              'jmbg': 'JMBG',
              'pttBroj': 'PTT broj',
              'gradOpstina': 'Grad/Opština',
              'mesto': 'Mesto',
              'ulicaIBroj': 'Ulica i broj',
              'edBroj': 'ED broj',
              'pokVazenjaResenjaOStatusu': 'Pokriće važenja rešenja'
            };
            return headerMap[col] || col;
          })],
          body: tableData,
          startY: 30,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        
        pdf.save('ugrozena-lica-t2.pdf');
        break;
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
                  
                  <button
                    onClick={() => setExportDialogOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                  >
                    <FileDownload className="w-4 h-4" />
                    Извоз
                  </button>
                  
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
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  
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
                  columns={columns}
                  getRowId={(row) => row.ugrozenoLiceId || Math.random()}
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
            onExport={handleExport}
          />
        </div>
      </div>
    </>
  );
}
