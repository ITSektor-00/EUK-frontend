"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorHandler from '../../components/ErrorHandler';
import { apiService } from '../../../services/api';
import '../../components/TableStyles.css';

// MRT Imports
import {
  MaterialReactTable,
  useMaterialReactTable,
  createMRTColumnHelper,
} from 'material-react-table';

// Material UI Imports
import {
  Box,
  Button,
  ListItemIcon,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';

// Icons Imports
import { Edit, Delete, Add, FileDownload, Person } from '@mui/icons-material';

// Export imports
import { mkConfig, generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExportDialog from '../../components/ExportDialog';

interface UgrozenoLice {
  ugrozenoLiceId: number;
  ime: string;
  prezime: string;
  jmbg: string;
  datumRodjenja: string;
  drzavaRodjenja: string;
  mestoRodjenja: string;
  opstinaRodjenja: string;
  predmetId: number;
  predmet?: {
    predmetId: number;
    nazivPredmeta: string;
    status: string;
    odgovornaOsoba: string;
    prioritet: string;
  };
}

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  kategorijaId: number;
  kategorijaNaziv?: string;
  brojUgrozenihLica?: number;
  datumKreiranja?: string;
  rokZaZavrsetak?: string;
}

const columnHelper = createMRTColumnHelper<UgrozenoLice>();

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

export default function UgrozenaLicaPage() {
  const { token } = useAuth();
  const [ugrozenaLica, setUgrozenaLica] = useState<UgrozenoLice[]>([]);
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [loading, setLoading] = useState(true);
  const [predmetiLoading, setPredmetiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLice, setEditingLice] = useState<UgrozenoLice | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    jmbg: '',
    datumRodjenja: '',
    drzavaRodjenja: '',
    mestoRodjenja: '',
    opstinaRodjenja: '',
    predmetId: 0
  });

  useEffect(() => {
    if (token) {
      fetchUgrozenaLica();
      fetchPredmeti();
    }
  }, [token]);

  const fetchUgrozenaLica = async () => {
    try {
      const params = new URLSearchParams();
      const data = await apiService.getUgrozenaLica(params.toString(), token!);
      setUgrozenaLica(data.content || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  const fetchPredmeti = async () => {
    setPredmetiLoading(true);
    try {
      const params = new URLSearchParams().toString();
      const data = await apiService.getPredmeti(params, token!);
      setPredmeti(data.content || data);
    } catch (err) {
      console.error('Greška pri učitavanju predmeta:', err);
    } finally {
      setPredmetiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija - predmetId ne sme biti 0
    if (!formData.predmetId || formData.predmetId === 0) {
      setError('Молимо изаберите предмет');
      return;
    }
    
    try {
      if (editingLice) {
        await apiService.updateUgrozenoLice(editingLice.ugrozenoLiceId, formData, token!);
      } else {
        await apiService.createUgrozenoLice(formData, token!);
      }

      setShowModal(false);
      setEditingLice(null);
      resetForm();
      fetchUgrozenaLica();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Да ли сте сигурни да желите да обришете ово угрожено лице?')) {
      return;
    }

    try {
      await apiService.deleteUgrozenoLice(id, token!);
      fetchUgrozenaLica();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  };

  const handleEdit = (lice: UgrozenoLice) => {
    setEditingLice(lice);
    setFormData({
      ime: lice.ime,
      prezime: lice.prezime,
      jmbg: lice.jmbg,
      datumRodjenja: lice.datumRodjenja,
      drzavaRodjenja: lice.drzavaRodjenja,
      mestoRodjenja: lice.mestoRodjenja,
      opstinaRodjenja: lice.opstinaRodjenja,
      predmetId: lice.predmetId
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      ime: '',
      prezime: '',
      jmbg: '',
      datumRodjenja: '',
      drzavaRodjenja: '',
      mestoRodjenja: '',
      opstinaRodjenja: '',
      predmetId: 0
    });
  };

  const getPredmetNaziv = (predmetId: number) => {
    const predmet = predmeti.find(p => p.predmetId === predmetId);
    return predmet?.nazivPredmeta || 'Непознато';
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
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'UgrozenaLica');
        XLSX.writeFile(workbook, 'ugrozena-lica.xlsx');
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
        pdf.text('Ugrozena lica', 14, 20);
        
        // Prepare table data
        const tableData = filteredData.map(item => 
          selectedColumns.map(col => item[col] || '')
        );
        
        // Add table
        autoTable(pdf, {
          head: [selectedColumns.map(col => {
            // Map ćirilične nazive na latinične za PDF kompatibilnost
            const headerMap: Record<string, string> = {
              'ugrozenoLiceId': 'ID',
              'ime': 'Ime i prezime',
              'jmbg': 'JMBG',
              'datumRodjenja': 'Datum rodjenja',
              'drzavaRodjenja': 'Drzava rodjenja',
              'mestoRodjenja': 'Mesto rodjenja',
              'opstinaRodjenja': 'Opstina rodjenja',
              'predmetId': 'Predmet'
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
        
        pdf.save('ugrozena-lica.pdf');
        break;
      default:
        console.log('Unknown format:', format);
    }
  };

  const columns = [
    columnHelper.accessor('ugrozenoLiceId', {
      header: 'ID',
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('ime', {
      header: 'Име и презиме',
      size: 350,
      Cell: ({ row }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Person sx={{ color: 'primary.main' }} />
          <span>{`${row.original.ime} ${row.original.prezime}`}</span>
        </Box>
      ),
    }),
    columnHelper.accessor('jmbg', {
      header: 'ЈМБГ',
      size: 200,
      enableClickToCopy: true,
    }),
    columnHelper.accessor('datumRodjenja', {
      header: 'Датум рођења',
      size: 180,
      Cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return date ? new Date(date).toLocaleDateString('sr-RS') : '-';
      },
    }),
    columnHelper.accessor('drzavaRodjenja', {
      header: 'Држава рођења',
      size: 200,
    }),
    columnHelper.accessor('mestoRodjenja', {
      header: 'Место рођења',
      size: 200,
    }),
    columnHelper.accessor('opstinaRodjenja', {
      header: 'Општина рођења',
      size: 200,
    }),
    columnHelper.accessor('predmetId', {
      header: 'Предмет',
      size: 300,
      Cell: ({ cell }) => (
        <Chip
          label={getPredmetNaziv(cell.getValue<number>())}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
      enableColumnFilter: false,
    }),
  ];

  const table = useMaterialReactTable({
    columns,
    data: ugrozenaLica,
    enableRowSelection: true,
    enableDensityToggle: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: ({ table }) => (
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
              setEditingLice(null);
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
            Додај ново угрожено лице
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
          handleDelete(row.original.ugrozenoLiceId);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-18 h-18 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <img 
                src="/ikoniceSidebar/beleIkonice/ugrozenaLicaBelo.png" 
                alt="EUK Ugrožena lica" 
                className="w-13 h-13"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ЕУК Угрожена лица</h1>
              <p className="text-lg text-gray-600">Управљање угроженим лицима за ЕУК систем</p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorHandler error={error} onRetry={fetchUgrozenaLica} />
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
          {/* Filters Section */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Име и презиме</label>
                  <input
                    type="text"
                    placeholder="Претражи по имену..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                  <input
                    type="text"
                    placeholder="Претражи по ЈМБГ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Држава рођења</label>
                  <input
                    type="text"
                    placeholder="Претражи по држави..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Место рођења</label>
                  <input
                    type="text"
                    placeholder="Претражи по месту..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Предмет</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    <option value="">Сви предмети</option>
                    {predmeti.map((predmet) => (
                      <option key={predmet.predmetId} value={predmet.predmetId}>
                        {predmet.nazivPredmeta}
                      </option>
                    ))}
                  </select>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingLice ? 'Измени угрожено лице' : 'Додај ново угрожено лице'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Име</label>
                    <input
                      type="text"
                      value={formData.ime}
                      onChange={(e) => setFormData({...formData, ime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Презиме</label>
                    <input
                      type="text"
                      value={formData.prezime}
                      onChange={(e) => setFormData({...formData, prezime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                    <input
                      type="text"
                      value={formData.jmbg}
                      onChange={(e) => setFormData({...formData, jmbg: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      maxLength={13}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Датум рођења</label>
                    <input
                      type="date"
                      value={formData.datumRodjenja}
                      onChange={(e) => setFormData({...formData, datumRodjenja: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Држава рођења</label>
                    <input
                      type="text"
                      value={formData.drzavaRodjenja}
                      onChange={(e) => setFormData({...formData, drzavaRodjenja: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Место рођења</label>
                    <input
                      type="text"
                      value={formData.mestoRodjenja}
                      onChange={(e) => setFormData({...formData, mestoRodjenja: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Општина рођења</label>
                    <input
                      type="text"
                      value={formData.opstinaRodjenja}
                      onChange={(e) => setFormData({...formData, opstinaRodjenja: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Предмет</label>
                    <select
                      value={formData.predmetId || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        let predmetId = 0;
                        if (selectedValue && selectedValue !== '') {
                          predmetId = Number(selectedValue);
                          if (isNaN(predmetId)) {
                            console.error('❌ Neuspešno parsiranje predmetId:', selectedValue);
                            predmetId = 0;
                          }
                        }
                        setFormData({...formData, predmetId: predmetId});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={predmetiLoading}
                    >
                      <option value="">
                        {predmetiLoading ? 'Учитавање предмета...' : 'Изабери предмет'}
                      </option>
                      {predmeti.map((predmet, index) => (
                        <option key={predmet.predmetId || `predmet-${index}`} value={predmet.predmetId}>
                          {predmet.nazivPredmeta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      Откажи
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      {editingLice ? 'Измени' : 'Додај'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          columns={columns.map(col => ({ accessorKey: col.accessorKey as string, header: col.header as string }))}
          data={ugrozenaLica as unknown as Record<string, unknown>[]}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
