"use client";
import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import { UgrozenoLiceFormData, UgrozenoLiceT1 } from './types';

interface NovoUgrozenoLiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUgrozenoLice?: UgrozenoLiceT1 | null;
  token: string;
}

// Osnov sticanja statusa može biti bilo šta - uklonjen osnovOptions

export default function NovoUgrozenoLiceModal({
  isOpen,
  onClose,
  onSuccess,
  editingUgrozenoLice,
  token
}: NovoUgrozenoLiceModalProps) {
  const [formData, setFormData] = useState<UgrozenoLiceFormData>({
    redniBroj: '',
    ime: '',
    prezime: '',
    jmbg: '',
    pttBroj: '',
    gradOpstina: '',
    mesto: '',
    ulicaIBroj: '',
    brojClanovaDomacinstva: undefined,
    osnovSticanjaStatusa: '',
    edBrojBrojMernogUredjaja: '',
    potrosnjaIPovrsinaCombined: '',
    iznosUmanjenjaSaPdv: undefined,
    brojRacuna: '',
    datumIzdavanjaRacuna: '',
    datumTrajanjaPrava: '',   // 🆕 NOVO POLJE
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update form data when editingUgrozenoLice changes
  useEffect(() => {
    if (editingUgrozenoLice) {
      setFormData({
        redniBroj: editingUgrozenoLice.redniBroj || '',
        ime: editingUgrozenoLice.ime || '',
        prezime: editingUgrozenoLice.prezime || '',
        jmbg: editingUgrozenoLice.jmbg || '',
        pttBroj: editingUgrozenoLice.pttBroj || '',
        gradOpstina: editingUgrozenoLice.gradOpstina || '',
        mesto: editingUgrozenoLice.mesto || '',
        ulicaIBroj: editingUgrozenoLice.ulicaIBroj || '',
        brojClanovaDomacinstva: editingUgrozenoLice.brojClanovaDomacinstva || undefined,
        osnovSticanjaStatusa: editingUgrozenoLice.osnovSticanjaStatusa || '',
        edBrojBrojMernogUredjaja: editingUgrozenoLice.edBrojBrojMernogUredjaja || '',
        potrosnjaIPovrsinaCombined: editingUgrozenoLice.potrosnjaIPovrsinaCombined || '',
        iznosUmanjenjaSaPdv: editingUgrozenoLice.iznosUmanjenjaSaPdv || undefined,
        brojRacuna: editingUgrozenoLice.brojRacuna || '',
        datumIzdavanjaRacuna: editingUgrozenoLice.datumIzdavanjaRacuna || '',
        datumTrajanjaPrava: editingUgrozenoLice.datumTrajanjaPrava || '',   // 🆕 NOVO POLJE
      });
    } else {
      resetForm();
    }
  }, [editingUgrozenoLice]);

  const resetForm = () => {
      setFormData({
      redniBroj: '',
        ime: '',
        prezime: '',
        jmbg: '',
      pttBroj: '',
      gradOpstina: '',
      mesto: '',
      ulicaIBroj: '',
      brojClanovaDomacinstva: undefined,
      osnovSticanjaStatusa: '',
      edBrojBrojMernogUredjaja: '',
      potrosnjaIPovrsinaCombined: '',
      iznosUmanjenjaSaPdv: undefined,
      brojRacuna: '',
      datumIzdavanjaRacuna: '',
      datumTrajanjaPrava: '',   // 🆕 NOVO POLJE
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija
    if (!formData.redniBroj.trim()) {
      setError('Молимо унесите редни број');
      return;
    }
    
    if (!formData.ime.trim()) {
      setError('Молимо унесите име');
      return;
    }
    
    if (!formData.prezime.trim()) {
      setError('Молимо унесите презиме');
      return;
    }
    
    if (!formData.jmbg.trim()) {
      setError('Молимо унесите ЈМБГ');
      return;
    }
    
    if (formData.jmbg.length !== 13) {
      setError('ЈМБГ мора имати тачно 13 цифара');
      return;
    }
    
    if (formData.brojClanovaDomacinstva && (formData.brojClanovaDomacinstva < 1 || formData.brojClanovaDomacinstva > 20)) {
      setError('Број чланова домаћинства мора бити између 1 и 20');
      return;
    }
    
    // Osnov sticanja statusa može biti bilo šta - uklonjena validacija
    
    // Validacija datuma - ne sme biti u budućnosti
    if (formData.datumIzdavanjaRacuna) {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Kraj današnjeg dana
      const selectedDate = new Date(formData.datumIzdavanjaRacuna);
      
      if (selectedDate > today) {
        setError('📅 Датум издавања рачуна не може бити у будућности');
        return;
      }
    }
    
    // Validacija datuma trajanja prava - mora biti u budućnosti
    if (formData.datumTrajanjaPrava) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Početak današnjeg dana
      const selectedDate = new Date(formData.datumTrajanjaPrava);
      
      if (selectedDate < today) {
        setError('📅 Датум трајања права мора бити у будућности');
        return;
      }
      
      // Validacija da datum trajanja prava bude nakon datuma izdavanja računa
      if (formData.datumIzdavanjaRacuna) {
        const datumIzdavanja = new Date(formData.datumIzdavanjaRacuna);
        if (selectedDate <= datumIzdavanja) {
          setError('📅 Датум трајања права мора бити након датума издавања рачуна');
          return;
        }
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (editingUgrozenoLice) {
        await apiService.updateUgrozenoLice(editingUgrozenoLice.ugrozenoLiceId!, formData, token);
      } else {
        await apiService.createUgrozenoLice(formData, token);
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error saving ugrozeno lice:', err);
      setError(err instanceof Error ? err.message : 'Грешка при чувању угроженог лица');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UgrozenoLiceFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3B82F6] text-white p-4 rounded-t-2xl -m-6 mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {editingUgrozenoLice ? 'Уреди угрожено лице' : 'Додај ново угрожено лице'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Redni broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Редни број <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.redniBroj}
                onChange={(e) => handleChange('redniBroj', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите редни број"
                required
              />
        </div>

            {/* Ime */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Име <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ime}
                onChange={(e) => handleChange('ime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите име"
                required
              />
            </div>

            {/* Prezime */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Презиме <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.prezime}
                onChange={(e) => handleChange('prezime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите презиме"
                required
              />
            </div>

            {/* JMBG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ЈМБГ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jmbg}
                onChange={(e) => handleChange('jmbg', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ЈМБГ (13 цифара)"
                maxLength={13}
                required
              />
            </div>

            {/* PTT broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ПТТ број</label>
              <input
                type="text"
                value={formData.pttBroj}
                onChange={(e) => handleChange('pttBroj', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ПТТ број"
              />
            </div>

            {/* Grad/Opština */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Град/Општина</label>
              <input
                type="text"
                value={formData.gradOpstina}
                onChange={(e) => handleChange('gradOpstina', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите град/општину"
              />
            </div>

            {/* Mesto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Место</label>
              <input
                type="text"
                value={formData.mesto}
                onChange={(e) => handleChange('mesto', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите место"
              />
            </div>

            {/* Ulica i broj */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Улица и број</label>
              <input
                type="text"
                value={formData.ulicaIBroj}
                onChange={(e) => handleChange('ulicaIBroj', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите улицу и број"
              />
            </div>

            {/* Broj članova domaćinstva */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Број чланова домаћинства</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.brojClanovaDomacinstva || ''}
                onChange={(e) => handleChange('brojClanovaDomacinstva', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите број чланова"
              />
            </div>

            {/* Osnov sticanja statusa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Основ стицања статуса</label>
              <input
                type="text"
                value={formData.osnovSticanjaStatusa}
                onChange={(e) => handleChange('osnovSticanjaStatusa', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите основ стицања статуса"
              />
            </div>

            {/* ED broj/broj mernog uređaja */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ЕД број/број мерног уређаја</label>
              <input
                type="text"
                value={formData.edBrojBrojMernogUredjaja}
                onChange={(e) => handleChange('edBrojBrojMernogUredjaja', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите ЕД број"
              />
            </div>

            {/* Potrošnja i površina */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Потрошња и површина</label>
              <input
                type="text"
                value={formData.potrosnjaIPovrsinaCombined}
                onChange={(e) => handleChange('potrosnjaIPovrsinaCombined', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Потрошња у kWh/2500.50/загревана површина у m2/75.5"
              />
            </div>

            {/* Iznos umanjenja sa PDV */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Износ умањења са ПДВ</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.iznosUmanjenjaSaPdv || ''}
                onChange={(e) => handleChange('iznosUmanjenjaSaPdv', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите износ умањења"
              />
            </div>

            {/* Broj računa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Број рачуна</label>
              <input
                type="text"
                value={formData.brojRacuna}
                onChange={(e) => handleChange('brojRacuna', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Унесите број рачуна"
              />
            </div>

            {/* Datum izdavanja računa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Датум издавања рачуна</label>
              <input
                type="date"
                value={formData.datumIzdavanjaRacuna}
                onChange={(e) => handleChange('datumIzdavanjaRacuna', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Datum trajanja prava */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Датум трајања права</label>
              <input
                type="date"
                value={formData.datumTrajanjaPrava}
                onChange={(e) => handleChange('datumTrajanjaPrava', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                min={new Date().toISOString().split('T')[0]} // Minimum today
              />
              <p className="text-xs text-gray-500 mt-1">
                Датум мора бити у будућности и након датума издавања рачуна
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              {editingUgrozenoLice ? 'Сачувај измене' : 'Додај угрожено лице'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
