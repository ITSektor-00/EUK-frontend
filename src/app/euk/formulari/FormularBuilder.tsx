"use client";
import React, { useState } from 'react';
import { FormularDto, FormularPoljeDto } from './types.js';
import PoljeEditor from './PoljeEditor';

interface FormularBuilderProps {
  formular: FormularDto;
  onSave: (formular: FormularDto) => void;
  onCancel: () => void;
}

const FormularBuilder: React.FC<FormularBuilderProps> = ({ formular, onSave, onCancel }) => {
  const [localFormular, setLocalFormular] = useState<FormularDto>(formular);
  const [editingPolje, setEditingPolje] = useState<FormularPoljeDto | null>(null);

  const handleFormularChange = (field: keyof FormularDto, value: any) => {
    setLocalFormular((prev: FormularDto) => ({
      ...prev,
      [field]: value
    }));
  };

  const addPolje = () => {
    const newPolje: FormularPoljeDto = {
      poljeId: 0,
      formularId: localFormular.formularId,
      formularNaziv: localFormular.naziv,
      nazivPolja: '',
      label: '',
      tipPolja: 'text',
      obavezno: false,
      redosled: localFormular.polja.length + 1,
      placeholder: '',
      opis: '',
      validacija: '',
      opcije: '',
      defaultVrednost: '',
      readonly: false,
      visible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingPolje(newPolje);
  };

  const updatePolje = (poljeId: number, updatedPolje: FormularPoljeDto) => {
    setLocalFormular((prev: FormularDto) => ({
      ...prev,
      polja: prev.polja.map((p: FormularPoljeDto) => p.poljeId === poljeId ? updatedPolje : p)
    }));
    setEditingPolje(null);
  };

  const removePolje = (poljeId: number) => {
    setLocalFormular((prev: FormularDto) => ({
      ...prev,
      polja: prev.polja.filter((p: FormularPoljeDto) => p.poljeId !== poljeId)
    }));
  };

  const movePolje = (poljeId: number, direction: 'up' | 'down') => {
    setLocalFormular((prev: FormularDto) => {
      const polja = [...prev.polja];
      const index = polja.findIndex(p => p.poljeId === poljeId);
      
      if (direction === 'up' && index > 0) {
        [polja[index], polja[index - 1]] = [polja[index - 1], polja[index]];
        polja[index].redosled = index + 1;
        polja[index - 1].redosled = index;
      } else if (direction === 'down' && index < polja.length - 1) {
        [polja[index], polja[index + 1]] = [polja[index + 1], polja[index]];
        polja[index].redosled = index + 1;
        polja[index + 1].redosled = index + 2;
      }
      
      return { ...prev, polja };
    });
  };

  const handleSave = () => {
    const updatedFormular = {
      ...localFormular,
      brojPolja: localFormular.polja.length,
      datumAzuriranja: new Date().toISOString()
    };
    onSave(updatedFormular);
  };

  return (
    <div className="formular-builder max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {localFormular.formularId === 0 ? 'Kreiranje novog formulare' : 'Uređivanje formulare'}
          </h2>
        </div>

        {/* Formular Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv formulare *
              </label>
              <input
                type="text"
                value={localFormular.naziv}
                onChange={(e) => handleFormularChange('naziv', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unesite naziv formulare"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija
              </label>
              <input
                type="text"
                value={localFormular.kategorijaNaziv}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis formulare
            </label>
            <textarea
              value={localFormular.opis}
              onChange={(e) => handleFormularChange('opis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Unesite opis formulare"
            />
          </div>

          {/* Polja */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Polja formulare ({localFormular.polja.length})
              </h3>
              <button
                onClick={addPolje}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Dodaj polje
              </button>
            </div>

            {localFormular.polja.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Nema polja u formularu</p>
                <p className="text-sm">Kliknite &quot;Dodaj polje&quot; da počnete</p>
              </div>
            ) : (
              <div className="space-y-4">
                {localFormular.polja
                  .sort((a: FormularPoljeDto, b: FormularPoljeDto) => a.redosled - b.redosled)
                  .map((polje: FormularPoljeDto, index: number) => (
                    <div key={polje.poljeId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{polje.redosled}</span>
                            <span className="text-sm font-medium text-gray-700">{polje.label || 'Nepoznato polje'}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {polje.tipPolja}
                            </span>
                            {polje.obavezno && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Obavezno
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{polje.nazivPolja}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPolje(polje)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Uredi"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => movePolje(polje.poljeId, 'up')}
                            disabled={index === 0}
                            className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-50"
                            title="Pomeri gore"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => movePolje(polje.poljeId, 'down')}
                            disabled={index === localFormular.polja.length - 1}
                            className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-50"
                            title="Pomeri dole"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removePolje(polje.poljeId)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Obriši"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Otkaži
            </button>
            <button
              onClick={handleSave}
              disabled={!localFormular.naziv.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sačuvaj formular
            </button>
          </div>
        </div>
      </div>

      {/* Polje Editor Modal */}
      {editingPolje && (
        <PoljeEditor
          polje={editingPolje}
          onChange={updatePolje}
          onCancel={() => setEditingPolje(null)}
        />
      )}
    </div>
  );
};

export default FormularBuilder;
