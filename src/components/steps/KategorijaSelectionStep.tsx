'use client';

import React, { useState } from 'react';
import { Kategorija, KategorijaSelection } from '@/types/wordTemplate';

interface KategorijaSelectionStepProps {
    kategorije: Kategorija[];
    selectedKategorija: KategorijaSelection | null;
    onKategorijaSelect: (selection: KategorijaSelection) => void;
}

const KategorijaSelectionStep: React.FC<KategorijaSelectionStepProps> = ({
    kategorije,
    selectedKategorija,
    onKategorijaSelect
}) => {
    const [filter, setFilter] = useState('');

    const filterKategorije = (kategorije: Kategorija[], filter: string) => {
        if (!filter) return kategorije;
        return kategorije.filter(k => 
            k.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (k.opis && k.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };

    const filteredKategorije = filterKategorije(kategorije, filter);

    const handleKategorijaSelection = (kategorija: Kategorija) => {
        const selection: KategorijaSelection = {
            kategorijaId: kategorija.id,
            kategorijaNaziv: kategorija.naziv
        };
        onKategorijaSelect(selection);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor kategorije</h3>
                <p className="text-gray-600">Izaberite kategoriju za rešenje</p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Kategorije ({filteredKategorije.length})</h4>
                <input
                    type="text"
                    placeholder="Pretraži kategorije..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredKategorije.length > 0 ? filteredKategorije.map((kategorija, index) => (
                    <button
                        key={`kategorija-${kategorija.id || index}`}
                        onClick={() => handleKategorijaSelection(kategorija)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedKategorija?.kategorijaId === kategorija.id
                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                : 'hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="font-medium text-lg">{kategorija.naziv}</div>
                        {kategorija.opis && <div className="text-sm text-gray-500 mt-1">{kategorija.opis}</div>}
                    </button>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        {filter ? 'Nema rezultata pretrage' : 'Nema kategorija'}
                    </div>
                )}
            </div>

            {selectedKategorija && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Izabrana kategorija:</h4>
                    <p className="text-blue-700">{selectedKategorija.kategorijaNaziv}</p>
                </div>
            )}
        </div>
    );
};

export default KategorijaSelectionStep;
