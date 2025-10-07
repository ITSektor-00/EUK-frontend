'use client';

import React, { useState, useEffect } from 'react';
import { 
    TemplateFormData, 
    LiceSelection, 
    KategorijaSelection, 
    ObrasciVrsteSelection, 
    OrganizacionaStrukturaSelection,
    TemplateStep,
    Lice,
    Kategorija,
    ObrasciVrste,
    OrganizacionaStruktura
} from '@/types/template';
import { templateService } from '@/services/templateService';
import adaptiveTemplateService from '@/services/adaptiveTemplateService';
import AuthUtils from '@/utils/authUtils';

interface TemplateGenerationFormProps {
    onTemplateGenerated?: (response: any) => void;
}

const TemplateGenerationForm: React.FC<TemplateGenerationFormProps> = ({ onTemplateGenerated }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [serviceStats, setServiceStats] = useState<any>(null);
    const [authStatus, setAuthStatus] = useState<any>(null);
    
    // Filter states
    const [t1Filter, setT1Filter] = useState('');
    const [t2Filter, setT2Filter] = useState('');
    const [kategorijeFilter, setKategorijeFilter] = useState('');
    const [organizacionaFilter, setOrganizacionaFilter] = useState('');

    // Form data state
    const [formData, setFormData] = useState<TemplateFormData>({
        liceSelection: null,
        kategorijaSelection: null,
        obrasciVrsteSelection: null, // Zadržavamo ali ne koristimo
        organizacionaStrukturaSelection: null,
        predmetId: null,
    });

    // Data for dropdowns
    const [t1Lice, setT1Lice] = useState<Lice[]>([]);
    const [t2Lice, setT2Lice] = useState<Lice[]>([]);
    const [kategorije, setKategorije] = useState<Kategorija[]>([]);
    const [obrasciVrste, setObrasciVrste] = useState<ObrasciVrste[]>([]);
    const [organizacionaStruktura, setOrganizacionaStruktura] = useState<OrganizacionaStruktura[]>([]);

    // Steps configuration
    const steps: TemplateStep[] = [
        { title: 'Izbor lice', description: 'Izaberite lice iz t1 ili t2 tabele', completed: false, active: true },
        { title: 'Izbor kategorije', description: 'Izaberite kategoriju', completed: false, active: false },
        { title: 'Organizaciona struktura', description: 'Izaberite organizacionu strukturu', completed: false, active: false },
        { title: 'Generisanje', description: 'Generiši template', completed: false, active: false }
    ];

    // Load initial data
    useEffect(() => {
        // Proveri auth status
        setAuthStatus(AuthUtils.getTokenInfo());
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            console.log('Loading initial data with adaptive service...');
            
            // Koristi adaptive servis za loading svih podataka
            const allData = await adaptiveTemplateService.loadAllData();
            
            console.log('Loaded all data:', allData);
            
            // Ekstraktuj podatke
            const t1Data = Array.isArray(allData.t1Lice) ? allData.t1Lice : [];
            const t2Data = Array.isArray(allData.t2Lice) ? allData.t2Lice : [];
            const kategorijeData = Array.isArray(allData.kategorije) ? allData.kategorije : [];
            const obrasciData = Array.isArray(allData.obrasciVrste) ? allData.obrasciVrste : [];
            const organizacionaData = Array.isArray(allData.organizacionaStruktura) ? allData.organizacionaStruktura : [];

            console.log('Loaded data summary:', {
                t1Count: t1Data.length,
                t2Count: t2Data.length,
                kategorijeCount: kategorijeData.length,
                obrasciCount: obrasciData.length,
                organizacionaCount: organizacionaData.length
            });
            
            // Proveri strukturu prvog elementa
            if (t1Data.length > 0) {
                console.log('First T1 lice structure:', t1Data[0]);
                console.log('First T1 lice keys:', Object.keys(t1Data[0]));
            }
            if (t2Data.length > 0) {
                console.log('First T2 lice structure:', t2Data[0]);
                console.log('First T2 lice keys:', Object.keys(t2Data[0]));
            }

            // Ensure all data is arrays
            let t1Array = [];
            let t2Array = [];

            if (Array.isArray(t1Data)) {
                t1Array = t1Data;
            } else if (t1Data && (t1Data as any).data && Array.isArray((t1Data as any).data)) {
                t1Array = (t1Data as any).data;
            } else if (t1Data && (t1Data as any).results && Array.isArray((t1Data as any).results)) {
                t1Array = (t1Data as any).results;
            } else if (t1Data && (t1Data as any).items && Array.isArray((t1Data as any).items)) {
                t1Array = (t1Data as any).items;
            } else if (t1Data && (t1Data as any).content && Array.isArray((t1Data as any).content)) {
                t1Array = (t1Data as any).content;
            }

            if (Array.isArray(t2Data)) {
                t2Array = t2Data;
            } else if (t2Data && (t2Data as any).data && Array.isArray((t2Data as any).data)) {
                t2Array = (t2Data as any).data;
            } else if (t2Data && (t2Data as any).results && Array.isArray((t2Data as any).results)) {
                t2Array = (t2Data as any).results;
            } else if (t2Data && (t2Data as any).items && Array.isArray((t2Data as any).items)) {
                t2Array = (t2Data as any).items;
            } else if (t2Data && (t2Data as any).content && Array.isArray((t2Data as any).content)) {
                t2Array = (t2Data as any).content;
            }

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

            console.log('Total loaded data:', {
                totalT1Lice: t1Array.length,
                totalT2Lice: t2Array.length,
                totalKategorije: kategorijeArray.length,
                totalObrasciVrste: obrasciArray.length,
                totalOrganizacionaStruktura: organizacionaArray.length
            });

            console.log('Final arrays content:', {
                t1Array: t1Array,
                t2Array: t2Array
            });

            // Validacija podataka
            console.log('Data validation:', {
                t1ArrayValid: t1Array.every((l: any) => l.id !== undefined),   
                t2ArrayValid: t2Array.every((l: any) => l.id !== undefined),   
                t1ArrayWithUndefinedIds: t1Array.filter((l: any) => l.id === undefined).length,                                                               
                t2ArrayWithUndefinedIds: t2Array.filter((l: any) => l.id === undefined).length                                                                 
            });

            // Filtriraj podatke bez ID-a i dodaj fallback ID
            const validT1Array = t1Array.map((l: any, index: number) => ({
                ...l,
                id: l.id || l.ID || l.liceId || index + 1 // Fallback na različite ID svojstva
            }));
            const validT2Array = t2Array.map((l: any, index: number) => ({
                ...l,
                id: l.id || l.ID || l.liceId || index + 1 // Fallback na različite ID svojstva
            }));

            console.log('Filtered valid data:', {
                validT1Count: validT1Array.length,
                validT2Count: validT2Array.length,
                removedT1Count: t1Array.length - validT1Array.length,
                removedT2Count: t2Array.length - validT2Array.length
            });

            // Proveri da li su ID-ovi sada validni
            console.log('ID validation after mapping:', {
                t1ArrayValid: validT1Array.every((l: any) => l.id !== undefined),                                                                              
                t2ArrayValid: validT2Array.every((l: any) => l.id !== undefined),                                                                              
                firstT1Id: validT1Array[0]?.id,
                firstT2Id: validT2Array[0]?.id
            });

            console.log('Setting kategorije:', kategorijeArray);
            console.log('First kategorija:', kategorijeArray[0]);
            
            setT1Lice(validT1Array);
            setT2Lice(validT2Array);
            setKategorije(kategorijeArray);
            setObrasciVrste(obrasciArray);
            setOrganizacionaStruktura(organizacionaArray);
            
            // Ažuriraj statistike servisa
            setServiceStats(adaptiveTemplateService.getServiceStats());
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Greška pri učitavanju podataka');
            // Set empty arrays as fallback
            setT1Lice([]);
            setT2Lice([]);
            setKategorije([]);
            setObrasciVrste([]);
            setOrganizacionaStruktura([]);
            
            // Ažuriraj statistike servisa i u slučaju greške
            setServiceStats(adaptiveTemplateService.getServiceStats());
        } finally {
            setLoading(false);
        }
    };

    const handleResetService = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Resetting service...');
            
            const success = await adaptiveTemplateService.resetAndRetry();
            if (success) {
                setSuccess('Servis je uspešno resetovan i vraćen na optimizovani mod');
                // Ponovo učitaj podatke
                await loadInitialData();
            } else {
                setError('Servis je resetovan, ali i dalje koristi fallback mod');
                setServiceStats(adaptiveTemplateService.getServiceStats());
            }
        } catch (error) {
            console.error('Error resetting service:', error);
            setError('Greška pri resetovanju servisa');
        } finally {
            setLoading(false);
        }
    };

    const handleLiceSelection = (lice: Lice, tip: 't1' | 't2') => {
        console.log('Selected lice:', lice);
        console.log('Lice tip:', tip);
        
        // Za T1 lice koristi ugrozenoLiceId, za T2 koristi id
        const liceId = tip === 't1' ? (lice as any).ugrozenoLiceId || lice.id : lice.id;
        
        const selection: LiceSelection = {
            liceId: liceId,
            liceTip: tip,
            liceNaziv: `${lice.ime} ${lice.prezime}`
        };
        
        console.log('Created lice selection:', selection);
        
        setFormData(prev => ({ ...prev, liceSelection: selection }));
        setCurrentStep(1);
    };

    const handleKategorijaSelection = (kategorija: Kategorija) => {
        console.log('Selected kategorija:', kategorija);
        const selection: KategorijaSelection = {
            kategorijaId: kategorija.id, // Koristi id
            kategorijaNaziv: kategorija.naziv
        };
        console.log('Created kategorija selection:', selection);
        
        setFormData(prev => ({ ...prev, kategorijaSelection: selection }));
        setCurrentStep(2); // Idemo direktno na organizacionu strukturu
    };


    const handleOrganizacionaStrukturaSelection = (organizaciona: OrganizacionaStruktura) => {
        const selection: OrganizacionaStrukturaSelection = {
            organizacionaStrukturaId: organizaciona.id,
            organizacionaStrukturaNaziv: organizaciona.naziv
        };
        
        setFormData(prev => ({ ...prev, organizacionaStrukturaSelection: selection }));
        setCurrentStep(3); // Idemo direktno na korak generisanja
    };


    const handleGenerateTemplate = async () => {
        if (!formData.liceSelection || !formData.kategorijaSelection || 
            !formData.organizacionaStrukturaSelection) {
            setError('Molimo popunite sve potrebne podatke');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Form data:', formData);
            console.log('Lice selection:', formData.liceSelection);
            console.log('Kategorija selection:', formData.kategorijaSelection);
            
            const request = {
                liceId: formData.liceSelection.liceId,
                liceTip: formData.liceSelection.liceTip,
                kategorijaId: formData.kategorijaSelection.kategorijaId,
                obrasciVrsteId: 1, // Default obrasci vrste ID jer je korak uklonjen
                organizacionaStrukturaId: formData.organizacionaStrukturaSelection.organizacionaStrukturaId,
                predmetId: 1 // Default predmet ID jer je korak sa predmetima uklonjen
            };
            
            console.log('Generated request:', request);

            const response = await templateService.generateTemplate(request);
            
            setSuccess('Template je uspešno generisan!');
            onTemplateGenerated?.(response);
        } catch (error) {
            console.error('Error generating template:', error);
            setError('Greška pri generisanju template-a');
        } finally {
            setLoading(false);
        }
    };

    // Filter functions
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

    const filterKategorije = (kategorije: Kategorija[], filter: string) => {
        if (!filter) return kategorije;
        return kategorije.filter(k => 
            k.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (k.opis && k.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };


    const filterOrganizacionaStruktura = (organizaciona: OrganizacionaStruktura[], filter: string) => {
        if (!filter) return organizaciona;
        return organizaciona.filter(o => 
            o.naziv.toLowerCase().includes(filter.toLowerCase()) ||
            (o.opis && o.opis.toLowerCase().includes(filter.toLowerCase()))
        );
    };


    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                const filteredT1Lice = filterLice(t1Lice, t1Filter);
                const filteredT2Lice = filterLice(t2Lice, t2Filter);
                
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Izbor lice</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">T1 lice ({filteredT1Lice.length})</h4>
                                    <input
                                        type="text"
                                        placeholder="Pretraži po imenu, prezimenu ili JMBG..."
                                        value={t1Filter}
                                        onChange={(e) => setT1Filter(e.target.value)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {filteredT1Lice.length > 0 ? filteredT1Lice.map((lice, index) => (
                                        <button
                                            key={`t1-${lice.id || index}`}
                                            onClick={() => handleLiceSelection(lice, 't1')}
                                            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
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
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">T2 lice ({filteredT2Lice.length})</h4>
                                    <input
                                        type="text"
                                        placeholder="Pretraži po imenu, prezimenu ili JMBG..."
                                        value={t2Filter}
                                        onChange={(e) => setT2Filter(e.target.value)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {filteredT2Lice.length > 0 ? filteredT2Lice.map((lice, index) => (
                                        <button
                                            key={`t2-${lice.id || index}`}
                                            onClick={() => handleLiceSelection(lice, 't2')}
                                            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
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
                    </div>
                );

            case 1:
                const filteredKategorije = filterKategorije(kategorije, kategorijeFilter);
                
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Izbor kategorije</h3>
                            <input
                                type="text"
                                placeholder="Pretraži kategorije..."
                                value={kategorijeFilter}
                                onChange={(e) => setKategorijeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            Prikazano {filteredKategorije.length} od {kategorije.length} kategorija
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredKategorije.length > 0 ? filteredKategorije.map((kategorija, index) => (
                                <button
                                    key={`kategorija-${kategorija.id || index}`}
                                    onClick={() => handleKategorijaSelection(kategorija)}
                                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="font-medium">{kategorija.naziv}</div>
                                    {kategorija.opis && <div className="text-sm text-gray-500">{kategorija.opis}</div>}
                                </button>
                            )) : (
                                <div className="text-center py-4 text-gray-500">
                                    {kategorijeFilter ? 'Nema rezultata pretrage' : 'Nema kategorija'}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 2:
                const filteredOrganizacionaStruktura = filterOrganizacionaStruktura(organizacionaStruktura, organizacionaFilter);
                
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Izbor organizacione strukture</h3>
                            <input
                                type="text"
                                placeholder="Pretraži organizacionu strukturu..."
                                value={organizacionaFilter}
                                onChange={(e) => setOrganizacionaFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            Prikazano {filteredOrganizacionaStruktura.length} od {organizacionaStruktura.length} organizacione strukture
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {filteredOrganizacionaStruktura.length > 0 ? filteredOrganizacionaStruktura.map((org, index) => (
                                <button
                                    key={`org-${org.id || index}`}
                                    onClick={() => handleOrganizacionaStrukturaSelection(org)}
                                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="font-medium">{org.naziv}</div>
                                    {org.opis && <div className="text-sm text-gray-500">{org.opis}</div>}
                                </button>
                            )) : (
                                <div className="text-center py-4 text-gray-500">
                                    {organizacionaFilter ? 'Nema rezultata pretrage' : 'Nema organizacione strukture'}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Generisanje Template-a</h3>
                            <p className="text-gray-600">Svi potrebni podaci su izabrani. Kliknite dugme ispod da generišete template.</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold mb-4">Pregled izabranih podataka:</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-medium">Lice:</span>
                                    <span>{formData.liceSelection?.liceTip === 't1' ? 'T1' : 'T2'} - {formData.liceSelection?.liceId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Kategorija:</span>
                                    <span>{formData.kategorijaSelection?.kategorijaId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Obrasci vrste:</span>
                                    <span>Default (1)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Organizaciona struktura:</span>
                                    <span>{formData.organizacionaStrukturaSelection?.organizacionaStrukturaId}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <button
                                onClick={handleGenerateTemplate}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                            >
                                {loading ? 'Generiše se...' : 'Generiši Template'}
                            </button>
                        </div>
                    </div>
                );


            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Učitavanje svih podataka...</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Učitavamo sva lice iz baze podataka. Molimo sačekajte...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Generisanje Template Rešenja</h2>
                <p className="text-gray-600 text-lg">Izaberite potrebne podatke za generisanje template-a</p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                index <= currentStep 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                    : 'border-gray-300 text-gray-500 bg-gray-100'
                            }`}>
                                {index + 1}
                            </div>
                            <div className="ml-4">
                                <div className={`text-sm font-semibold ${
                                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-400">{step.description}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-20 h-1 mx-6 rounded-full transition-all duration-300 ${
                                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Authentication Status */}
            {authStatus && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-800">Status autentifikacije:</h4>
                            <p className={`text-sm ${authStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                {authStatus.isValid ? '✅ Validan token' : '❌ Nevalidan ili nedostaje token'}
                            </p>
                            {authStatus.expiresAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Ističe: {authStatus.expiresAt.toLocaleString()}
                                </p>
                            )}
                            {authStatus.userId && (
                                <p className="text-xs text-gray-500">
                                    User ID: {authStatus.userId}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setAuthStatus(AuthUtils.getTokenInfo());
                                AuthUtils.logAuthStatus();
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                        >
                            Proveri ponovo
                        </button>
                    </div>
                </div>
            )}

            {/* Service Status */}
            {serviceStats && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-blue-800">Status servisa:</h4>
                            <p className="text-blue-700">
                                {serviceStats.currentService === 'optimized' ? 'Optimizovani servis (live podaci)' : 'Fallback servis (mock podaci)'}
                            </p>
                            {serviceStats.fallbackTriggered && (
                                <p className="text-sm text-orange-600 mt-1">
                                    ⚠️ Prebačeno na fallback zbog grešaka sa serverom
                                </p>
                            )}
                        </div>
                        {serviceStats.fallbackTriggered && (
                            <button
                                onClick={handleResetService}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                {loading ? 'Resetuje...' : 'Resetuj servis'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Error/Success Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    ← Nazad
                </button>
                
                {currentStep < 3 && (
                    <button
                        onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                        disabled={!canProceedToNext()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        Dalje →
                    </button>
                )}
            </div>
        </div>
    );

    function canProceedToNext(): boolean {
        switch (currentStep) {
            case 0: return formData.liceSelection !== null;
            case 1: return formData.kategorijaSelection !== null;
            case 2: return formData.organizacionaStrukturaSelection !== null;
            case 3: return true; // Korak 3 je uvek završen jer je to korak generisanja
            default: return false;
        }
    }
};

export default TemplateGenerationForm;
