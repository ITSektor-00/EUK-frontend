"use client";
import React, { useState, useEffect } from 'react';
import { KategorijaT1, KategorijaFormData } from './types';

interface NovoKategorijaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingKategorija: KategorijaT1 | null;
  token: string;
}

export default function NovoKategorijaModal({
  isOpen,
  onClose,
  onSuccess,
  editingKategorija,
  token
}: NovoKategorijaModalProps) {
  const [formData, setFormData] = useState<KategorijaFormData>({
    naziv: '',
    skracenica: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingKategorija) {
      setFormData({
        naziv: editingKategorija.naziv || '',
        skracenica: editingKategorija.skracenica || ''
      });
    } else {
      setFormData({
        naziv: '',
        skracenica: ''
      });
    }
    setError(null);
  }, [editingKategorija, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editingKategorija 
        ? `/api/euk/kategorije/${editingKategorija.kategorijaId}`
        : '/api/euk/kategorije';
      
      const method = editingKategorija ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri čuvanju kategorije');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju kategorije');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingKategorija ? 'Уреди категорију' : 'Нова категорија'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Назив категорије *
            </label>
            <input
              type="text"
              value={formData.naziv}
              onChange={(e) => setFormData(prev => ({ ...prev, naziv: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Унесите назив категорије"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Скраћеница *
            </label>
            <input
              type="text"
              value={formData.skracenica}
              onChange={(e) => setFormData(prev => ({ ...prev, skracenica: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Унесите скраћеницу (макс. 10 карактера)"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Максимално 10 карактера. Скраћеница мора бити јединствена.
            </p>
          </div>


          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Чувам...' : (editingKategorija ? 'Сачувај измене' : 'Креирај категорију')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
