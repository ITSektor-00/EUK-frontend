'use client';

import React, { useState, useEffect } from 'react';
import { templateService } from '@/services/templateService';
import { Lice, Kategorija, ObrasciVrste, OrganizacionaStruktura } from '@/types/template';

const TemplateTestComponent: React.FC = () => {
    const [t1Lice, setT1Lice] = useState<Lice[]>([]);
    const [t2Lice, setT2Lice] = useState<Lice[]>([]);
    const [kategorije, setKategorije] = useState<Kategorija[]>([]);
    const [obrasciVrste, setObrasciVrste] = useState<ObrasciVrste[]>([]);
    const [organizacionaStruktura, setOrganizacionaStruktura] = useState<OrganizacionaStruktura[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('Testing template service...');
            
            const [t1Data, t2Data, kategorijeData, obrasciData, organizacionaData] = await Promise.all([
                templateService.getLice('t1'),
                templateService.getLice('t2'),
                templateService.getKategorije(),
                templateService.getObrasciVrste(),
                templateService.getOrganizacionaStruktura()
            ]);

            console.log('Test results:', {
                t1Data,
                t2Data,
                kategorijeData,
                obrasciData,
                organizacionaData
            });

            const t1Array = Array.isArray(t1Data) ? t1Data : [];
            const t2Array = Array.isArray(t2Data) ? t2Data : [];
            const kategorijeArray = Array.isArray(kategorijeData) ? kategorijeData : [];
            const obrasciArray = Array.isArray(obrasciData) ? obrasciData : [];
            const organizacionaArray = Array.isArray(organizacionaData) ? organizacionaData : [];

            console.log('Setting state with arrays:', {
                t1Array: t1Array.length,
                t2Array: t2Array.length,
                kategorijeArray: kategorijeArray.length,
                obrasciArray: obrasciArray.length,
                organizacionaArray: organizacionaArray.length
            });

            setT1Lice(t1Array);
            setT2Lice(t2Array);
            setKategorije(kategorijeArray);
            setObrasciVrste(obrasciArray);
            setOrganizacionaStruktura(organizacionaArray);
        } catch (error) {
            console.error('Error in test:', error);
            setError('Greška u testu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Testiranje podataka...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Greška: {error}</div>;
    }

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Template Service Test</h3>
            
            <div>
                <h4 className="font-medium">T1 Lice ({t1Lice.length})</h4>
                <div className="space-y-1">
                    {t1Lice.map((lice) => (
                        <div key={lice.id} className="text-sm">
                            {lice.ime} {lice.prezime} ({lice.tip})
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium">T2 Lice ({t2Lice.length})</h4>
                <div className="space-y-1">
                    {t2Lice.map((lice) => (
                        <div key={lice.id} className="text-sm">
                            {lice.ime} {lice.prezime} ({lice.tip})
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium">Kategorije ({kategorije.length})</h4>
                <div className="space-y-1">
                    {kategorije.map((kat) => (
                        <div key={kat.id} className="text-sm">
                            {kat.naziv}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium">Obrasci Vrste ({obrasciVrste.length})</h4>
                <div className="space-y-1">
                    {obrasciVrste.map((obrasci) => (
                        <div key={obrasci.id} className="text-sm">
                            {obrasci.naziv}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-medium">Organizaciona Struktura ({organizacionaStruktura.length})</h4>
                <div className="space-y-1">
                    {organizacionaStruktura.map((org) => (
                        <div key={org.id} className="text-sm">
                            {org.naziv}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateTestComponent;
