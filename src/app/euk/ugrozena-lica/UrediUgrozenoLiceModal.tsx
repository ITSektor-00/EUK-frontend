"use client";
import React, { useState, useEffect } from 'react';
import { UgrozenoLiceT1, UgrozenoLiceFormData } from './types';
import { Button } from '@/components/ui/button';

interface UrediUgrozenoLiceModalProps {
  open: boolean;
  ugrozenoLice: UgrozenoLiceT1;
  onClose: () => void;
  onSave: (ugrozenoLice: UgrozenoLiceFormData) => void;
}

export default function UrediUgrozenoLiceModal({ 
  open, 
  ugrozenoLice, 
  onClose, 
  onSave 
}: UrediUgrozenoLiceModalProps) {
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

  const [errors, setErrors] = useState<Partial<Record<keyof UgrozenoLiceFormData, string>>>({});

  useEffect(() => {
    if (ugrozenoLice) {
      setFormData({
        redniBroj: ugrozenoLice.redniBroj || '',
        ime: ugrozenoLice.ime || '',
        prezime: ugrozenoLice.prezime || '',
        jmbg: ugrozenoLice.jmbg || '',
        pttBroj: ugrozenoLice.pttBroj || '',
        gradOpstina: ugrozenoLice.gradOpstina || '',
        mesto: ugrozenoLice.mesto || '',
        ulicaIBroj: ugrozenoLice.ulicaIBroj || '',
        brojClanovaDomacinstva: ugrozenoLice.brojClanovaDomacinstva,
        osnovSticanjaStatusa: ugrozenoLice.osnovSticanjaStatusa || '',
        edBrojBrojMernogUredjaja: ugrozenoLice.edBrojBrojMernogUredjaja || '',
        potrosnjaIPovrsinaCombined: ugrozenoLice.potrosnjaIPovrsinaCombined || '',
        iznosUmanjenjaSaPdv: ugrozenoLice.iznosUmanjenjaSaPdv,
        brojRacuna: ugrozenoLice.brojRacuna || '',
        datumIzdavanjaRacuna: ugrozenoLice.datumIzdavanjaRacuna || '',
        datumTrajanjaPrava: ugrozenoLice.datumTrajanjaPrava || '',   // 🆕 NOVO POLJE
      });
      setErrors({});
    }
  }, [ugrozenoLice]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UgrozenoLiceFormData, string>> = {};

    if (!formData.redniBroj.trim()) newErrors.redniBroj = 'Redni broj je obavezan';
    if (!formData.ime.trim()) newErrors.ime = 'Ime je obavezno';
    if (!formData.prezime.trim()) newErrors.prezime = 'Prezime je obavezno';
    if (!formData.jmbg.trim()) newErrors.jmbg = 'JMBG je obavezan';
    if (formData.jmbg.length !== 13) newErrors.jmbg = 'JMBG mora imati 13 karaktera';
    
    // Validacija za opciona polja
    if (formData.brojClanovaDomacinstva && (formData.brojClanovaDomacinstva < 1 || formData.brojClanovaDomacinstva > 20)) {
      newErrors.brojClanovaDomacinstva = 'Broj članova domaćinstva mora biti između 1 i 20';
    }
    
    // Osnov sticanja statusa može biti bilo šta - uklonjena validacija
    
    if (formData.datumIzdavanjaRacuna && new Date(formData.datumIzdavanjaRacuna) > new Date()) {
      newErrors.datumIzdavanjaRacuna = 'Datum izdavanja računa ne može biti u budućnosti';
    }
    
    // Validacija datuma trajanja prava - mora biti u budućnosti
    if (formData.datumTrajanjaPrava) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Početak današnjeg dana
      const selectedDate = new Date(formData.datumTrajanjaPrava);
      
      if (selectedDate < today) {
        newErrors.datumTrajanjaPrava = 'Datum trajanja prava mora biti u budućnosti';
      }
      
      // Validacija da datum trajanja prava bude nakon datuma izdavanja računa
      if (formData.datumIzdavanjaRacuna) {
        const datumIzdavanja = new Date(formData.datumIzdavanjaRacuna);
        if (selectedDate <= datumIzdavanja) {
          newErrors.datumTrajanjaPrava = 'Datum trajanja prava mora biti nakon datuma izdavanja računa';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof UgrozenoLiceFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

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
          <h3 className="text-xl font-bold">Uredi ugroženo lice</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Obavezna polja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redni broj *
              </label>
              <input
                type="text"
                value={formData.redniBroj}
                onChange={(e) => handleChange('redniBroj', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.redniBroj ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Unesite redni broj"
              />
              {errors.redniBroj && <p className="text-red-500 text-sm mt-1">{errors.redniBroj}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ime *
              </label>
              <input
                type="text"
                value={formData.ime}
                onChange={(e) => handleChange('ime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ime ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Unesite ime"
              />
              {errors.ime && <p className="text-red-500 text-sm mt-1">{errors.ime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prezime *
              </label>
              <input
                type="text"
                value={formData.prezime}
                onChange={(e) => handleChange('prezime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prezime ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Unesite prezime"
              />
              {errors.prezime && <p className="text-red-500 text-sm mt-1">{errors.prezime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JMBG *
              </label>
              <input
                type="text"
                value={formData.jmbg}
                onChange={(e) => handleChange('jmbg', e.target.value)}
                maxLength={13}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.jmbg ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234567890123"
              />
              {errors.jmbg && <p className="text-red-500 text-sm mt-1">{errors.jmbg}</p>}
            </div>

            {/* Opciona polja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PTT broj
              </label>
              <input
                type="text"
                value={formData.pttBroj}
                onChange={(e) => handleChange('pttBroj', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="11000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grad/Opština
              </label>
              <input
                type="text"
                value={formData.gradOpstina}
                onChange={(e) => handleChange('gradOpstina', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Beograd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesto
              </label>
              <input
                type="text"
                value={formData.mesto}
                onChange={(e) => handleChange('mesto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Novi Beograd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ulica i broj
              </label>
              <input
                type="text"
                value={formData.ulicaIBroj}
                onChange={(e) => handleChange('ulicaIBroj', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bulevar kralja Aleksandra 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Broj članova domaćinstva
              </label>
              <input
                type="number"
                value={formData.brojClanovaDomacinstva || ''}
                onChange={(e) => handleChange('brojClanovaDomacinstva', e.target.value ? parseInt(e.target.value) : undefined)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brojClanovaDomacinstva ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="3"
                min="1"
                max="20"
              />
              {errors.brojClanovaDomacinstva && <p className="text-red-500 text-sm mt-1">{errors.brojClanovaDomacinstva}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Osnov sticanja statusa
              </label>
              <input
                type="text"
                value={formData.osnovSticanjaStatusa}
                onChange={(e) => handleChange('osnovSticanjaStatusa', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.osnovSticanjaStatusa ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Unesite osnov sticanja statusa"
              />
              {errors.osnovSticanjaStatusa && <p className="text-red-500 text-sm mt-1">{errors.osnovSticanjaStatusa}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ED broj/broj mernog uređaja
              </label>
              <input
                type="text"
                value={formData.edBrojBrojMernogUredjaja}
                onChange={(e) => handleChange('edBrojBrojMernogUredjaja', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ED123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potrošnja i površina
              </label>
              <input
                type="text"
                value={formData.potrosnjaIPovrsinaCombined}
                onChange={(e) => handleChange('potrosnjaIPovrsinaCombined', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Потрошња у kWh/2500.50/загревана површина у m2/75.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Iznos umanjenja sa PDV
              </label>
              <input
                type="number"
                value={formData.iznosUmanjenjaSaPdv || ''}
                onChange={(e) => handleChange('iznosUmanjenjaSaPdv', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5000.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Broj računa
              </label>
              <input
                type="text"
                value={formData.brojRacuna}
                onChange={(e) => handleChange('brojRacuna', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum izdavanja računa
              </label>
              <input
                type="date"
                value={formData.datumIzdavanjaRacuna}
                onChange={(e) => handleChange('datumIzdavanjaRacuna', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.datumIzdavanjaRacuna ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.datumIzdavanjaRacuna && <p className="text-red-500 text-sm mt-1">{errors.datumIzdavanjaRacuna}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum trajanja prava
              </label>
              <input
                type="date"
                value={formData.datumTrajanjaPrava}
                onChange={(e) => handleChange('datumTrajanjaPrava', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.datumTrajanjaPrava ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]} // Minimum today
              />
              {errors.datumTrajanjaPrava && <p className="text-red-500 text-sm mt-1">{errors.datumTrajanjaPrava}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Datum mora biti u budućnosti i nakon datuma izdavanja računa
              </p>
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
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Sačuvaj
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
