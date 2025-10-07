'use client';

import React, { useState } from 'react';
import { Lice, LiceSelection } from '@/types/wordTemplate';

interface LiceSelectionStepProps {
    t1Lice: Lice[];
    t2Lice: Lice[];
    selectedLice: LiceSelection | null;
    onLiceSelect: (selection: LiceSelection) => void;
}

const LiceSelectionStep: React.FC<LiceSelectionStepProps> = ({
    t1Lice,
    t2Lice,
    selectedLice,
    onLiceSelect
}) => {
    const [t1Filter, setT1Filter] = useState('');
    const [t2Filter, setT2Filter] = useState('');

    const filterLice = (lice: Lice[], filter: string) => {
        if (!filter) return lice;
        const searchTerm = filter.toLowerCase();
        return lice.filter(l => {
            const fullName = `${l.ime} ${l.prezime}`.toLowerCase();
            return fullName.includes(searchTerm) ||
                   l.ime.toLowerCase().includes(searchTerm) ||
                   l.prezime.toLowerCase().includes(searchTerm) ||
                   (l.jmbg && l.jmbg.includes(filter));
        });
    };

    const filteredT1Lice = filterLice(t1Lice, t1Filter);
    const filteredT2Lice = filterLice(t2Lice, t2Filter);

    const handleLiceSelection = (lice: Lice, tip: 't1' | 't2') => {
        const selection: LiceSelection = {
            liceId: lice.id,
            liceTip: tip,
            liceNaziv: `${lice.ime} ${lice.prezime}`
        };
        onLiceSelect(selection);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor lice</h3>
                <p className="text-gray-600">Izaberite lice iz T1 ili T2 tabele</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* T1 Lice */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">T1 lice ({filteredT1Lice.length})</h4>
                        <input
                            type="text"
                            placeholder="Pretraži po imenu, prezimenu ili JMBG..."
                            value={t1Filter}
                            onChange={(e) => setT1Filter(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredT1Lice.length > 0 ? filteredT1Lice.map((lice, index) => (
                            <button
                                key={`t1-${lice.id || index}`}
                                onClick={() => handleLiceSelection(lice, 't1')}
                                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                                    selectedLice?.liceId === lice.id && selectedLice?.liceTip === 't1'
                                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                                        : 'hover:bg-gray-100 border-gray-300'
                                }`}
                            >
                                <div className="font-medium">{lice.ime} {lice.prezime}</div>
                                {lice.jmbg && <div className="text-sm text-gray-500">JMBG: {lice.jmbg}</div>}
                            </button>
                        )) : (
                            <div className="text-center py-4 text-gray-500">
                                {t1Filter ? 'Nema rezultata pretrage' : 'Nema T1 lice'}
                            </div>
                        )}
                    </div>
                </div>

                {/* T2 Lice */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">T2 lice ({filteredT2Lice.length})</h4>
                        <input
                            type="text"
                            placeholder="Pretraži po imenu, prezimenu ili JMBG..."
                            value={t2Filter}
                            onChange={(e) => setT2Filter(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredT2Lice.length > 0 ? filteredT2Lice.map((lice, index) => (
                            <button
                                key={`t2-${lice.id || index}`}
                                onClick={() => handleLiceSelection(lice, 't2')}
                                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                                    selectedLice?.liceId === lice.id && selectedLice?.liceTip === 't2'
                                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                                        : 'hover:bg-gray-100 border-gray-300'
                                }`}
                            >
                                <div className="font-medium">{lice.ime} {lice.prezime}</div>
                                {lice.jmbg && <div className="text-sm text-gray-500">JMBG: {lice.jmbg}</div>}
                            </button>
                        )) : (
                            <div className="text-center py-4 text-gray-500">
                                {t2Filter ? 'Nema rezultata pretrage' : 'Nema T2 lice'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedLice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Izabrano lice:</h4>
                    <p className="text-blue-700">
                        {selectedLice.liceNaziv} ({selectedLice.liceTip.toUpperCase()})
                    </p>
                </div>
            )}
        </div>
    );
};

export default LiceSelectionStep;
