"use client";
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface UgrozenoLiceT2 {
  ugrozenoLiceId?: number;
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  edBroj?: string;
  pokVazenjaResenjaOStatusu?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface T2SearchComponentProps {
  onResults: (results: UgrozenoLiceT2[]) => void;
  onLoading: (loading: boolean) => void;
}

const T2SearchComponent: React.FC<T2SearchComponentProps> = ({ onResults, onLoading }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    edBroj: '',
    ime: '',
    prezime: '',
    gradOpstina: '',
    mesto: '',
    jmbg: '',
    redniBroj: '',
    pttBroj: '',
    pokVazenjaResenjaOStatusu: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!token) return;
    
    setLoading(true);
    onLoading(true);
    
    try {
      // Pripremi filtere za server
      const serverFilters: Record<string, unknown> = {};
      
      // Dodaj samo ne-prazne filtere
      if (filters.edBroj.trim()) serverFilters.edBroj = filters.edBroj.trim();
      if (filters.ime.trim()) serverFilters.ime = filters.ime.trim();
      if (filters.prezime.trim()) serverFilters.prezime = filters.prezime.trim();
      if (filters.gradOpstina.trim()) serverFilters.gradOpstina = filters.gradOpstina.trim();
      if (filters.mesto.trim()) serverFilters.mesto = filters.mesto.trim();
      if (filters.jmbg.trim()) serverFilters.jmbg = filters.jmbg.trim();
      if (filters.redniBroj.trim()) serverFilters.redniBroj = filters.redniBroj.trim();
      if (filters.pttBroj.trim()) serverFilters.pttBroj = filters.pttBroj.trim();
      if (filters.pokVazenjaResenjaOStatusu.trim()) serverFilters.pokVazenjaResenjaOStatusu = filters.pokVazenjaResenjaOStatusu.trim();
      
      console.log('T2 Search filters:', serverFilters);
      
      const searchResults = await apiService.searchUgrozenoLiceT2ByFilters(serverFilters, token);
      const ugrozenaLicaData = searchResults.content || searchResults;
      
      onResults(Array.isArray(ugrozenaLicaData) ? ugrozenaLicaData : []);
      console.log('T2 Search results:', ugrozenaLicaData.length, 'records');
      
    } catch (error) {
      console.error('T2 search error:', error);
      onResults([]);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({
      edBroj: '',
      ime: '',
      prezime: '',
      gradOpstina: '',
      mesto: '',
      jmbg: '',
      redniBroj: '',
      pttBroj: '',
      pokVazenjaResenjaOStatusu: ''
    });
    onResults([]);
  };

  return (
    <div className="t2-search-container bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">T2 Ugrožena Lica - Pretraga</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* ED Broj */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ED Broj</label>
          <input
            type="text"
            placeholder="Pretraži po ED broju..."
            value={filters.edBroj}
            onChange={(e) => setFilters({...filters, edBroj: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Ime */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ime</label>
          <input
            type="text"
            placeholder="Pretraži po imenu..."
            value={filters.ime}
            onChange={(e) => setFilters({...filters, ime: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Prezime */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Prezime</label>
          <input
            type="text"
            placeholder="Pretraži po prezimenu..."
            value={filters.prezime}
            onChange={(e) => setFilters({...filters, prezime: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* JMBG */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">JMBG</label>
          <input
            type="text"
            placeholder="Pretraži po JMBG-u..."
            value={filters.jmbg}
            onChange={(e) => setFilters({...filters, jmbg: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Redni broj */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Redni broj</label>
          <input
            type="text"
            placeholder="Pretraži po rednom broju..."
            value={filters.redniBroj}
            onChange={(e) => setFilters({...filters, redniBroj: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Grad/Opština */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Grad/Opština</label>
          <input
            type="text"
            placeholder="Pretraži po gradu/opštini..."
            value={filters.gradOpstina}
            onChange={(e) => setFilters({...filters, gradOpstina: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Mesto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mesto</label>
          <input
            type="text"
            placeholder="Pretraži po mestu..."
            value={filters.mesto}
            onChange={(e) => setFilters({...filters, mesto: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* PTT broj */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">PTT broj</label>
          <input
            type="text"
            placeholder="Pretraži po PTT broju..."
            value={filters.pttBroj}
            onChange={(e) => setFilters({...filters, pttBroj: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Period važenja rešenja */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Period važenja rešenja</label>
          <input
            type="text"
            placeholder="Pretraži po periodu važenja..."
            value={filters.pokVazenjaResenjaOStatusu}
            onChange={(e) => setFilters({...filters, pokVazenjaResenjaOStatusu: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Pretražujem...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Pretraži T2
            </>
          )}
        </button>
        
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Očisti
        </button>
      </div>
    </div>
  );
};

export default T2SearchComponent;
