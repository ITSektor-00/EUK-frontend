'use client';

import React, { useState } from 'react';
import { ObrasciVrste, ObrasciVrsteSelection } from '@/types/wordTemplate';

interface ObrasciVrsteSelectionStepProps {
    obrasciVrste: ObrasciVrste[];
    selectedObrasciVrste: ObrasciVrsteSelection | null;
    onObrasciVrsteSelect: (selection: ObrasciVrsteSelection) => void;
}

const ObrasciVrsteSelectionStep: React.FC<ObrasciVrsteSelectionStepProps> = ({
    obrasciVrste,
    selectedObrasciVrste,
    onObrasciVrsteSelect
}) => {
    const [filter, setFilter] = useState('');

    const filterObrasciVrste = (obrasciVrste: ObrasciVrste[], filter: string) => {
        if (!filter) return obrasciVrste;
        return obrasciVrste.filter(o => 
            o.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (o.opis && o.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };

    const filteredObrasciVrste = filterObrasciVrste(obrasciVrste, filter);

    const handleObrasciVrsteSelection = (obrasci: ObrasciVrste) => {
        const selection: ObrasciVrsteSelection = {
            obrasciVrsteId: obrasci.id,
            obrasciVrsteNaziv: obrasci.naziv
        };
        onObrasciVrsteSelect(selection);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor obrasci vrste</h3>
                <p className="text-gray-600">Izaberite tip obraza (negativno, neograničeno, ograničeno, borci, penzioneri, obustave)</p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Obrasci vrste ({filteredObrasciVrste.length})</h4>
                <input
                    type="text"
                    placeholder="Pretraži obrasci vrste..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredObrasciVrste.length > 0 ? filteredObrasciVrste.map((obrasci, index) => (
                    <button
                        key={`obrasci-${obrasci.id || index}`}
                        onClick={() => handleObrasciVrsteSelection(obrasci)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedObrasciVrste?.obrasciVrsteId === obrasci.id
                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                : 'hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="font-medium text-lg">{obrasci.naziv}</div>
                        {obrasci.opis && <div className="text-sm text-gray-500 mt-1">{obrasci.opis}</div>}
                    </button>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        {filter ? 'Nema rezultata pretrage' : 'Nema obrasci vrste'}
                    </div>
                )}
            </div>

            {selectedObrasciVrste && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Izabran obrasci vrste:</h4>
                    <p className="text-blue-700">{selectedObrasciVrste.obrasciVrsteNaziv}</p>
                </div>
            )}
        </div>
    );
};

export default ObrasciVrsteSelectionStep;
