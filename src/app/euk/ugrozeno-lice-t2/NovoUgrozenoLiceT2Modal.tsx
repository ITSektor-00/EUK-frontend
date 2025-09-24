"use client";
import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { UgrozenoLiceT2, UgrozenoLiceT2FormData } from './types';

interface NovoUgrozenoLiceT2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUgrozenoLice: UgrozenoLiceT2 | null;
  token: string;
}

export default function NovoUgrozenoLiceT2Modal({
  isOpen,
  onClose,
  onSuccess,
  editingUgrozenoLice,
  token
}: NovoUgrozenoLiceT2ModalProps) {
  const [formData, setFormData] = useState<UgrozenoLiceT2FormData>({
    redniBroj: '',
    ime: '',
    prezime: '',
    jmbg: '',
    pttBroj: '',
    gradOpstina: '',
    mesto: '',
    ulicaIBroj: '',
    edBroj: '',
    pokVazenjaResenjaOStatusu: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingUgrozenoLice) {
        setIsEditing(true);
        setFormData({
          redniBroj: editingUgrozenoLice.redniBroj || '',
          ime: editingUgrozenoLice.ime || '',
          prezime: editingUgrozenoLice.prezime || '',
          jmbg: editingUgrozenoLice.jmbg || '',
          pttBroj: editingUgrozenoLice.pttBroj || '',
          gradOpstina: editingUgrozenoLice.gradOpstina || '',
          mesto: editingUgrozenoLice.mesto || '',
          ulicaIBroj: editingUgrozenoLice.ulicaIBroj || '',
          edBroj: editingUgrozenoLice.edBroj || '',
          pokVazenjaResenjaOStatusu: editingUgrozenoLice.pokVazenjaResenjaOStatusu || ''
        });
      } else {
        setIsEditing(false);
        setFormData({
          redniBroj: '',
          ime: '',
          prezime: '',
          jmbg: '',
          pttBroj: '',
          gradOpstina: '',
          mesto: '',
          ulicaIBroj: '',
          edBroj: '',
          pokVazenjaResenjaOStatusu: ''
        });
      }
      setError(null);
    }
  }, [isOpen, editingUgrozenoLice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.redniBroj.trim()) {
      setError('Redni broj je obavezan');
      return false;
    }
    if (!formData.ime.trim()) {
      setError('Ime je obavezno');
      return false;
    }
    if (!formData.prezime.trim()) {
      setError('Prezime je obavezno');
      return false;
    }
    if (!formData.jmbg.trim()) {
      setError('JMBG je obavezan');
      return false;
    }
    if (formData.jmbg.length !== 13) {
      setError('JMBG mora imati tačno 13 cifara');
      return false;
    }
    if (!/^\d{13}$/.test(formData.jmbg)) {
      setError('JMBG mora sadržavati samo cifre');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && editingUgrozenoLice?.ugrozenoLiceId) {
        await apiService.updateUgrozenoLiceT2(editingUgrozenoLice.ugrozenoLiceId, formData, token);
      } else {
        await apiService.createUgrozenoLiceT2(formData, token);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving ugrozeno lice T2:', err);
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Уреди угрожено лице Т2' : 'Ново угрожено лице Т2'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Redni broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Редни број *
              </label>
              <input
                type="text"
                name="redniBroj"
                value={formData.redniBroj}
                onChange={handleInputChange}
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите редни број"
                required
              />
            </div>

            {/* Ime */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Име *
              </label>
              <input
                type="text"
                name="ime"
                value={formData.ime}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите име"
                required
              />
            </div>

            {/* Prezime */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Презиме *
              </label>
              <input
                type="text"
                name="prezime"
                value={formData.prezime}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите презиме"
                required
              />
            </div>

            {/* JMBG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ЈМБГ *
              </label>
              <input
                type="text"
                name="jmbg"
                value={formData.jmbg}
                onChange={handleInputChange}
                maxLength={13}
                pattern="[0-9]{13}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ЈМБГ (13 цифара)"
                required
              />
            </div>

            {/* PTT broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ПТТ број
              </label>
              <input
                type="text"
                name="pttBroj"
                value={formData.pttBroj}
                onChange={handleInputChange}
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ПТТ број"
              />
            </div>

            {/* Grad/Opština */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Град/Општина
              </label>
              <input
                type="text"
                name="gradOpstina"
                value={formData.gradOpstina}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите град/општину"
              />
            </div>

            {/* Mesto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Место
              </label>
              <input
                type="text"
                name="mesto"
                value={formData.mesto}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите место"
              />
            </div>

            {/* Ulica i broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Улица и број
              </label>
              <input
                type="text"
                name="ulicaIBroj"
                value={formData.ulicaIBroj}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите улицу и број"
              />
            </div>

            {/* ED broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ЕД број
              </label>
              <input
                type="text"
                name="edBroj"
                value={formData.edBroj}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ЕД број"
              />
            </div>

            {/* Pokriće važenja rešenja o statusu */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Покриће важења решења о статусу
              </label>
              <input
                type="text"
                name="pokVazenjaResenjaOStatusu"
                value={formData.pokVazenjaResenjaOStatusu}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите покриће важења решења о статусу"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Чувам...' : (isEditing ? 'Ажурирај' : 'Сачувај')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
