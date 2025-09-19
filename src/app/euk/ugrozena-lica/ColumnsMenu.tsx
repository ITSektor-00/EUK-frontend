"use client";
import React from 'react';

interface ColumnsMenuProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onChange: (columns: string[], visible: string[]) => void;
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

const ALL_COLUMNS = Object.keys(COLUMN_LABELS);

export default function ColumnsMenu({ open, selected, onChange }: ColumnsMenuProps) {
  const handleToggleColumn = (column: string) => {
    const newVisible = selected.includes(column)
      ? selected.filter(col => col !== column)
      : [...selected, column];
    
    onChange(ALL_COLUMNS, newVisible);
  };

  const handleSelectAll = () => {
    onChange(ALL_COLUMNS, ALL_COLUMNS);
  };

  const handleDeselectAll = () => {
    onChange(ALL_COLUMNS, []);
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">Kolone</h3>
          <div className="space-x-1">
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Sve
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Ništa
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-2 max-h-60 overflow-y-auto">
        {ALL_COLUMNS.map((column) => (
          <label
            key={column}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(column)}
              onChange={() => handleToggleColumn(column)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{COLUMN_LABELS[column]}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 