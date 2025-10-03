"use client";
import React, { useState } from 'react';
import { FormularPoljeDto } from './types';

interface PoljeEditorProps {
  polje: FormularPoljeDto;
  onChange: (poljeId: number, updatedPolje: FormularPoljeDto) => void;
  onCancel: () => void;
}

const PoljeEditor: React.FC<PoljeEditorProps> = ({ polje, onChange, onCancel }) => {
  const [localPolje, setLocalPolje] = useState<FormularPoljeDto>(polje);

  const handleChange = (field: keyof FormularPoljeDto, value: any) => {
    setLocalPolje(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onChange(polje.poljeId, localPolje);
  };

  const renderTipPoljaOptions = () => {
    const tipovi = [
      { value: 'text', label: 'Tekst' },
      { value: 'textarea', label: 'Višelinijski tekst' },
      { value: 'number', label: 'Broj' },
      { value: 'date', label: 'Datum' },
      { value: 'datetime', label: 'Datum i vreme' },
      { value: 'select', label: 'Dropdown' },
      { value: 'radio', label: 'Radio dugmad' },
      { value: 'checkbox', label: 'Checkbox' },
      { value: 'file', label: 'Fajl' }
    ];

    return (
      <select 
        value={localPolje.tipPolja} 
        onChange={(e) => handleChange('tipPolja', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {tipovi.map(tip => (
          <option key={tip.value} value={tip.value}>{tip.label}</option>
        ))}
      </select>
    );
  };

  const renderOpcijeEditor = () => {
    if (!['select', 'radio', 'checkbox'].includes(localPolje.tipPolja)) return null;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opcije (jedna po liniji):
        </label>
        <textarea
          value={localPolje.opcije || ''}
          onChange={(e) => handleChange('opcije', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Opcija 1&#10;Opcija 2&#10;Opcija 3"
        />
        <p className="text-xs text-gray-500 mt-1">Unesite opcije, jednu po liniji</p>
      </div>
    );
  };

  const renderValidacijaEditor = () => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Validacija (JSON):
        </label>
        <textarea
          value={localPolje.validacija || ''}
          onChange={(e) => handleChange('validacija', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder='{"minLength": 3, "maxLength": 100}'
        />
        <p className="text-xs text-gray-500 mt-1">JSON format za validaciju polja</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {polje.poljeId === 0 ? 'Dodavanje novog polja' : 'Uređivanje polja'}
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Osnovne informacije */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv polja *
              </label>
              <input
                type="text"
                value={localPolje.nazivPolja}
                onChange={(e) => handleChange('nazivPolja', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="naziv_polja"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Koristi se za identifikaciju (bez razmaka)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={localPolje.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Naziv polja"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Prikazuje se korisniku</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip polja *
              </label>
              {renderTipPoljaOptions()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redosled
              </label>
              <input
                type="number"
                value={localPolje.redosled}
                onChange={(e) => handleChange('redosled', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>

          {/* Opcije za select/radio/checkbox */}
          {renderOpcijeEditor()}

          {/* Placeholder i opis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={localPolje.placeholder || ''}
                onChange={(e) => handleChange('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unesite vrednost..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default vrednost
              </label>
              <input
                type="text"
                value={localPolje.defaultVrednost || ''}
                onChange={(e) => handleChange('defaultVrednost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Podrazumevana vrednost"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis polja
            </label>
            <textarea
              value={localPolje.opis || ''}
              onChange={(e) => handleChange('opis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Kratak opis polja..."
            />
          </div>

          {/* Validacija */}
          {renderValidacijaEditor()}

          {/* Checkbox opcije */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localPolje.obavezno}
                onChange={(e) => handleChange('obavezno', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Obavezno polje</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localPolje.readonly}
                onChange={(e) => handleChange('readonly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Samo za čitanje</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localPolje.visible}
                onChange={(e) => handleChange('visible', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Vidljivo</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Otkaži
          </button>
          <button
            onClick={handleSave}
            disabled={!localPolje.nazivPolja.trim() || !localPolje.label.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sačuvaj polje
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoljeEditor;
