'use client';

import React, { useState } from 'react';
import { OrganizacionaStruktura, OrganizacionaStrukturaSelection } from '@/types/wordTemplate';

interface OrganizacionaStrukturaSelectionStepProps {
    organizacionaStruktura: OrganizacionaStruktura[];
    selectedOrganizacionaStruktura: OrganizacionaStrukturaSelection | null;
    onOrganizacionaStrukturaSelect: (selection: OrganizacionaStrukturaSelection) => void;
}

const OrganizacionaStrukturaSelectionStep: React.FC<OrganizacionaStrukturaSelectionStepProps> = ({
    organizacionaStruktura,
    selectedOrganizacionaStruktura,
    onOrganizacionaStrukturaSelect
}) => {
    const [filter, setFilter] = useState('');

    const filterOrganizacionaStruktura = (organizacionaStruktura: OrganizacionaStruktura[], filter: string) => {
        if (!filter) return organizacionaStruktura;
        return organizacionaStruktura.filter(o => 
            o.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (o.opis && o.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };

    const filteredOrganizacionaStruktura = filterOrganizacionaStruktura(organizacionaStruktura, filter);

    const handleOrganizacionaStrukturaSelection = (org: OrganizacionaStruktura) => {
        const selection: OrganizacionaStrukturaSelection = {
            organizacionaStrukturaId: org.id,
            organizacionaStrukturaNaziv: org.naziv
        };
        onOrganizacionaStrukturaSelect(selection);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor organizacione strukture</h3>
                <p className="text-gray-600">Izaberite organizacionu strukturu (sekretar, podsekretar)</p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Organizaciona struktura ({filteredOrganizacionaStruktura.length})</h4>
                <input
                    type="text"
                    placeholder="Pretraži organizacionu strukturu..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredOrganizacionaStruktura.length > 0 ? filteredOrganizacionaStruktura.map((org, index) => (
                    <button
                        key={`org-${org.id || index}`}
                        onClick={() => handleOrganizacionaStrukturaSelection(org)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedOrganizacionaStruktura?.organizacionaStrukturaId === org.id
                                ? 'bg-blue-100 border-blue-500 text-blue-800'
                                : 'hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <div className="font-medium text-lg">{org.naziv}</div>
                        {org.opis && <div className="text-sm text-gray-500 mt-1">{org.opis}</div>}
                    </button>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        {filter ? 'Nema rezultata pretrage' : 'Nema organizacione strukture'}
                    </div>
                )}
            </div>

            {selectedOrganizacionaStruktura && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Izabrana organizaciona struktura:</h4>
                    <p className="text-blue-700">{selectedOrganizacionaStruktura.organizacionaStrukturaNaziv}</p>
                </div>
            )}
        </div>
    );
};

export default OrganizacionaStrukturaSelectionStep;
