'use client';

import React, { useState } from 'react';
import { Predmet, PredmetSelection } from '@/types/wordTemplate';

interface PredmetSelectionStepProps {
    predmeti: Predmet[];
    selectedPredmet: PredmetSelection | null;
    onPredmetSelect: (selection: PredmetSelection) => void;
}

const PredmetSelectionStep: React.FC<PredmetSelectionStepProps> = ({
    predmeti,
    selectedPredmet,
    onPredmetSelect
}) => {
    const [filter, setFilter] = useState('');

    const filterPredmeti = (predmeti: Predmet[], filter: string) => {
        if (!filter) return predmeti;
        return predmeti.filter(p => 
            p.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (p.opis && p.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };

    const filteredPredmeti = filterPredmeti(predmeti, filter);

    const handlePredmetSelection = (predmet: Predmet) => {
        const selection: PredmetSelection = {
            predmetId: predmet.id,
            predmetNaziv: predmet.naziv
        };
        onPredmetSelect(selection);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor predmeta</h3>
                <p className="text-gray-600">Izaberite predmet za rešenje</p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Predmeti ({filteredPredmeti.length})</h4>
                <input
                    type="text"
                    placeholder="Pretraži predmete..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredPredmeti.length > 0 ? filteredPredmeti.map((predmet, index) => (
                    <button
                        key={`predmet-${predmet.id || index}`}
                        onClick={() => handlePredmetSelection(predmet)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedPredmet?.predmetId === predmet.id
                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                : 'hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="font-medium text-lg">{predmet.naziv}</div>
                        {predmet.opis && <div className="text-sm text-gray-500 mt-1">{predmet.opis}</div>}
                    </button>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        {filter ? 'Nema rezultata pretrage' : 'Nema predmeta'}
                    </div>
                )}
            </div>

            {selectedPredmet && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Izabran predmet:</h4>
                    <p className="text-blue-700">{selectedPredmet.predmetNaziv}</p>
                </div>
            )}
        </div>
    );
};

export default PredmetSelectionStep;
