"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (columns: string[]) => void;
  defaultColumns: string[];
}

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

export default function ExportModal({ open, onClose, onExport, defaultColumns }: ExportModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);

  const handleExport = () => {
    onExport(selectedColumns);
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedColumns(Object.keys(COLUMN_LABELS));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleToggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Izvoz podataka</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Izaberi kolone za izvoz
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Izaberi sve
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Poništi sve
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => handleToggleColumn(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Otkaži
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Izvezi CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 