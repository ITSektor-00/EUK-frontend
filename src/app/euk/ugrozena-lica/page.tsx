"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import UgrozenaLicaTable from './UgrozenaLicaTable';
import NovoUgrozenoLiceModal from './NovoUgrozenoLiceModal';
import UrediUgrozenoLiceModal from './UrediUgrozenoLiceModal';
import ExportModal from './ExportModal';
import ColumnsMenu from './ColumnsMenu';
import { Button } from '@/components/ui/button';
import UgrozenaLicaFilter from './UgrozenaLicaFilter';
import UgrozenaLicaStatistika from './UgrozenaLicaStatistika';
import { UgrozenoLice, UgrozenoLiceFormData, UgrozenoLiceResponse } from './types';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useAuth } from '@/contexts/AuthContext';

const ALL_COLUMNS = [
  "ugrozenoLiceId",
  "ime",
  "prezime",
  "jmbg",
  "datumRodjenja",
  "drzavaRodjenja",
  "mestoRodjenja",
  "opstinaRodjenja",
  "predmetId",
];

const COLUMN_LABELS: Record<string, string> = {
  ugrozenoLiceId: 'ID',
  ime: 'Ime',
  prezime: 'Prezime',
  jmbg: 'JMBG',
  datumRodjenja: 'Datum rođenja',
  drzavaRodjenja: 'Država rođenja',
  mestoRodjenja: 'Mesto rođenja',
  opstinaRodjenja: 'Opština rođenja',
  predmetId: 'ID predmeta',
};

export default function UgrozenaLicaPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUgrozenoLice, setEditingUgrozenoLice] = useState<UgrozenoLice | null>(null);
  const [ugrozenaLica, setUgrozenaLica] = useState<UgrozenoLice[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'}|null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>(ALL_COLUMNS);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'tabela' | 'statistika'>('tabela');

  const fetchUgrozenaLica = async (retryCount = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', rowsPerPage.toString());
      
      // Dodaj filtere ako postoje
      Object.entries(filterValues).forEach(([key, value]) => {
        if (value && value !== '') params.append(key, String(value));
      });

      const res = await fetch(`/api/euk/ugrozena-lica?${params.toString()}`);
      
      if (!res.ok) {
        // Posebno rukovanje za 429 greške (Too Many Requests)
        if (res.status === 429) {
          const errorData = await res.json();
          const retryAfter = errorData.retryAfter || 60;
          
          if (retryCount < 3) {
            // Eksponencijalni backoff
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            setRetrying(true);
            setToast({
              msg: `Server je preopterećen. Pokušavam ponovo za ${Math.ceil(delay/1000)} sekundi...`,
              type: 'error'
            });
            
            setTimeout(() => {
              setRetrying(false);
              fetchUgrozenaLica(retryCount + 1);
            }, delay);
            return;
          } else {
            setToast({
              msg: `Previše pokušaja. Molimo sačekajte ${retryAfter} sekundi pre ponovnog pokušaja.`,
              type: 'error'
            });
            return;
          }
        }
        
        throw new Error(`HTTP greška: ${res.status}`);
      }

      const data: UgrozenoLiceResponse = await res.json();
      
      setUgrozenaLica(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      
      // Očisti toast ako je uspešno
      if (toast && toast.type === 'error') {
        setToast(null);
      }
    } catch (error) {
      setToast({
        msg: 'Greška pri dohvatanju ugroženih lica. Pokušajte ponovo.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Debouncing za filtere - čekaj 500ms pre slanja zahteva
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUgrozenaLica();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, rowsPerPage, filterValues]);

  // Memoizuj fetchUgrozenaLica funkciju da izbegnemo infinite loop
  const memoizedFetchUgrozenaLica = React.useCallback(fetchUgrozenaLica, [page, rowsPerPage, filterValues]);

  const handleAdd = async (novo: UgrozenoLiceFormData) => {
    try {
      const res = await fetch('/api/euk/ugrozena-lica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      
      if (res.ok) {
        setToast({msg: 'Ugroženo lice uspešno dodato!', type: 'success'});
        setModalOpen(false);
        fetchUgrozenaLica();
      } else {
        // Posebno rukovanje za 429 greške
        if (res.status === 429) {
          const errorData = await res.json();
          setToast({
            msg: `Server je preopterećen. Molimo sačekajte ${errorData.retryAfter || 60} sekundi.`,
            type: 'error'
          });
          return;
        }
        
        const err = await res.json();
        setToast({msg: err.error || 'Greška pri unosu.', type: 'error'});
      }
    } catch (error) {
      setToast({msg: 'Greška pri unosu.', type: 'error'});
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (columns: string[]) => {
    const headers = columns.map(col => COLUMN_LABELS[col] || col);
    const rows = ugrozenaLica.map((lice: UgrozenoLice) => {
      return columns.map(col => {
        const value = lice[col as keyof UgrozenoLice];
        if (col === 'datumRodjenja' && value) {
          return new Date(value).toLocaleDateString('sr-RS');
        }
        return value || '';
      });
    });
    
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ugrozena-lica.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(ugrozenaLica.map(lice => lice.ugrozenoLiceId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/euk/ugrozena-lica/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({msg: 'Ugroženo lice uspešno obrisano!', type: 'success'});
        fetchUgrozenaLica();
      } else {
        // Posebno rukovanje za 429 greške
        if (res.status === 429) {
          const errorData = await res.json();
          setToast({
            msg: `Server je preopterećen. Molimo sačekajte ${errorData.retryAfter || 60} sekundi.`,
            type: 'error'
          });
          return;
        }
        
        const err = await res.json();
        setToast({msg: err.error || 'Greška pri brisanju.', type: 'error'});
      }
    } catch (error) {
      setToast({msg: 'Greška pri brisanju.', type: 'error'});
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (ugrozenoLice: UgrozenoLice) => {
    setEditingUgrozenoLice(ugrozenoLice);
    setEditModalOpen(true);
  };

  const handleUpdate = async (updatedUgrozenoLice: UgrozenoLiceFormData) => {
    if (!editingUgrozenoLice) return;
    try {
      const res = await fetch(`/api/euk/ugrozena-lica/${editingUgrozenoLice.ugrozenoLiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUgrozenoLice),
      });
      if (res.ok) {
        setToast({msg: 'Ugroženo lice uspešno ažurirano!', type: 'success'});
        setEditModalOpen(false);
        setEditingUgrozenoLice(null);
        fetchUgrozenaLica();
      } else {
        // Posebno rukovanje za 429 greške
        if (res.status === 429) {
          const errorData = await res.json();
          setToast({
            msg: `Server je preopterećen. Molimo sačekajte ${errorData.retryAfter || 60} sekundi.`,
            type: 'error'
          });
          return;
        }
        
        const err = await res.json();
        setToast({msg: err.error || 'Greška pri ažuriranju.', type: 'error'});
      }
    } catch (error) {
      setToast({msg: 'Greška pri ažuriranju.', type: 'error'});
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleColumn = (col: string) => {
    setVisibleColumns(cols => cols.includes(col) ? cols.filter(c => c !== col) : [...cols, col]);
  };

  // Sortiranje po srpskoj abecedi na frontendu
  const handleSortByName = () => {
    const sorted = [...ugrozenaLica].sort((a, b) => {
      const imeA = `${a.ime || ''} ${a.prezime || ''}`.trim();
      const imeB = `${b.ime || ''} ${b.prezime || ''}`.trim();
      return imeA.localeCompare(imeB, 'sr', { sensitivity: 'base' });
    });
    setUgrozenaLica(sorted);
  };

  const handleSortByDatumRodjenja = () => {
    const sorted = [...ugrozenaLica].sort((a, b) => {
      const dA = a.datumRodjenja ? new Date(a.datumRodjenja).getTime() : 0;
      const dB = b.datumRodjenja ? new Date(b.datumRodjenja).getTime() : 0;
      return dB - dA;
    });
    setUgrozenaLica(sorted);
  };

  const handleSortByJmbg = () => {
    const sorted = [...ugrozenaLica].sort((a, b) => {
      return (a.jmbg || '').localeCompare(b.jmbg || '', 'sr');
    });
    setUgrozenaLica(sorted);
  };

  return (
    <div className="p-8 w-full h-full">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition ${toast.type==='success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>
      )}
      {/* Header sa naslovom */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3A3CA6'}}>
            <Image src="/ikoniceSidebar/beleIkonice/ugrozenaLicaBelo.png" alt="Ugrožena lica" width={40} height={40} />
          </div>
          <h1 className="text-4xl font-bold ml-2">Ugrožena lica</h1>
        </div>
      </div>
      {/* Tabovi za prikaz */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 relative">
        <button
          className={`flex items-center gap-2 px-2 pb-2 font-semibold text-lg transition-colors duration-150 focus:outline-none cursor-pointer ${activeTab === 'tabela' ? 'text-indigo-700' : 'text-gray-800'}`}
          style={{ position: 'relative' }}
          onClick={() => setActiveTab('tabela')}
        >
          <Image src="/ikonice/table.svg" alt="Tabela" width={22} height={22} />
          Tabela
          {activeTab === 'tabela' && <span className="absolute left-0 right-0 -bottom-[2px] h-1 bg-indigo-600 rounded-full" />}
        </button>
        <button
          className={`flex items-center gap-2 px-2 pb-2 font-semibold text-lg transition-colors duration-150 focus:outline-none cursor-pointer ${activeTab === 'statistika' ? 'text-indigo-700' : 'text-gray-800'}`}
          style={{ position: 'relative' }}
          onClick={() => setActiveTab('statistika')}
        >
          <Image src="/globe.svg" alt="Statistika" width={22} height={22} />
          Statistika
          {activeTab === 'statistika' && <span className="absolute left-0 right-0 -bottom-[2px] h-1 bg-indigo-600 rounded-full" />}
        </button>
      </div>
      {/* Prikaz tabele ili statistike */}
      {activeTab === 'tabela' ? (
        <>
          {/* Naslov tabele i kontrole */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Image src="/ikonice/table.svg" alt="Tabela" width={28} height={28} />
              <h2 className="text-3xl font-semibold">Tabela</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {selectedIds.length > 0 && (
                <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="delete" userId={user?.id}>
                  <Button variant="destructive" onClick={async () => {
                    const confirmed = window.confirm('Da li ste sigurni da želite da obrišete izabrana ugrožena lica?');
                    if (confirmed) {
                      for (const id of selectedIds) {
                        await handleDelete(id);
                      }
                      setSelectedIds([]);
                    }
                  }} className="flex items-center gap-2 order-1 sm:order-none">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="6" y="7" width="12" height="12" rx="2" stroke="#fff" strokeWidth="2"/><path d="M9 7V5a3 3 0 1 1 6 0v2" stroke="#fff" strokeWidth="2"/></svg>
                    Obriši ({selectedIds.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="write" userId={user?.id}>
                <Button onClick={() => setModalOpen(true)} variant="default" className="font-semibold bg-[#3A3CA6] hover:bg-blue-700 active:bg-blue-800 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/>
                  </svg>
                  Novo ugroženo lice
                </Button>
              </PermissionGuard>
              <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="read" userId={user?.id}>
                <Button variant="outline" onClick={() => setExportOpen(true)} className="hover:bg-gray-50 active:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">Izvoz</Button>
              </PermissionGuard>
              <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="read" userId={user?.id}>
                <div className="relative">
                  <Button variant="outline" onClick={() => setColumnsOpen(!columnsOpen)} className="flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">
                    <span className="w-5 h-5 inline-block align-middle">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="columns-3-2" transform="translate(-2 -2)">
                          <path id="secondary" fill="#2ca9bc" d="M4,3H20a1,1,0,0,1,1,1V7H3V4A1,1,0,0,1,4,3Z"/>
                          <path id="primary" d="M15,7H9V21h6ZM3,7H21M20,21H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3Z" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                        </g>
                      </svg>
                    </span>
                    Kolone <span className="ml-1 bg-indigo-600 text-white rounded px-2">{visibleColumns.length}</span>
                  </Button>
                  {columnsOpen && (
                    <ColumnsMenu
                      open={columnsOpen}
                      onClose={() => setColumnsOpen(false)}
                      selected={visibleColumns}
                      onChange={(cols, visible) => {
                        setColumnOrder(cols);
                        setVisibleColumns(visible);
                      }}
                    />
                  )}
                </div>
              </PermissionGuard>
              <PermissionGuard routeName="/euk/ugrozena-lica" requiredPermission="read" userId={user?.id}>
                <Button variant="outline" onClick={() => setFilterOpen(true)} className="hover:bg-gray-50 active:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer">Filteri</Button>
              </PermissionGuard>
            </div>
          </div>
          {/* Sadržaj tabele */}
          <div className="overflow-x-auto w-full">
            <UgrozenaLicaTable
              ugrozenaLica={ugrozenaLica}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onOrderChange={setColumnOrder}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              allSelected={selectedIds.length === ugrozenaLica.length && ugrozenaLica.length > 0}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSortByName={handleSortByName}
              onSortByDatumRodjenja={handleSortByDatumRodjenja}
              onSortByJmbg={handleSortByJmbg}
              columnsOpen={columnsOpen}
              filterOpen={filterOpen}
            />
          </div>
          {/* Pagination i ukupno stavki prikazujem samo ovde */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Broj redova:</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              >
                {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Ukupno stavki: <span className="font-medium">{totalElements}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>Prethodna</button>
              <button className="border border-blue-500 bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">{page + 1}</button>
              <button className="border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" onClick={() => setPage(p => Math.min(totalPages - 1, p+1))} disabled={page === totalPages - 1}>Sledeća</button>
            </div>
          </div>
        </>
      ) : (
        <UgrozenaLicaStatistika ugrozenaLica={ugrozenaLica} />
      )}
      {/* Modali i ostalo ostaje isto */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} onExport={handleExport} defaultColumns={visibleColumns} />
      {modalOpen && (
        <NovoUgrozenoLiceModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
      )}
      {editModalOpen && editingUgrozenoLice && (
        <UrediUgrozenoLiceModal
          open={editModalOpen}
          ugrozenoLice={editingUgrozenoLice}
          onClose={() => { setEditModalOpen(false); setEditingUgrozenoLice(null); }}
          onSave={handleUpdate}
        />
      )}

      {filterOpen && (
        <UgrozenaLicaFilter
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          onFilter={setFilterValues}
          initialValues={filterValues}
        />
      )}
    </div>
  );
} 