"use client";
import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';

interface Kategorija {
  kategorijaId: number;
  naziv: string;
  skracenica: string;
}

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  rokZaZavrsetak: string;
  kategorijaId: number;
  kategorijaSkracenica?: string;
}

interface NoviPredmetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kategorije: Kategorija[];
  editingPredmet?: Predmet | null;
  token: string;
}

const statusOptions = ['активан', 'затворен', 'на_чекању', 'у_обради'];
const prioritetOptions = ['низак', 'средњи', 'висок', 'критичан'];

export default function NoviPredmetModal({
  isOpen,
  onClose,
  onSuccess,
  kategorije,
  editingPredmet,
  token
}: NoviPredmetModalProps) {
  const [formData, setFormData] = useState({
    nazivPredmeta: editingPredmet?.nazivPredmeta || '',
    status: editingPredmet?.status || 'активан',
    odgovornaOsoba: editingPredmet?.odgovornaOsoba || '',
    prioritet: editingPredmet?.prioritet || 'средњи',
    rokZaZavrsetak: editingPredmet?.rokZaZavrsetak || '',
    kategorijaId: editingPredmet?.kategorijaId || 0
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update form data when editingPredmet changes
  useEffect(() => {
    if (editingPredmet) {
      setFormData({
        nazivPredmeta: editingPredmet.nazivPredmeta || '',
        status: editingPredmet.status || 'активан',
        odgovornaOsoba: editingPredmet.odgovornaOsoba || '',
        prioritet: editingPredmet.prioritet || 'средњи',
        rokZaZavrsetak: editingPredmet.rokZaZavrsetak || '',
        kategorijaId: editingPredmet.kategorijaId || 0
      });
    } else {
      resetForm();
    }
  }, [editingPredmet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija - kategorijaId ne sme biti 0
    if (!formData.kategorijaId || formData.kategorijaId === 0) {
      setError('Молимо изаберите категорију');
      return;
    }
    
    // Validacija - datum završetka ne sme biti u prošlosti
    if (formData.rokZaZavrsetak) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetiraj vreme na početak dana
      const selectedDate = new Date(formData.rokZaZavrsetak);
      
      if (selectedDate < today) {
        setError('📅 Рок за завршетак не може бити у прошлости. Молимо изаберите датум од данас па надаље.');
        return;
      }
    } else {
      setError('📅 Молимо унесите рок за завршетак');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (editingPredmet) {
        await apiService.updatePredmet(editingPredmet.predmetId, formData, token);
      } else {
        await apiService.createPredmet(formData, token);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nazivPredmeta: '',
      status: 'активан',
      odgovornaOsoba: '',
      prioritet: 'средњи',
      rokZaZavrsetak: '',
      kategorijaId: 0
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3B82F6] text-white p-4 rounded-t-2xl -m-6 mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {editingPredmet ? 'Измени предмет' : 'Додај нови предмет'}
          </h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Назив предмета *
              </label>
              <input
                type="text"
                value={formData.nazivPredmeta}
                onChange={(e) => setFormData({ ...formData, nazivPredmeta: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Статус *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Приоритет *
              </label>
              <select
                value={formData.prioritet}
                onChange={(e) => setFormData({ ...formData, prioritet: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              >
                {prioritetOptions.map((prioritet) => (
                  <option key={prioritet} value={prioritet}>{prioritet}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Одговорна особа *
              </label>
              <input
                type="text"
                value={formData.odgovornaOsoba}
                onChange={(e) => setFormData({ ...formData, odgovornaOsoba: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Рок за завршетак *
              </label>
              <input
                type="date"
                value={formData.rokZaZavrsetak}
                onChange={(e) => setFormData({ ...formData, rokZaZavrsetak: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center space-x-1">
                <span>📅</span>
                <span>Датум не може бити у прошлости</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Категорија *
              </label>
              <select
                value={formData.kategorijaId || ''}
                onChange={(e) => setFormData({ ...formData, kategorijaId: e.target.value ? parseInt(e.target.value) : 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              >
                <option value="">Изабери категорију</option>
                {kategorije.map((kategorija) => (
                  <option key={kategorija.kategorijaId} value={kategorija.kategorijaId}>
                    {kategorija.naziv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-[#3B82F6] text-[#3B82F6] rounded-lg hover:bg-[#3B82F6] hover:text-white transition-all duration-200 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-semibold disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingPredmet ? 'Измени' : 'Додај'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
