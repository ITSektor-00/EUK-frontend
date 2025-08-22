"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import '../../components/TableStyles.css';
import NoviPredmetModal from './NoviPredmetModal';

// Custom CSS for table headers
const tableHeaderStyles = `
  .MuiTableHead-root .MuiTableCell-head {
    text-transform: lowercase !important;
    font-size: 0.875rem !important;
  }
  .MuiTableSortLabel-root {
    text-transform: lowercase !important;
  }
  .MuiTableHead-root .MuiTableCell-head:first-child {
    text-transform: uppercase !important;
  }
  
  /* Custom table styling */
  .MuiTableContainer-root {
    border: 1px solid #d1d5db !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }
  
  .MuiTableHead-root {
    background-color: #f5f6fa !important;
  }
  
  .MuiTableHead-root .MuiTableCell-head {
    background-color: #f5f6fa !important;
    border-bottom: 1px solid #d1d5db !important;
    font-weight: bold !important;
    color: #374151 !important;
    font-size: 13px !important;
  }
  
  .MuiTableBody-root .MuiTableCell-body {
    background-color: white !important;
    border-bottom: 1px solid #e5e7eb !important;
    font-size: 13px !important;
  }
  
  .MuiTableRow-root:hover .MuiTableCell-body {
    background-color: #f9fafb !important;
  }
  
  /* Horizontal scroll styles */
  .MuiTableContainer-root {
    overflow-x: auto !important;
    overflow-y: auto !important;
    max-height: 600px !important;
  }
  
  .MuiTable-root {
    min-width: 100% !important;
    width: max-content !important;
  }
  
  /* Ensure table cells don't wrap */
  .MuiTableCell-root {
    white-space: nowrap !important;
  }
  
  /* Force table to be wider than container */
  .MuiTableContainer-root .MuiTable-root {
    min-width: 1200px !important;
  }
`;

// MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';

// Material UI Imports
import {
  Chip,
} from '@mui/material';

// Icons Imports
import { Delete, Add, FileDownload } from '@mui/icons-material';

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

const columnHelper = createMRTColumnHelper<Predmet>();

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function PredmetiPage() {
  const { token } = useAuth();
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPredmet, setEditingPredmet] = useState<Predmet | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPredmeti();
      fetchKategorije();
    }
  }, [token]);

  const fetchPredmeti = async () => {
    try {
      const params = new URLSearchParams();
      const data = await apiService.getPredmeti(params.toString(), token!);
      setPredmeti(data.content || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      setLoading(false);
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

  const handleModalSuccess = () => {
    fetchPredmeti();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Да ли сте сигурни да желите да обришете овај предмет?')) {
      return;
    }

    try {
      await apiService.deletePredmet(id, token!);
      fetchPredmeti();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  };



  const getKategorijaNaziv = (kategorijaId: number) => {
    const kategorija = kategorije.find(k => k.kategorijaId === kategorijaId);
    return kategorija?.naziv || 'Непознато';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'активан': return 'success';
      case 'затворен': return 'default';
      case 'на_чекању': return 'warning';
      case 'у_обради': return 'info';
      default: return 'default';
    }
  };

  const getPrioritetColor = (prioritet: string) => {
    switch (prioritet) {
      case 'критичан': return 'error';
      case 'висок': return 'warning';
      case 'средњи': return 'info';
      case 'низак': return 'success';
      default: return 'default';
    }
  };

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

  const columns = [
    columnHelper.accessor('predmetId', {
      header: 'ID',
      size: 120,
      enableColumnFilter: false,
      minSize: 120,
      maxSize: 120,
    }),
    columnHelper.accessor('nazivPredmeta', {
      header: 'назив предмета',
      size: 400,
      minSize: 300,
      maxSize: 600,
      enableClickToCopy: true,
    }),
    columnHelper.accessor('status', {
      header: 'статус',
      size: 180,
      minSize: 150,
      maxSize: 200,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue<string>()}
          color={getStatusColor(cell.getValue<string>())}
          size="small"
          variant="outlined"
        />
      ),
    }),
    columnHelper.accessor('prioritet', {
      header: 'приоритет',
      size: 180,
      minSize: 150,
      maxSize: 200,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue<string>()}
          color={getPrioritetColor(cell.getValue<string>())}
          size="small"
          variant="outlined"
        />
      ),
    }),
    columnHelper.accessor('odgovornaOsoba', {
      header: 'одговорна особа',
      size: 250,
      minSize: 200,
      maxSize: 350,
    }),
    columnHelper.accessor('rokZaZavrsetak', {
      header: 'рок за завршетак',
      size: 200,
      minSize: 180,
      maxSize: 250,
      Cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return date ? new Date(date).toLocaleDateString('sr-RS') : '-';
      },
    }),
    columnHelper.accessor('kategorijaId', {
      header: 'категорија',
      size: 250,
      minSize: 200,
      maxSize: 350,
      Cell: ({ cell }) => getKategorijaNaziv(cell.getValue<number>()),
      enableColumnFilter: false,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data: predmeti,
    enableRowSelection: true,
    enableDensityToggle: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableStickyHeader: true,
    enableStickyFooter: false,
    enableColumnPinning: false,
    enableColumnDragging: false,
    mrtTheme: {
      baseBackgroundColor: '#ffffff',
    },
    muiTableHeadCellProps: {
      sx: {
        textTransform: 'lowercase',
        '& .MuiTableSortLabel-root': {
          textTransform: 'lowercase',
        },
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: '600px',
        overflowX: 'auto',
        overflowY: 'auto',
        '& .MuiTable-root': {
          minWidth: '100%',
        },
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <style>{tableHeaderStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-18 h-18 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img 
                src="/ikoniceSidebar/beleIkonice/predmetiBelo.png" 
                alt="EUK Predmeti" 
                className="w-13 h-13"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ЕУК Предмети</h1>
              <p className="text-lg text-gray-600">Управљање предметима за ЕУК систем</p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorHandler error={error} onRetry={fetchPredmeti} />
        )}

        {/* Table Controls - Outside white container */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
                         {/* Left side - Table title */}
             <div className="flex items-center gap-3">
               <img src="/ikonice/table.svg" alt="Table" className="w-10 h-10" />
               <h2 className="text-3xl font-bold text-gray-900">Табела</h2>
             </div>

                        {/* Right side - Action buttons */}
            <div className="flex gap-4 items-center">
              {table.getSelectedRowModel().rows.length > 0 && (
                <button
                  onClick={() => {
                    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.predmetId);
                    if (confirm(`Да ли сте сигурни да желите да обришете ${selectedIds.length} предмета?`)) {
                      selectedIds.forEach(id => handleDelete(id));
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                >
                  <Delete className="w-4 h-4" />
                  Обриши изабране ({table.getSelectedRowModel().rows.length})
                </button>
              )}
              <button
                onClick={() => {
                  setEditingPredmet(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 text-sm font-medium"
              >
                <Add className="w-4 h-4" />
                Додај нови предмет
              </button>
              <button
                onClick={() => setExportDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium"
              >
                <FileDownload className="w-4 h-4" />
                Извоз
              </button>
              <button
                onClick={() => {
                  // TODO: Implement column visibility toggle
                  console.log('Toggle columns');
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium"
              >
                Колоне
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium"
              >
                Филтери
              </button>
            </div>
          </div>
        </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    <option value="">Сви статуси</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Приоритет</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Категорија</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    <option value="">Све категорије</option>
                    {kategorije.map((kategorija) => (
                      <option key={kategorija.kategorijaId} value={kategorija.kategorijaId}>
                        {kategorija.naziv}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-medium"
                  >
                    Примени филтере
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Table with Horizontal Scroll */}
          <div className="overflow-x-auto">
            <MaterialReactTable table={table} />
          </div>
        </div>

        {/* Custom Pagination - Outside white container */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Редова по страници:</span>
            <select 
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Страница {table.getState().pagination.pageIndex + 1} од {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<<'}
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'<'}
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>'}
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>

        {/* New Predmet Modal */}
        <NoviPredmetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          kategorije={kategorije}
          editingPredmet={editingPredmet}
          token={token!}
        />

        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          columns={columns.map(col => ({ accessorKey: col.accessorKey as string, header: col.header as string }))}
          data={predmeti as unknown as Record<string, unknown>[]}
          onExport={handleExport}
        />
      </div>
    </div>
    </>
  );
}
