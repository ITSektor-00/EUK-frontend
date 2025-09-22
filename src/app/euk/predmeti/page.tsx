"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import { PermissionGuard } from '@/components/PermissionGuard';
import { webSocketService } from '../../../services/websocketService';

import NoviPredmetModal from './NoviPredmetModal';
import PredmetiStatistika from './PredmetiStatistika';
import PredmetDetaljiModal from './PredmetDetaljiModal';
// Material UI Imports
import {
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Icons Imports
import { Add, FileDownload } from '@mui/icons-material';

// Export imports
import { mkConfig, generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportDialog from '../../components/ExportDialog';

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  rokZaZavrsetak: string;
  kategorijaId: number;
  kategorijaNaziv?: string;
  brojUgrozenihLica?: number;
  datumKreiranja?: string;
  kategorija?: {
    kategorijaId: number;
    naziv: string;
  };
}

interface Kategorija {
  kategorijaId: number;
  naziv: string;
}

const statusOptions = ['активан', 'затворен', 'на_чекању', 'у_обради'];
const prioritetOptions = ['низак', 'средњи', 'висок', 'критичан'];


const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function PredmetiPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPredmet, setEditingPredmet] = useState<Predmet | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetaljiModal, setShowDetaljiModal] = useState(false);
  const [selectedPredmet, setSelectedPredmet] = useState<Predmet | null>(null);
  
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
    await Promise.all([
      fetchPredmeti(),
      fetchKategorije()
    ]);
    setRefreshing(false);
  };




  const fetchPredmeti = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching predmeti...');
      const params = new URLSearchParams();
      // Dodajemo parametre za veliku stranicu da dobijemo sve predmete
      params.append('size', '1000'); // Velika veličina stranice
      params.append('page', '0');    // Prva stranica
      const data = await apiService.getPredmeti(params.toString(), token!);
      console.log('Received data:', data);
      const predmetiData = data.content || data;
      console.log('Setting predmeti:', predmetiData);
      setPredmeti(predmetiData);
    } catch (err) {
      console.error('Error fetching predmeti:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchKategorije = async () => {
    try {
      const data = await apiService.getKategorije(token!);
      setKategorije(data);
    } catch (err) {
      console.error('Greška pri učitavanju kategorija:', err);
    }
  };

  // Load data when token is available - JEDNOM PRI UČITAVANJU STRANICE
  useEffect(() => {
    if (token) {
      fetchPredmeti();
      fetchKategorije();
    }
  }, [token]); // Prazan dependency array - učitava se samo jednom

  // WebSocket za real-time updates
  useEffect(() => {
    if (!token) return;

    console.log('Subscribing to WebSocket updates for predmeti...');
    
    // Subscribe na predmete updates
    webSocketService.subscribeToPredmetiUpdates((data) => {
      console.log('Predmeti update received:', data);
      
      // Handle different types of updates
      if (data.type === 'predmet_updated' || data.type === 'predmet_created' || data.type === 'predmet_deleted') {
        console.log('Refreshing predmeti data due to WebSocket update');
        fetchPredmeti(false); // Don't show loading spinner for background updates
      }
    });

    // Subscribe na general messages
    webSocketService.subscribeToGeneralMessages((data) => {
      console.log('General message received:', data);
    });

    // Cleanup na unmount - ne zatvaramo konekciju jer je shared service
    return () => {
      console.log('Unsubscribing from WebSocket updates');
      webSocketService.unsubscribe('/topic/predmeti');
      webSocketService.unsubscribe('/topic/messages');
    };
  }, [token]);

  const handleModalSuccess = () => {
    fetchPredmeti();
  };

  // Funkcija za slanje poruka preko WebSocket-a
  const sendWebSocketMessage = (content: string, type: string = 'general') => {
    webSocketService.sendMessage(content, type);
  };

  // Funkcija za notifikaciju promene predmeta
  const notifyPredmetChange = (type: 'created' | 'updated' | 'deleted', predmetId: number) => {
    webSocketService.notifyPredmetChange(type, predmetId);
  };

  // Custom kebab menu functions
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
    
    // Apply sorting to predmeti
    const sortedPredmeti = [...predmeti].sort((a, b) => {
      let aValue: any = a[field as keyof Predmet];
      let bValue: any = b[field as keyof Predmet];
      
      // Handle special cases
      if (field === 'kategorijaId') {
        aValue = getKategorijaNaziv(a.kategorijaId);
        bValue = getKategorijaNaziv(b.kategorijaId);
      } else if (field === 'rokZaZavrsetak' || field === 'datumKreiranja') {
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
    
    setPredmeti(sortedPredmeti);
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





  // const handleDelete = async (id: number) => {
  //   if (!confirm('Да ли сте сигурни да желите да обришете овај предмет?')) {
  //     return;
  //   }

  //   try {
  //     await apiService.deletePredmet(id, token!);
  //     fetchPredmeti();
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Greška pri brisanju');
  //     }
  // };

  // const handleViewPredmet = (predmet: Predmet) => {
  //   console.log('Viewing predmet:', predmet);
  //   setSelectedPredmet(predmet);
  //   setShowDetaljiModal(true);
  // };



  const getKategorijaNaziv = (kategorijaId: number) => {
    const kategorija = kategorije.find(k => k.kategorijaId === kategorijaId);
    return kategorija?.naziv || 'Непознато';
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'активан': return 'success';
  //     case 'затворен': return 'default';
  //     case 'на_чекању': return 'warning';
  //     case 'у_обради': return 'info';
  //     default: return 'default';
  //   }
  // };

  // const getPrioritetColor = (prioritet: string) => {
  //   switch (prioritet) {
  //     case 'критичан': return 'error';
  //     case 'висок': return 'warning';
  //     case 'средњи': return 'info';
  //     case 'низак': return 'success';
  //     default: return 'default';
  //   }
  // };

  // Export functions
  const handleExport = (selectedColumns: string[], format: string, data: Record<string, unknown>[]) => {
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
        // Create Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        
        // Set column widths
        const columnWidths = selectedColumns.map(col => ({ wch: Math.max(col.length, 15) }));
        worksheet['!cols'] = columnWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Predmeti');
        XLSX.writeFile(workbook, 'predmeti.xlsx');
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
        pdf.text('Predmeti', 14, 20);
        
        // Prepare table data
        const tableData = filteredData.map(item => 
          selectedColumns.map(col => item[col] || '')
        );
        
        // Add table
        autoTable(pdf, {
          head: [selectedColumns.map(col => {
            // Map ćirilične nazive na latinične za PDF kompatibilnost
            const headerMap: Record<string, string> = {
              'predmetId': 'ID',
              'nazivPredmeta': 'Naziv predmeta',
              'status': 'Status',
              'prioritet': 'Prioritet',
              'odgovornaOsoba': 'Odgovorna osoba',
              'rokZaZavrsetak': 'Rok za zavrsetak',
              'kategorijaId': 'Kategorija'
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
        
        pdf.save('predmeti.pdf');
        break;
      default:
        console.log('Unknown format:', format);
    }
  };

  const columns: GridColDef[] = useMemo(() => ([
    { 
      field: 'nazivPredmeta', 
      headerName: 'назив предмета', 
      width: 280,
      flex: 1,
      renderHeader: () => renderSimpleHeader('назив предмета')
    },
    { 
      field: 'status', 
      headerName: 'статус', 
      width: 140,
      renderHeader: () => renderSimpleHeader('статус'),
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value;
        let bgColor = '#f3f4f6';
        let textColor = '#374151';
        let borderColor = '#d1d5db';
        let displayText = status;
        
        switch (status) {
          case 'активан':
            bgColor = '#ecfdf5';
            textColor = '#065f46';
            borderColor = '#10b981';
            displayText = 'активан';
            break;
          case 'затворен':
            bgColor = '#f8fafc';
            textColor = '#475569';
            borderColor = '#64748b';
            displayText = 'затворен';
            break;
          case 'на_чекању':
            bgColor = '#fffbeb';
            textColor = '#92400e';
            borderColor = '#f59e0b';
            displayText = 'на чекању';
            break;
          case 'у_обради':
            bgColor = '#eff6ff';
            textColor = '#1e40af';
            borderColor = '#3b82f6';
            displayText = 'у обради';
            break;
        }
        
        return (
          <div
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
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
          >
            {displayText}
          </div>
        );
      }
    },
    { 
      field: 'prioritet', 
      headerName: 'приоритет', 
      width: 140,
      renderHeader: () => renderSimpleHeader('приоритет'),
      renderCell: (params: GridRenderCellParams) => {
        const prioritet = params.value;
        let bgColor = '#f3f4f6';
        let textColor = '#374151';
        let borderColor = '#d1d5db';
        let displayText = prioritet;
        
        switch (prioritet) {
          case 'низак':
            bgColor = '#ecfdf5';
            textColor = '#065f46';
            borderColor = '#10b981';
            displayText = 'низак';
            break;
          case 'средњи':
            bgColor = '#eff6ff';
            textColor = '#1e40af';
            borderColor = '#3b82f6';
            displayText = 'средњи';
            break;
          case 'висок':
            bgColor = '#fff7ed';
            textColor = '#c2410c';
            borderColor = '#f97316';
            displayText = 'висок';
            break;
          case 'критичан':
            bgColor = '#fef2f2';
            textColor = '#991b1b';
            borderColor = '#ef4444';
            displayText = 'критичан';
            break;
        }
        
        return (
          <div
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
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
          >
            {displayText}
          </div>
        );
      }
    },
    { 
      field: 'odgovornaOsoba', 
      headerName: 'одговорна особа', 
      width: 200,
      renderHeader: () => renderSimpleHeader('одговорна особа')
    },
    { 
      field: 'rokZaZavrsetak', 
      headerName: 'рок за завршетак', 
      width: 180,
      renderHeader: () => renderSimpleHeader('рок за завршетак'),
      renderCell: (params: GridRenderCellParams) => (
        params.value ? new Date(params.value).toLocaleDateString('sr-RS') : '-'
      )
    },
                                                                       { 
         field: 'kategorijaId', 
         headerName: 'категорија', 
         width: 200,
         renderHeader: () => renderSimpleHeader('категорија'),
       renderCell: (params: GridRenderCellParams) => (
         getKategorijaNaziv(params.value)
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
                  {/* Eye icon - centered */}
                  <button
                    onClick={() => router.push(`/euk/predmeti/${params.row.predmetId}`)}
                    className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 cursor-pointer"
                    title="Погледај детаље предмета"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  
                  {/* Kebab menu */}
                  <button
                    onClick={() => {
                      setEditingPredmet(params.row);
                      setShowModal(true);
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors duration-200 cursor-pointer"
                    title="Опције предмета"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              )
            },
   ]), [kategorije, getKategorijaNaziv, renderSimpleHeader, router]);

  // Filter states
  const [filters, setFilters] = useState({
    nazivPredmeta: '',
    status: '',
    prioritet: '',
    odgovornaOsoba: '',
    kategorijaId: ''
  });
  
  // Apply filters and sorting to data
  const filteredData = useMemo(() => {
    console.log('Filtering data. Total predmeti:', predmeti.length);
    const filtered = predmeti.filter(predmet => {
      if (filters.nazivPredmeta && !predmet.nazivPredmeta.toLowerCase().includes(filters.nazivPredmeta.toLowerCase())) return false;
      if (filters.status && predmet.status !== filters.status) return false;
      if (filters.prioritet && predmet.prioritet !== filters.prioritet) return false;
      if (filters.odgovornaOsoba && !predmet.odgovornaOsoba.toLowerCase().includes(filters.odgovornaOsoba.toLowerCase())) return false;
      if (filters.kategorijaId && predmet.kategorijaId !== parseInt(filters.kategorijaId)) return false;
      return true;
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof Predmet];
        const bValue = b[sortConfig.field as keyof Predmet];
        
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

    console.log('Filtered data length:', filtered.length);
    return filtered;
  }, [predmeti, filters, sortConfig]);
  
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
      predmetiLength: predmeti.length,
      filteredDataLength: filteredData.length,
      columnsLength: columns.length,
      loading,
      error,
      predmetiSample: predmeti.slice(0, 3).map(p => ({ id: p.predmetId, naziv: p.nazivPredmeta })),
      filteredDataSample: filteredData.slice(0, 3).map(p => ({ id: p.predmetId, naziv: p.nazivPredmeta }))
    });
  }, [predmeti.length, filteredData.length, columns.length, loading, error, predmeti, filteredData]);

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
                src="/ikoniceSidebar/beleIkonice/predmetiBelo.png" 
                alt="EUK Predmeti" 
                className="w-9 h-9"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ЕУК Предмети</h1>
              <p className="text-base text-gray-600">Управљање предметима за ЕУК систем</p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorHandler error={error} onRetry={fetchPredmeti} />
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
              <PermissionGuard routeName="/euk/predmeti" requiredPermission="write" userId={user?.id || undefined}>
                <button
                  onClick={() => {
                    setEditingPredmet(null);
                    setShowModal(true);
                  }}
                     className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                >
                  <Add className="w-4 h-4" />
                  Додај нови предмет
                </button>
              </PermissionGuard>
              <PermissionGuard routeName="/euk/predmeti" requiredPermission="read" userId={user?.id || undefined}>
                <button
                  onClick={() => setExportDialogOpen(true)}
                   className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                >
                  <FileDownload className="w-4 h-4" />
                  Извоз
                </button>
              </PermissionGuard>
              <button
                onClick={() => {
                  // TODO: Implement column visibility toggle
                  console.log('Toggle columns');
                }}
                 className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
              >
                Колоне
              </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Назив предмета</label>
                  <input
                    type="text"
                    placeholder="Претражи по називу..."
                     value={filters.nazivPredmeta}
                     onChange={(e) => setFilters(prev => ({ ...prev, nazivPredmeta: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
                                     <select 
                     value={filters.status}
                     onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                   >
                    <option value="">Сви статуси</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Приоритет</label>
                                     <select 
                     value={filters.prioritet}
                     onChange={(e) => setFilters(prev => ({ ...prev, prioritet: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                   >
                    <option value="">Сви приоритети</option>
                    {prioritetOptions.map(prioritet => (
                      <option key={prioritet} value={prioritet}>{prioritet}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Одговорна особа</label>
                  <input
                    type="text"
                    placeholder="Претражи по особи..."
                     value={filters.odgovornaOsoba}
                     onChange={(e) => setFilters(prev => ({ ...prev, odgovornaOsoba: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Категорија</label>
                                     <select 
                     value={filters.kategorijaId}
                     onChange={(e) => setFilters(prev => ({ ...prev, kategorijaId: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                   >
                    <option value="">Све категорије</option>
                    {kategorije.map((kategorija) => (
                      <option key={kategorija.kategorijaId} value={kategorija.kategorijaId}>
                        {kategorija.naziv}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                                     <button
                     onClick={() => setFilters({
                       nazivPredmeta: '',
                       status: '',
                       prioritet: '',
                       odgovornaOsoba: '',
                       kategorijaId: ''
                     })}
                     className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer"
                   >
                    Очисти филтере
                  </button>
                  <button
                     className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-medium cursor-pointer"
                  >
                    Примени филтере
                  </button>
                </div>
              </div>
            </div>
          )}
          
                                                           {/* DataGrid Table */}
          
          <Paper sx={{ height: 600, width: '100%' }}>
                                               <DataGrid
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row.predmetId}
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
                                 Укупно: <span className="font-semibold text-gray-800">{predmeti.length}</span> предмета
                               </span>
                               {filteredData.length !== predmeti.length && (
                                 <span className="text-sm text-gray-600">
                                   Филтрирано: <span className="font-semibold text-gray-800">{filteredData.length}</span>
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
          <PredmetiStatistika predmeti={predmeti} kategorije={kategorije} />
        )}

        {/* New Predmet Modal */}
        <NoviPredmetModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPredmet(null);
          }}
          onSuccess={handleModalSuccess}
          kategorije={kategorije}
          editingPredmet={editingPredmet}
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

        <PredmetDetaljiModal
          isOpen={showDetaljiModal}
          onClose={() => {
            setShowDetaljiModal(false);
            setSelectedPredmet(null);
          }}
          predmet={selectedPredmet}
          kategorijaNaziv={selectedPredmet ? getKategorijaNaziv(selectedPredmet.kategorijaId) : ''}
        />
      </div>
    </div>
    </>
  );
}
