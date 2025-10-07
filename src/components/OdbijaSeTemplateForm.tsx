'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
    OdbijaSeTemplateRequest, 
    OdbijaSeManualData, 
    Lice, 
    Kategorija, 
    ObrasciVrste, 
    OrganizacionaStruktura, 
    Predmet 
} from '@/types/odbijaSeTemplate';
import templateServiceFactory from '@/services/templateServiceFactory';
import '@/styles/optimized-template.css';

const OdbijaSeTemplateForm: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState<OdbijaSeTemplateRequest>({
        liceId: 0,
        liceTip: 't1',
        kategorijaId: 0,
        obrasciVrsteId: 0,
        organizacionaStrukturaId: 0,
        predmetId: 0,
        manualData: {
            predmet: '',
            datumDonosenjaResenja: '',
            brojResenja: '',
            datumOvlastenja: '',
            datumPodnosenja: '',
            imePrezimeLica: '',
            ulicaIBroj: '',
            imePrezimePravnogLica: '',
            jmbgPravnogLica: '',
            adresaPravnogLica: '',
            imePrezimePodnosioca: '',
            jmbgPodnosioca: '',
            adresaPodnosioca: '',
            dodatniTekst: '',
            pribavljaDokumentaciju: false,
            vdPotpis: false,
            srPotpis: false
        }
    });

    // Data for dropdowns
    const [t1Lice, setT1Lice] = useState<Lice[]>([]);
    const [t2Lice, setT2Lice] = useState<Lice[]>([]);
    const [kategorije, setKategorije] = useState<Kategorija[]>([]);
    const [obrasciVrste, setObrasciVrste] = useState<ObrasciVrste[]>([]);
    const [organizacionaStruktura, setOrganizacionaStruktura] = useState<OrganizacionaStruktura[]>([]);
    const [predmeti, setPredmeti] = useState<Predmet[]>([]);

    // Filters
    const [t1Filter, setT1Filter] = useState('');
    const [t2Filter, setT2Filter] = useState('');
    const [kategorijeFilter, setKategorijeFilter] = useState('');
    const [obrasciFilter, setObrasciFilter] = useState('');
    const [organizacionaFilter, setOrganizacionaFilter] = useState('');
    const [predmetiFilter, setPredmetiFilter] = useState('');

    const steps = [
        { title: 'Izbor Lica', description: 'Izaberite lice iz T1 ili T2 tabele' },
        { title: 'Kategorija', description: 'Izaberite kategoriju' },
        { title: 'Obrasci Vrste', description: 'Izaberite obrasci vrste' },
        { title: 'Organizaciona Struktura', description: 'Izaberite organizacionu strukturu' },
        { title: 'Predmet', description: 'Izaberite predmet' },
        { title: 'Ručni Podaci', description: 'Unesite ručne podatke' },
        { title: 'Generisanje', description: 'Generiši OДБИЈА СЕ template' }
    ];

    useEffect(() => {
        // Proveri autentifikaciju kroz AuthContext
        console.log('Auth check:', { isAuthenticated, user });
        
        if (!isAuthenticated) {
            setError('Morate biti ulogovani da biste pristupili OДБИЈА СЕ template-u');
            return;
        }
        
        loadInitialData();
    }, [isAuthenticated]);

    const loadInitialData = async () => {
        // Proveri da li je korisnik autentifikovan pre pokretanja API poziva
        if (!isAuthenticated) {
            console.log('User not authenticated, skipping data load');
            return;
        }

        // Dodaj malu pauzu da se token stigne učitati iz localStorage-a
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            setLoading(true);
            setError(null);
            console.log('Loading initial data for OДБИЈА СЕ template with factory service...');

            // Koristi factory service koji automatski bira development ili optimized service
            const templateService = templateServiceFactory.getService();
            const result = await templateService.loadAllData();

            console.log('Loaded data with batch loading:', {
                t1Lice: Array.isArray(result.t1Lice) ? result.t1Lice.length : 0,
                t2Lice: Array.isArray(result.t2Lice) ? result.t2Lice.length : 0,
                kategorije: Array.isArray(result.kategorije) ? result.kategorije.length : 0,
                obrasciVrste: Array.isArray(result.obrasciVrste) ? result.obrasciVrste.length : 0,
                organizacionaStruktura: Array.isArray(result.organizacionaStruktura) ? result.organizacionaStruktura.length : 0,
                predmeti: Array.isArray(result.predmeti) ? result.predmeti.length : 0
            });

            setT1Lice(Array.isArray(result.t1Lice) ? result.t1Lice : []);
            setT2Lice(Array.isArray(result.t2Lice) ? result.t2Lice : []);
            setKategorije(Array.isArray(result.kategorije) ? result.kategorije : []);
            setObrasciVrste(Array.isArray(result.obrasciVrste) ? result.obrasciVrste : []);
            setOrganizacionaStruktura(Array.isArray(result.organizacionaStruktura) ? result.organizacionaStruktura : []);
            setPredmeti(Array.isArray(result.predmeti) ? result.predmeti : []);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Greška pri učitavanju podataka');
        } finally {
            setLoading(false);
        }
    };

    // Filter functions
    const filterLice = (lice: Lice[], filter: string) => {
        if (!lice || !Array.isArray(lice)) return [];
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
        if (!kategorije || !Array.isArray(kategorije)) return [];
        if (!filter) return kategorije;
        const searchTerm = filter.toLowerCase();
        return kategorije.filter(k => 
            k.naziv.toLowerCase().includes(searchTerm) ||
            k.skracenica.toLowerCase().includes(searchTerm)
        );
    };

    const filterObrasciVrste = (obrasci: ObrasciVrste[], filter: string) => {
        if (!obrasci || !Array.isArray(obrasci)) return [];
        if (!filter) return obrasci;
        const searchTerm = filter.toLowerCase();
        return obrasci.filter(o => 
            o.naziv.toLowerCase().includes(searchTerm) ||
            (o.opis && o.opis.toLowerCase().includes(searchTerm))
        );
    };

    const filterOrganizacionaStruktura = (org: OrganizacionaStruktura[], filter: string) => {
        if (!org || !Array.isArray(org)) return [];
        if (!filter) return org;
        const searchTerm = filter.toLowerCase();
        return org.filter(o => 
            o.naziv.toLowerCase().includes(searchTerm) ||
            (o.opis && o.opis.toLowerCase().includes(searchTerm))
        );
    };

    const filterPredmeti = (predmeti: Predmet[], filter: string) => {
        if (!predmeti || !Array.isArray(predmeti)) return [];
        if (!filter) return predmeti;
        const searchTerm = filter.toLowerCase();
        return predmeti.filter(p => 
            p.naziv.toLowerCase().includes(searchTerm) ||
            (p.opis && p.opis.toLowerCase().includes(searchTerm))
        );
    };

    // Selection handlers
    const handleLiceSelection = (lice: Lice, tip: 't1' | 't2') => {
        console.log('Selected lice:', lice);
        console.log('Lice tip:', tip);
        
        // Za T1 lice koristi ugrozenoLiceId, za T2 koristi id
        const liceId = tip === 't1' ? (lice as any).ugrozenoLiceId || lice.id : lice.id;
        
        setFormData(prev => ({
            ...prev,
            liceId: liceId,
            liceTip: tip,
            manualData: {
                ...prev.manualData,
                imePrezimeLica: `${lice.ime} ${lice.prezime}`,
                ulicaIBroj: lice.ulicaIBroj,
                jmbgPodnosioca: lice.jmbg,
                adresaPodnosioca: `${lice.ulicaIBroj}, ${lice.mesto}, ${lice.pttBroj} ${lice.gradOpstina}`
            }
        }));
        setCurrentStep(1);
    };

    const handleKategorijaSelection = (kategorija: Kategorija) => {
        console.log('Selected kategorija:', kategorija);
        setFormData(prev => ({
            ...prev,
            kategorijaId: kategorija.id
        }));
        setCurrentStep(2);
    };

    const handleObrasciVrsteSelection = (obrasci: ObrasciVrste) => {
        setFormData(prev => ({
            ...prev,
            obrasciVrsteId: obrasci.id
        }));
        setCurrentStep(3);
    };

    const handleOrganizacionaStrukturaSelection = (org: OrganizacionaStruktura) => {
        setFormData(prev => ({
            ...prev,
            organizacionaStrukturaId: org.id
        }));
        setCurrentStep(4);
    };

    const handlePredmetSelection = (predmet: Predmet) => {
        setFormData(prev => ({
            ...prev,
            predmetId: predmet.id
        }));
        setCurrentStep(5);
    };

    const handleManualDataChange = (data: OdbijaSeManualData) => {
        setFormData(prev => ({ ...prev, manualData: data }));
    };

    const handleGenerateTemplate = async () => {
        if (!formData.liceId || !formData.kategorijaId || !formData.obrasciVrsteId || 
            !formData.organizacionaStrukturaId || !formData.predmetId || 
            !formData.manualData.predmet || !formData.manualData.datumDonosenjaResenja || 
            !formData.manualData.brojResenja || !formData.manualData.datumOvlastenja || 
            !formData.manualData.datumPodnosenja) {
            setError('Molimo popunite sve potrebne podatke');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Form data:', formData);
            console.log('Lice selection:', { liceId: formData.liceId, liceTip: formData.liceTip });
            console.log('Kategorija selection:', formData.kategorijaId);
            
            const request = {
                liceId: formData.liceId,
                liceTip: formData.liceTip,
                kategorijaId: formData.kategorijaId,
                obrasciVrsteId: formData.obrasciVrsteId,
                organizacionaStrukturaId: formData.organizacionaStrukturaId,
                predmetId: formData.predmetId,
                manualData: formData.manualData
            };

            console.log('Generated request:', request);

            // Koristi originalni service za generisanje template-a
            const { odbijaSeTemplateService } = await import('@/services/odbijaSeTemplateService');
            const response = await odbijaSeTemplateService.generateOdbijaSeTemplate(request);
            
            console.log('Template generation response:', response);
            
            if (response.success) {
                setSuccess('OДБИЈА СЕ template je uspešno generisan!');
                setCurrentStep(6);
                
                // Automatski download
                if (response.templateFilePath) {
                    await odbijaSeTemplateService.downloadTemplate(response.templateFilePath);
                }
            } else {
                setError(response.message || 'Greška pri generisanju template-a');
            }
        } catch (error) {
            console.error('Error generating template:', error);
            setError('Greška pri generisanju template-a');
        } finally {
            setLoading(false);
        }
    };

    const canProceedToNext = (step: number): boolean => {
        switch (step) {
            case 0: return formData.liceId > 0;
            case 1: return formData.kategorijaId > 0;
            case 2: return formData.obrasciVrsteId > 0;
            case 3: return formData.organizacionaStrukturaId > 0;
            case 4: return formData.predmetId > 0;
            case 5: return formData.manualData.predmet.trim() !== '' && 
                        formData.manualData.datumDonosenjaResenja.trim() !== '' &&
                        formData.manualData.brojResenja.trim() !== '' &&
                        formData.manualData.datumOvlastenja.trim() !== '' &&
                        formData.manualData.datumPodnosenja.trim() !== '';
            case 6: return true; // Generation step
            default: return false;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Lice selection
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor Lica</h3>
                            <p className="text-gray-600">Izaberite lice iz T1 ili T2 tabele</p>
                        </div>

                        {/* T1 Lice */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">T1 Lice ({Array.isArray(t1Lice) ? t1Lice.length : 0})</h4>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Pretraži T1 lice..."
                                    value={t1Filter}
                                    onChange={(e) => setT1Filter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {Array.isArray(t1Lice) && filterLice(t1Lice, t1Filter).map((lice, index) => (
                                    <div
                                        key={`t1-${lice.id || index}`}
                                        onClick={() => handleLiceSelection(lice, 't1')}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">{lice.ime} {lice.prezime}</div>
                                        <div className="text-sm text-gray-600">JMBG: {lice.jmbg}</div>
                                        <div className="text-sm text-gray-600">{lice.ulicaIBroj}</div>
                                        <div className="text-sm text-gray-600">{lice.mesto}, {lice.pttBroj} {lice.gradOpstina}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* T2 Lice */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">T2 Lice ({Array.isArray(t2Lice) ? t2Lice.length : 0})</h4>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Pretraži T2 lice..."
                                    value={t2Filter}
                                    onChange={(e) => setT2Filter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {Array.isArray(t2Lice) && filterLice(t2Lice, t2Filter).map((lice, index) => (
                                    <div
                                        key={`t2-${lice.id || index}`}
                                        onClick={() => handleLiceSelection(lice, 't2')}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">{lice.ime} {lice.prezime}</div>
                                        <div className="text-sm text-gray-600">JMBG: {lice.jmbg}</div>
                                        <div className="text-sm text-gray-600">{lice.ulicaIBroj}</div>
                                        <div className="text-sm text-gray-600">{lice.mesto}, {lice.pttBroj} {lice.gradOpstina}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 1: // Kategorija selection
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor Kategorije</h3>
                            <p className="text-gray-600">Izaberite kategoriju</p>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Pretraži kategorije..."
                                value={kategorijeFilter}
                                onChange={(e) => setKategorijeFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.isArray(kategorije) && filterKategorije(kategorije, kategorijeFilter).map((kategorija, index) => (
                                <div
                                    key={`kategorija-${kategorija.id || index}`}
                                    onClick={() => handleKategorijaSelection(kategorija)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900">{kategorija.naziv}</div>
                                    <div className="text-sm text-gray-600">{kategorija.skracenica}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 2: // Obrasci Vrste selection
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor Obrasci Vrste</h3>
                            <p className="text-gray-600">Izaberite obrasci vrste</p>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Pretraži obrasci vrste..."
                                value={obrasciFilter}
                                onChange={(e) => setObrasciFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(obrasciVrste) && filterObrasciVrste(obrasciVrste, obrasciFilter).map((obrasci, index) => (
                                <div
                                    key={`obrasci-${obrasci.id || index}`}
                                    onClick={() => handleObrasciVrsteSelection(obrasci)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900">{obrasci.naziv}</div>
                                    {obrasci.opis && <div className="text-sm text-gray-600">{obrasci.opis}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 3: // Organizaciona Struktura selection
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor Organizacione Strukture</h3>
                            <p className="text-gray-600">Izaberite organizacionu strukturu</p>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Pretraži organizacionu strukturu..."
                                value={organizacionaFilter}
                                onChange={(e) => setOrganizacionaFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(organizacionaStruktura) && filterOrganizacionaStruktura(organizacionaStruktura, organizacionaFilter).map((org, index) => (
                                <div
                                    key={`org-${org.id || index}`}
                                    onClick={() => handleOrganizacionaStrukturaSelection(org)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900">{org.naziv}</div>
                                    {org.opis && <div className="text-sm text-gray-600">{org.opis}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 4: // Predmet selection
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Izbor Predmeta</h3>
                            <p className="text-gray-600">Izaberite predmet</p>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Pretraži predmete..."
                                value={predmetiFilter}
                                onChange={(e) => setPredmetiFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(predmeti) && filterPredmeti(predmeti, predmetiFilter).map((predmet, index) => (
                                <div
                                    key={`predmet-${predmet.id || index}`}
                                    onClick={() => handlePredmetSelection(predmet)}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900">{predmet.naziv}</div>
                                    {predmet.opis && <div className="text-sm text-gray-600">{predmet.opis}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 5: // Manual data input
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ručni Podaci</h3>
                            <p className="text-gray-600">Unesite potrebne podatke za OДБИЈА СЕ template</p>
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Важно:</strong> Одаберите да ли се у документу приказују в.д. и с.р. потписи. 
                                    Ова подешавања ће одредити како ће изгледати финални документ.
                                </p>
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Osnovni podaci */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Предмет *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.manualData.predmet}
                                        onChange={(e) => handleManualDataChange({
                                            ...formData.manualData,
                                            predmet: e.target.value
                                        })}
                                        placeholder="Unesite predmet..."
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Датум доношења решења *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.manualData.datumDonosenjaResenja}
                                        onChange={(e) => handleManualDataChange({
                                            ...formData.manualData,
                                            datumDonosenjaResenja: e.target.value
                                        })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Број решења *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.manualData.brojResenja}
                                        onChange={(e) => handleManualDataChange({
                                            ...formData.manualData,
                                            brojResenja: e.target.value
                                        })}
                                        placeholder="Unesite broj rešenja..."
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Датум овлашћења *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.manualData.datumOvlastenja}
                                        onChange={(e) => handleManualDataChange({
                                            ...formData.manualData,
                                            datumOvlastenja: e.target.value
                                        })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Датум подношења *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.manualData.datumPodnosenja}
                                        onChange={(e) => handleManualDataChange({
                                            ...formData.manualData,
                                            datumPodnosenja: e.target.value
                                        })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Logička polja */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-gray-700">Logička polja</h4>
                                
                                {/* Pribavlja dokumentaciju */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.manualData.pribavljaDokumentaciju}
                                                onChange={(e) => handleManualDataChange({
                                                    ...formData.manualData,
                                                    pribavljaDokumentaciju: e.target.checked
                                                })}
                                                className="mr-3 w-5 h-5"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Прибавља документацију по службеној дужности
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Одаберите да ли се у документу приказује текст о прибављању документације
                                    </p>
                                </div>

                                {/* в.д. потпис */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.manualData.vdPotpis}
                                                onChange={(e) => handleManualDataChange({
                                                    ...formData.manualData,
                                                    vdPotpis: e.target.checked
                                                })}
                                                className="mr-3 w-5 h-5"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                в.д. потпис
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Одаберите да ли се у документу приказује &quot;в.д.&quot; у потпису
                                    </p>
                                </div>

                                {/* с.р. потпис */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.manualData.srPotpis}
                                                onChange={(e) => handleManualDataChange({
                                                    ...formData.manualData,
                                                    srPotpis: e.target.checked
                                                })}
                                                className="mr-3 w-5 h-5"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                с.р. потпис
                                            </span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">
                                        Одаберите да ли се у документу приказује &quot;с.р.&quot; у потпису
                                    </p>
                                </div>
                            </div>

                            {/* Dodatni tekst */}
                            <div className="form-group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Додатни текст (опционо)
                                </label>
                                <textarea
                                    value={formData.manualData.dodatniTekst || ''}
                                    onChange={(e) => handleManualDataChange({
                                        ...formData.manualData,
                                        dodatniTekst: e.target.value
                                    })}
                                    placeholder="Unesite dodatni tekst..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 6: // Generation
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Generisanje OДБИЈА СЕ Template-a</h3>
                            <p className="text-gray-600">Pregled podataka i generisanje</p>
                        </div>

                        {/* Pregled podataka */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Pregled podataka:</h4>
                            
                            <div className="space-y-3">
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Lice:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.imePrezimeLica}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Предмет:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.predmet}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Датум доношења решења:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.datumDonosenjaResenja}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Број решења:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.brojResenja}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Датум овлашћења:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.datumOvlastenja}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Датум подношења:</span>
                                    <span className="text-gray-600 ml-2">{formData.manualData.datumPodnosenja}</span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">Прибавља документацију:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        formData.manualData.pribavljaDokumentaciju 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {formData.manualData.pribavljaDokumentaciju ? 'ДА' : 'НЕ'}
                                    </span>
                                </div>
                                
                                <div className="py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-700">в.д. потпис:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        formData.manualData.vdPotpis 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {formData.manualData.vdPotpis ? 'ДА' : 'НЕ'}
                                    </span>
                                </div>
                                
                                <div className="py-2">
                                    <span className="font-medium text-gray-700">с.р. потпис:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                        formData.manualData.srPotpis 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {formData.manualData.srPotpis ? 'ДА' : 'НЕ'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Dugme za generisanje */}
                        <div className="text-center">
                            <button
                                onClick={handleGenerateTemplate}
                                disabled={loading}
                                className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-colors"
                            >
                                {loading ? 'Генерише се...' : 'Генериши OДБИЈА СЕ Template'}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading && currentStep === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Učitavanje podataka...</p>
            </div>
        );
    }

    if (error && error.includes('Morate biti ulogovani')) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">OДБИЈА СЕ Template Generator</h1>
                    <p className="text-gray-600 mb-8">Generisanje Word template-a za odbijanje NSP, UNSP, DD, UDTNP</p>
                </div>
                
                <div className="error-container">
                    <div className="text-red-600 text-6xl mb-4">🔒</div>
                    <h2 className="error-title">Potrebna autentifikacija</h2>
                    <p className="error-message">
                        Morate biti ulogovani da biste pristupili OДБИЈА СЕ template generator-u.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="retry-button"
                    >
                        Idite na stranicu za prijavu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">OДБИЈА СЕ Template Generator</h1>
                <p className="text-gray-600">Generisanje Word template-a za odbijanje NSP, UNSP, DD, UDTNP</p>
            </div>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                index <= currentStep 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-500'
                            }`}>
                                {index < currentStep ? '✓' : index + 1}
                            </div>
                            <div className="ml-3">
                                <div className={`text-sm font-medium ${
                                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500">{step.description}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-4 ${
                                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Назад
                </button>
                
                <button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={!canProceedToNext(currentStep) || currentStep === steps.length - 1}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Даље
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {success}
                </div>
            )}
        </div>
    );
};

export default OdbijaSeTemplateForm;
