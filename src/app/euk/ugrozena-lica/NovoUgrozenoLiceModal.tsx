"use client";
import React, { useState } from 'react';
import { UgrozenoLiceFormData } from './types';
import { Button } from '@/components/ui/button';

interface NovoUgrozenoLiceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (ugrozenoLice: UgrozenoLiceFormData) => void;
}

export default function NovoUgrozenoLiceModal({ open, onClose, onAdd }: NovoUgrozenoLiceModalProps) {
  const [formData, setFormData] = useState<UgrozenoLiceFormData>({
    ime: '',
    prezime: '',
    jmbg: '',
    datumRodjenja: '',
    drzavaRodjenja: '',
    mestoRodjenja: '',
    opstinaRodjenja: '',
    predmetId: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UgrozenoLiceFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UgrozenoLiceFormData, string>> = {};

    if (!formData.ime.trim()) newErrors.ime = 'Ime je obavezno';
    if (!formData.prezime.trim()) newErrors.prezime = 'Prezime je obavezno';
    if (!formData.jmbg.trim()) newErrors.jmbg = 'JMBG je obavezan';
    if (formData.jmbg.length !== 13) newErrors.jmbg = 'JMBG mora imati 13 karaktera';
    if (!formData.datumRodjenja) newErrors.datumRodjenja = 'Datum rođenja je obavezan';
    if (!formData.drzavaRodjenja.trim()) newErrors.drzavaRodjenja = 'Država rođenja je obavezna';
    if (!formData.mestoRodjenja.trim()) newErrors.mestoRodjenja = 'Mesto rođenja je obavezno';
    if (!formData.opstinaRodjenja.trim()) newErrors.opstinaRodjenja = 'Opština rođenja je obavezna';
    if (formData.predmetId <= 0) newErrors.predmetId = 'ID predmeta je obavezan';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd(formData);
      setFormData({
        ime: '',
        prezime: '',
        jmbg: '',
        datumRodjenja: '',
        drzavaRodjenja: '',
        mestoRodjenja: '',
        opstinaRodjenja: '',
        predmetId: 0,
      });
      setErrors({});
    }
  };

  const handleChange = (field: keyof UgrozenoLiceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Novo ugroženo lice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum rođenja *
              </label>
              <input
                type="date"
                value={formData.datumRodjenja}
                onChange={(e) => handleChange('datumRodjenja', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.datumRodjenja ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.datumRodjenja && <p className="text-red-500 text-sm mt-1">{errors.datumRodjenja}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Država rođenja *
              </label>
              <input
                type="text"
                value={formData.drzavaRodjenja}
                onChange={(e) => handleChange('drzavaRodjenja', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.drzavaRodjenja ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Srbija"
              />
              {errors.drzavaRodjenja && <p className="text-red-500 text-sm mt-1">{errors.drzavaRodjenja}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesto rođenja *
              </label>
              <input
                type="text"
                value={formData.mestoRodjenja}
                onChange={(e) => handleChange('mestoRodjenja', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mestoRodjenja ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Beograd"
              />
              {errors.mestoRodjenja && <p className="text-red-500 text-sm mt-1">{errors.mestoRodjenja}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opština rođenja *
              </label>
              <input
                type="text"
                value={formData.opstinaRodjenja}
                onChange={(e) => handleChange('opstinaRodjenja', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.opstinaRodjenja ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Novi Beograd"
              />
              {errors.opstinaRodjenja && <p className="text-red-500 text-sm mt-1">{errors.opstinaRodjenja}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID predmeta *
              </label>
              <input
                type="number"
                value={formData.predmetId || ''}
                onChange={(e) => handleChange('predmetId', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.predmetId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
                min="1"
              />
              {errors.predmetId && <p className="text-red-500 text-sm mt-1">{errors.predmetId}</p>}
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
              Dodaj
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
