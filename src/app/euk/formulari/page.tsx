"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import { KategorijaDto, FormularDto } from './types';
import FormularBuilder from './FormularBuilder';

export default function FormularManagement() {
  const { token, user } = useAuth();
  const [kategorije, setKategorije] = useState<KategorijaDto[]>([]);
  const [selectedKategorija, setSelectedKategorija] = useState<number | null>(null);
  const [formulari, setFormulari] = useState<FormularDto[]>([]);
  const [selectedFormular, setSelectedFormular] = useState<FormularDto | null>(null);
  const [mode, setMode] = useState<'list' | 'builder' | 'view'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKategorije();
  }, []);

  useEffect(() => {
    if (selectedKategorija) {
      fetchFormulari();
    }
  }, [selectedKategorija]);

  const fetchKategorije = async () => {
    try {
      const response = await fetch(`${apiService['baseURL']}/api/euk/kategorije`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Greška pri učitavanju kategorija');
      const data = await response.json();
      setKategorije(data);
    } catch (error) {
      console.error('Error fetching kategorije:', error);
      setError('Greška pri učitavanju kategorija');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormulari = async () => {
    if (!selectedKategorija) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${apiService['baseURL']}/api/euk/formulari/kategorija/${selectedKategorija}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Greška pri učitavanju formulare');
      const data = await response.json();
      setFormulari(data);
    } catch (error) {
      console.error('Error fetching formulari:', error);
      setError('Greška pri učitavanju formulare');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFormular = () => {
    const newFormular: FormularDto = {
      formularId: 0,
      naziv: '',
      opis: '',
      kategorijaId: selectedKategorija!,
      kategorijaNaziv: kategorije.find(k => k.kategorijaId === selectedKategorija)?.naziv || '',
      kategorijaSkracenica: kategorije.find(k => k.kategorijaId === selectedKategorija)?.skracenica || '',
      datumKreiranja: new Date().toISOString(),
      datumAzuriranja: new Date().toISOString(),
      aktivna: true,
      verzija: 1,
      createdById: user?.id || 0,
      createdByUsername: user?.username || '',
      updatedById: user?.id || 0,
      updatedByUsername: user?.username || '',
      polja: [],
      brojPolja: 0
    };
    setSelectedFormular(newFormular);
    setMode('builder');
  };

  const handleEditFormular = (formular: FormularDto) => {
    setSelectedFormular(formular);
    setMode('builder');
  };

  const handleViewFormular = (formular: FormularDto) => {
    setSelectedFormular(formular);
    setMode('view');
  };

  const handleSaveFormular = async (formular: FormularDto) => {
    try {
      const response = await fetch(`${apiService['baseURL']}/api/euk/formulari`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': (user?.id || 0).toString()
        },
        body: JSON.stringify(formular)
      });

      if (!response.ok) throw new Error('Greška pri čuvanju formulare');
      
      setMode('list');
      fetchFormulari();
    } catch (error) {
      console.error('Error saving formular:', error);
      setError('Greška pri čuvanju formulare');
    }
  };

  const handleDeleteFormular = async (formularId: number) => {
    if (!confirm('Da li ste sigurni da želite da obrišete formular?')) return;

    try {
      const response = await fetch(`${apiService['baseURL']}/api/euk/formulari/${formularId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': (user?.id || 0).toString()
        }
      });

      if (!response.ok) throw new Error('Greška pri brisanju formulare');
      
      fetchFormulari();
    } catch (error) {
      console.error('Error deleting formular:', error);
      setError('Greška pri brisanju formulare');
    }
  };

  if (loading && !selectedKategorija) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Učitavanje kategorija...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Formulare</h1>
          <p className="text-gray-600">Upravljanje dinamičkim formulare po kategorijama predmeta</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Kategorije */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorije</h3>
              <div className="space-y-2">
                {kategorije.map(kategorija => (
                  <button
                    key={kategorija.kategorijaId}
                    onClick={() => setSelectedKategorija(kategorija.kategorijaId)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                      selectedKategorija === kategorija.kategorijaId
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{kategorija.naziv}</div>
                    <div className="text-sm text-gray-500">{kategorija.skracenica}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {mode === 'builder' && selectedFormular ? (
              <FormularBuilder
                formular={selectedFormular}
                onSave={handleSaveFormular}
                onCancel={() => setMode('list')}
              />
            ) : !selectedKategorija ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Izaberite kategoriju</h3>
                <p className="text-gray-600">Izaberite kategoriju da vidite dostupne formulare</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {kategorije.find(k => k.kategorijaId === selectedKategorija)?.naziv} - Formulari
                    </h2>
                    <p className="text-gray-600">
                      {formulari.length} formulare dostupno
                    </p>
                  </div>
                  <button
                    onClick={handleCreateFormular}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Novi formular
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : formulari.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nema formulare</h3>
                      <p className="text-gray-600 mb-4">Za ovu kategoriju nema kreiranih formulare</p>
                      <button
                        onClick={handleCreateFormular}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Kreiraj prvi formular
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {formulari.map(formular => (
                        <div key={formular.formularId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">{formular.naziv}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewFormular(formular)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Pregled"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditFormular(formular)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Uredi"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteFormular(formular.formularId)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Obriši"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {formular.opis && (
                            <p className="text-gray-600 text-sm mb-4">{formular.opis}</p>
                          )}
                          
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex justify-between">
                              <span>Verzija:</span>
                              <span className="font-medium">{formular.verzija}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Polja:</span>
                              <span className="font-medium">{formular.brojPolja}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Kreiran:</span>
                              <span className="font-medium">
                                {new Date(formular.datumKreiranja).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={`font-medium ${formular.aktivna ? 'text-green-600' : 'text-red-600'}`}>
                                {formular.aktivna ? 'Aktivan' : 'Neaktivan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
