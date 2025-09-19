"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UgrozenaLicaFilterProps {
  open: boolean;
  onClose: () => void;
  onFilter: (filters: Record<string, string>) => void;
  initialValues: Record<string, string>;
}

export default function UgrozenaLicaFilter({ open, onClose, onFilter, initialValues }: UgrozenaLicaFilterProps) {
  const [filters, setFilters] = useState(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    onFilter(emptyFilters);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Filteri</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ime
            </label>
            <input
              type="text"
              value={filters.ime || ''}
              onChange={(e) => setFilters({ ...filters, ime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po imenu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prezime
            </label>
            <input
              type="text"
              value={filters.prezime || ''}
              onChange={(e) => setFilters({ ...filters, prezime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po prezimenu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JMBG
            </label>
            <input
              type="text"
              value={filters.jmbg || ''}
              onChange={(e) => setFilters({ ...filters, jmbg: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po JMBG"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Država rođenja
            </label>
            <input
              type="text"
              value={filters.drzavaRodjenja || ''}
              onChange={(e) => setFilters({ ...filters, drzavaRodjenja: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po državi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesto rođenja
            </label>
            <input
              type="text"
              value={filters.mestoRodjenja || ''}
              onChange={(e) => setFilters({ ...filters, mestoRodjenja: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po mestu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID predmeta
            </label>
            <input
              type="number"
              value={filters.predmetId || ''}
              onChange={(e) => setFilters({ ...filters, predmetId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pretraži po ID predmeta"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="px-4 py-2"
            >
              Resetuj
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Primeni
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
