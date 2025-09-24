"use client";
import React, { useState, useRef } from 'react';
import { UgrozenoLiceT1 } from './types';
import { Button } from '@/components/ui/button';

interface UgrozenaLicaTableProps {
  ugrozenaLica: UgrozenoLiceT1[];
  visibleColumns: string[];
  columnOrder: string[];
  onOrderChange: (order: string[]) => void;
  selectedIds: number[];
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  loading: boolean;
  onEdit: (ugrozenoLice: UgrozenoLiceT1) => void;
  onDelete: (id: number) => void;
  onSortByName: () => void;
  onSortByDatumIzdavanjaRacuna: () => void;
  onSortByJmbg: () => void;
  columnsOpen: boolean;
  filterOpen: boolean;
}

const COLUMN_LABELS: Record<string, string> = {
  ugrozenoLiceId: 'ID',
  redniBroj: 'Redni broj',
  ime: 'Ime',
  prezime: 'Prezime',
  jmbg: 'JMBG',
  pttBroj: 'PTT broj',
  gradOpstina: 'Grad/Opština',
  mesto: 'Mesto',
  ulicaIBroj: 'Ulica i broj',
  brojClanovaDomacinstva: 'Broj članova domaćinstva',
  osnovSticanjaStatusa: 'Osnov sticanja statusa',
  edBrojBrojMernogUredjaja: 'ED broj/broj mernog uređaja',
  potrosnjaKwh: 'Potrošnja (kWh)',
  zagrevanaPovrsinaM2: 'Zagrevana površina (m²)',
  iznosUmanjenjaSaPdv: 'Iznos umanjenja sa PDV',
  brojRacuna: 'Broj računa',
  datumIzdavanjaRacuna: 'Datum izdavanja računa',
};

export default function UgrozenaLicaTable({
  ugrozenaLica,
  visibleColumns,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  loading,
  onEdit,
  onDelete,
  onSortByName,
  onSortByDatumIzdavanjaRacuna,
  onSortByJmbg,
}: UgrozenaLicaTableProps) {
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS');
  };

  // Resize funkcije
  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnSizing[columnId] || 160;
    setResizing({ columnId, startX, startWidth });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const deltaX = e.clientX - resizing.startX;
    const newWidth = Math.max(80, Math.min(400, resizing.startWidth + deltaX));
    
    setColumnSizing(prev => ({
      ...prev,
      [resizing.columnId]: newWidth
    }));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  // Event listeners za resize
  React.useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">
            Učitavanje...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table ref={tableRef} className="w-full min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            {visibleColumns.map((col) => (
              <th
                key={col}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative"
                style={{ width: columnSizing[col] || 160 }}
                onClick={() => {
                  if (col === 'ime' || col === 'prezime') onSortByName();
                  else if (col === 'datumIzdavanjaRacuna') onSortByDatumIzdavanjaRacuna();
                  else if (col === 'jmbg') onSortByJmbg();
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{COLUMN_LABELS[col]}</span>
                  {(col === 'ime' || col === 'prezime' || col === 'datumIzdavanjaRacuna' || col === 'jmbg') && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </div>
                {/* Resize handle */}
                <div
                  className="resize-handle"
                  onMouseDown={(e) => handleResizeStart(col, e)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'auto' }}
                />
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Akcije
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ugrozenaLica.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length + 2} className="px-6 py-4 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="font-medium">Nema ugroženih lica</p>
                  <p className="text-sm">Dodajte prvo ugroženo lice da počnete</p>
                </div>
              </td>
            </tr>
          ) : (
            ugrozenaLica.map((ugrozenoLice) => (
              <tr key={ugrozenoLice.ugrozenoLiceId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={ugrozenoLice.ugrozenoLiceId ? selectedIds.includes(ugrozenoLice.ugrozenoLiceId) : false}
                    onChange={(e) => ugrozenoLice.ugrozenoLiceId && onSelect(ugrozenoLice.ugrozenoLiceId, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                {visibleColumns.map((col) => (
                  <td 
                    key={col} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    style={{ width: columnSizing[col] || 160 }}
                  >
                    {col === 'datumIzdavanjaRacuna' 
                      ? formatDate(ugrozenoLice[col] || '')
                      : col === 'ugrozenoLiceId' || col === 'brojClanovaDomacinstva' || col === 'potrosnjaKwh' || col === 'zagrevanaPovrsinaM2' || col === 'iznosUmanjenjaSaPdv'
                      ? ugrozenoLice[col]
                      : ugrozenoLice[col] || '-'
                    }
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ugrozenoLice)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Uredi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => ugrozenoLice.ugrozenoLiceId && onDelete(ugrozenoLice.ugrozenoLiceId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Obriši
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
