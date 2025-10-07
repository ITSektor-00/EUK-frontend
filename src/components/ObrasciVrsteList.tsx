'use client';

import React, { useState, useEffect } from 'react';
import { ObrasciVrste } from '@/types/template';
import { templateService } from '@/services/templateService';

interface ObrasciVrsteListProps {
    onSelectionChange?: (obrasci: ObrasciVrste | null) => void;
    selectedId?: number;
}

const ObrasciVrsteList: React.FC<ObrasciVrsteListProps> = ({ onSelectionChange, selectedId }) => {
    const [obrasciVrste, setObrasciVrste] = useState<ObrasciVrste[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        naziv: '',
        opis: ''
    });

    useEffect(() => {
        loadObrasciVrste();
    }, []);

    const loadObrasciVrste = async () => {
        try {
            setLoading(true);
            const data = await templateService.getObrasciVrste();
            setObrasciVrste(data);
        } catch (error) {
            console.error('Error loading obrasci vrste:', error);
            setError('Greška pri učitavanju obrasci vrste');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            if (!formData.naziv.trim()) {
                setError('Naziv je obavezan');
                return;
            }

            await templateService.createObrasciVrste({
                naziv: formData.naziv.trim(),
                opis: formData.opis.trim()
            });

            setFormData({ naziv: '', opis: '' });
            setShowAddForm(false);
            await loadObrasciVrste();
        } catch (error) {
            console.error('Error adding obrasci vrste:', error);
            setError('Greška pri dodavanju obrasci vrste');
        }
    };

    const handleEdit = async (id: number) => {
        try {
            if (!formData.naziv.trim()) {
                setError('Naziv je obavezan');
                return;
            }

            await templateService.updateObrasciVrste(id, {
                naziv: formData.naziv.trim(),
                opis: formData.opis.trim()
            });

            setEditingId(null);
            setFormData({ naziv: '', opis: '' });
            await loadObrasciVrste();
        } catch (error) {
            console.error('Error updating obrasci vrste:', error);
            setError('Greška pri ažuriranju obrasci vrste');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu obrasci vrste?')) {
            return;
        }

        try {
            await templateService.deleteObrasciVrste(id);
            await loadObrasciVrste();
        } catch (error) {
            console.error('Error deleting obrasci vrste:', error);
            setError('Greška pri brisanju obrasci vrste');
        }
    };

    const startEdit = (obrasci: ObrasciVrste) => {
        setEditingId(obrasci.id);
        setFormData({
            naziv: obrasci.naziv,
            opis: obrasci.opis
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ naziv: '', opis: '' });
    };

    const startAdd = () => {
        setShowAddForm(true);
        setFormData({ naziv: '', opis: '' });
    };

    const cancelAdd = () => {
        setShowAddForm(false);
        setFormData({ naziv: '', opis: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Učitavanje obrasci vrste...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Obrasci Vrste</h3>
                <button
                    onClick={startAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Dodaj novu
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Dodaj novu obrasci vrste</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Naziv *
                            </label>
                            <input
                                type="text"
                                value={formData.naziv}
                                onChange={(e) => setFormData(prev => ({ ...prev, naziv: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Unesite naziv"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Opis
                            </label>
                            <textarea
                                value={formData.opis}
                                onChange={(e) => setFormData(prev => ({ ...prev, opis: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Unesite opis"
                                rows={3}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleAdd}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Dodaj
                            </button>
                            <button
                                onClick={cancelAdd}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Otkaži
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-2">
                {obrasciVrste.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nema obrasci vrste
                    </div>
                ) : (
                    obrasciVrste.map((obrasci) => (
                        <div
                            key={obrasci.id}
                            className={`p-4 border rounded-lg ${
                                selectedId === obrasci.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {editingId === obrasci.id ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Naziv *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.naziv}
                                            onChange={(e) => setFormData(prev => ({ ...prev, naziv: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Opis
                                        </label>
                                        <textarea
                                            value={formData.opis}
                                            onChange={(e) => setFormData(prev => ({ ...prev, opis: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(obrasci.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Sačuvaj
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                        >
                                            Otkaži
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onSelectionChange?.(obrasci)}
                                                className={`text-left ${
                                                    selectedId === obrasci.id 
                                                        ? 'text-blue-600 font-medium' 
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                <h4 className="font-medium">{obrasci.naziv}</h4>
                                            </button>
                                            {selectedId === obrasci.id && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Izabrano
                                                </span>
                                            )}
                                        </div>
                                        {obrasci.opis && (
                                            <p className="text-sm text-gray-600 mt-1">{obrasci.opis}</p>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Kreiran: {new Date(obrasci.createdAt).toLocaleDateString('sr-RS')}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => startEdit(obrasci)}
                                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            Uredi
                                        </button>
                                        <button
                                            onClick={() => handleDelete(obrasci.id)}
                                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            Obriši
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ObrasciVrsteList;
