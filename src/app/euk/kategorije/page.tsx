"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';
import { Box, Button, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { Add, Edit, Delete, FileDownload } from '@mui/icons-material';
import { generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiService } from '../../../services/api';
import ExportDialog from '../../components/ExportDialog';
import '../../components/TableStyles.css';

interface Kategorija {
  kategorijaId: number;
  naziv: string;
}

const columnHelper = createMRTColumnHelper<Kategorija>();

const csvConfig = {
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
};

export default function KategorijePage() {
  const { token } = useAuth();
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingKategorija, setEditingKategorija] = useState<Kategorija | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    naziv: ''
  });

  const fetchKategorije = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await apiService.getKategorije(token);
      setKategorije(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchKategorije();
    }
  }, [fetchKategorije]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingKategorija) {
        await apiService.updateKategorija(editingKategorija.kategorijaId, formData, token!);
      } else {
        await apiService.createKategorija(formData, token!);
      }

      setShowModal(false);
      setEditingKategorija(null);
      resetForm();
      fetchKategorije();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Да ли сте сигурни да желите да обришете ову категорију?')) {
      return;
    }

    try {
      await apiService.deleteKategorija(id, token!);
      fetchKategorije();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  };

  const handleEdit = (kategorija: Kategorija) => {
    setEditingKategorija(kategorija);
    setFormData({
      naziv: kategorija.naziv
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      naziv: ''
    });
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
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Kategorije');
        XLSX.writeFile(workbook, 'kategorije.xlsx');
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
        pdf.text('Kategorije', 14, 20);
        
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
              'naziv': 'Naziv kategorije'
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
        
        pdf.save('kategorije.pdf');
        break;
      default:
        console.log('Unknown format:', format);
    }
  };

  const columns = [
    columnHelper.accessor('kategorijaId', {
      header: 'ID',
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('naziv', {
      header: 'Назив категорије',
      size: 400,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data: kategorije,
    enableRowSelection: true,
    enableDensityToggle: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '8px',
        }}
      >
        {/* Left side - Table title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/ikonice/table.svg" alt="Table" style={{ width: '32px', height: '32px' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
            Табела
          </Typography>
        </Box>

        {/* Right side - Action buttons */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Button
            onClick={() => setExportDialogOpen(true)}
            startIcon={<FileDownload />}
            variant="contained"
            color="primary"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Извоз
          </Button>
          <Button
            onClick={() => {
              setEditingKategorija(null);
              resetForm();
              setShowModal(true);
            }}
            startIcon={<Add />}
            variant="contained"
            color="success"
            sx={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3bce6f 0%, #1da34a 100%)',
              },
            }}
          >
            Додај нову категорију
          </Button>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            color="primary"
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
              },
            }}
          >
            Филтери
          </Button>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleEdit(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Edit />
        </ListItemIcon>
        Измени
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleDelete(row.original.kategorijaId);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        Обриши
      </MenuItem>,
    ],
  });

  if (loading) {
    return <div>Учитавање...</div>;
  }

  if (error) {
    return <div>Грешка: {error}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-18 h-18 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img 
                src="/ikoniceSidebar/beleIkonice/categoryBelo.png" 
                alt="EUK Kategorije" 
                className="w-13 h-13"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ЕУК Категорије</h1>
              <p className="text-lg text-gray-600">Управљање категоријама за ЕУК систем</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-200">
          {/* Filters Section */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Назив категорије</label>
                  <input
                    type="text"
                    placeholder="Претражи по називу..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    Примени филтере
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <MaterialReactTable table={table} />
        </div>

        {/* Simple Modal for now */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4">
                {editingKategorija ? 'Измени категорију' : 'Додај нову категорију'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Назив категорије</label>
                  <input
                    type="text"
                    value={formData.naziv}
                    onChange={(e) => setFormData({...formData, naziv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Откажи
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingKategorija ? 'Измени' : 'Додај'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          columns={columns.map(col => ({ accessorKey: col.accessorKey as string, header: col.header as string }))}
          data={kategorije as unknown as Record<string, unknown>[]}
          onExport={handleExport}
        />
      </div>
    </ProtectedRoute>
  );
}
