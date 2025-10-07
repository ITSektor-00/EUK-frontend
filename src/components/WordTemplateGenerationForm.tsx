'use client';

import React, { useState, useEffect } from 'react';
import { 
    WordTemplateFormData, 
    WordTemplateStep,
    Lice,
    Kategorija,
    ObrasciVrste,
    OrganizacionaStruktura,
    Predmet,
    ManualData
} from '@/types/wordTemplate';
import { wordTemplateService } from '@/services/wordTemplateService';
import WordTemplateStepper from './WordTemplateStepper';
import LiceSelectionStep from './steps/LiceSelectionStep';
import KategorijaSelectionStep from './steps/KategorijaSelectionStep';
import ObrasciVrsteSelectionStep from './steps/ObrasciVrsteSelectionStep';
import OrganizacionaStrukturaSelectionStep from './steps/OrganizacionaStrukturaSelectionStep';
import PredmetSelectionStep from './steps/PredmetSelectionStep';
import ManualDataStep from './steps/ManualDataStep';
import GenerationStep from './steps/GenerationStep';

interface WordTemplateGenerationFormProps {
    onTemplateGenerated?: (response: any) => void;
}

const WordTemplateGenerationForm: React.FC<WordTemplateGenerationFormProps> = ({ onTemplateGenerated }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Form data state
    const [formData, setFormData] = useState<WordTemplateFormData>({
        liceSelection: null,
        kategorijaSelection: null,
        obrasciVrsteSelection: null,
        organizacionaStrukturaSelection: null,
        predmetSelection: null,
        manualData: {
            ZAGLAVLJE: '',
            OBRAZLOZENJE: '',
            DODATNI_PODACI: ''
        }
    });

    // Data for dropdowns
    const [t1Lice, setT1Lice] = useState<Lice[]>([]);
    const [t2Lice, setT2Lice] = useState<Lice[]>([]);
    const [kategorije, setKategorije] = useState<Kategorija[]>([]);
    const [obrasciVrste, setObrasciVrste] = useState<ObrasciVrste[]>([]);
    const [organizacionaStruktura, setOrganizacionaStruktura] = useState<OrganizacionaStruktura[]>([]);
    const [predmeti, setPredmeti] = useState<Predmet[]>([]);

    // Steps configuration
    const steps: WordTemplateStep[] = [
        { title: 'Izbor lice', description: 'Izaberite lice iz T1 ili T2 tabele', completed: false, active: true },
        { title: 'Izbor kategorije', description: 'Izaberite kategoriju', completed: false, active: false },
        { title: 'Obrasci vrste', description: 'Izaberite tip obraza', completed: false, active: false },
        { title: 'Organizaciona struktura', description: 'Izaberite organizacionu strukturu', completed: false, active: false },
        { title: 'Izbor predmeta', description: 'Izaberite predmet', completed: false, active: false },
        { title: 'Ručni podaci', description: 'Unesite zaglavlje i obrazloženje', completed: false, active: false },
        { title: 'Generisanje', description: 'Generiši Word dokument', completed: false, active: false }
    ];

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            console.log('Loading initial data for Word template...');
            
            const [t1Data, t2Data, kategorijeData, obrasciData, organizacionaData, predmetiData] = await Promise.all([
                wordTemplateService.getT1Lice(),
                wordTemplateService.getT2Lice(),
                wordTemplateService.getKategorije(),
                wordTemplateService.getObrasciVrste(),
                wordTemplateService.getOrganizacionaStruktura(),
                wordTemplateService.getPredmeti()
            ]);

            console.log('Loaded data:', {
                t1Data: t1Data.length,
                t2Data: t2Data.length,
                kategorijeData: kategorijeData.length,
                obrasciData: obrasciData.length,
                organizacionaData: organizacionaData.length,
                predmetiData: predmetiData.length
            });

            setT1Lice(t1Data);
            setT2Lice(t2Data);
            setKategorije(kategorijeData);
            setObrasciVrste(obrasciData);
            setOrganizacionaStruktura(organizacionaData);
            setPredmeti(predmetiData);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Greška pri učitavanju podataka');
        } finally {
            setLoading(false);
        }
    };

    const handleLiceSelection = (selection: any) => {
        setFormData(prev => ({ ...prev, liceSelection: selection }));
        setCurrentStep(1);
    };

    const handleKategorijaSelection = (selection: any) => {
        setFormData(prev => ({ ...prev, kategorijaSelection: selection }));
        setCurrentStep(2);
    };

    const handleObrasciVrsteSelection = (selection: any) => {
        setFormData(prev => ({ ...prev, obrasciVrsteSelection: selection }));
        setCurrentStep(3);
    };

    const handleOrganizacionaStrukturaSelection = (selection: any) => {
        setFormData(prev => ({ ...prev, organizacionaStrukturaSelection: selection }));
        setCurrentStep(4);
    };

    const handlePredmetSelection = (selection: any) => {
        setFormData(prev => ({ ...prev, predmetSelection: selection }));
        setCurrentStep(5);
    };

    const handleManualDataChange = (data: ManualData) => {
        setFormData(prev => ({ ...prev, manualData: data }));
    };

    const handleGenerateTemplate = async () => {
        if (!formData.liceSelection || !formData.kategorijaSelection || 
            !formData.obrasciVrsteSelection || !formData.organizacionaStrukturaSelection || 
            !formData.predmetSelection || !formData.manualData.ZAGLAVLJE || 
            !formData.manualData.OBRAZLOZENJE) {
            setError('Molimo popunite sve potrebne podatke');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const request = {
                liceId: formData.liceSelection.liceId,
                liceTip: formData.liceSelection.liceTip,
                kategorijaId: formData.kategorijaSelection.kategorijaId,
                obrasciVrsteId: formData.obrasciVrsteSelection.obrasciVrsteId,
                organizacionaStrukturaId: formData.organizacionaStrukturaSelection.organizacionaStrukturaId,
                predmetId: formData.predmetSelection.predmetId,
                manualData: formData.manualData
            };

            console.log('Generating Word template with request:', request);
            const response = await wordTemplateService.generateWordTemplate(request);
            
            if (response.success) {
                setSuccess('Word dokument je uspešno generisan!');
                onTemplateGenerated?.(response);
                
                // Download the generated file
                await wordTemplateService.downloadTemplate(response.templateFilePath);
            } else {
                setError('Greška pri generisanju: ' + response.message);
            }
        } catch (error) {
            console.error('Error generating template:', error);
            setError('Greška pri generisanju template-a: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const canProceedToNext = (): boolean => {
        switch (currentStep) {
            case 0: return formData.liceSelection !== null;
            case 1: return formData.kategorijaSelection !== null;
            case 2: return formData.obrasciVrsteSelection !== null;
            case 3: return formData.organizacionaStrukturaSelection !== null;
            case 4: return formData.predmetSelection !== null;
            case 5: return formData.manualData.ZAGLAVLJE.trim() !== '' && formData.manualData.OBRAZLOZENJE.trim() !== '';
            case 6: return true; // Generation step
            default: return false;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <LiceSelectionStep
                        t1Lice={t1Lice}
                        t2Lice={t2Lice}
                        selectedLice={formData.liceSelection}
                        onLiceSelect={handleLiceSelection}
                    />
                );
            case 1:
                return (
                    <KategorijaSelectionStep
                        kategorije={kategorije}
                        selectedKategorija={formData.kategorijaSelection}
                        onKategorijaSelect={handleKategorijaSelection}
                    />
                );
            case 2:
                return (
                    <ObrasciVrsteSelectionStep
                        obrasciVrste={obrasciVrste}
                        selectedObrasciVrste={formData.obrasciVrsteSelection}
                        onObrasciVrsteSelect={handleObrasciVrsteSelection}
                    />
                );
            case 3:
                return (
                    <OrganizacionaStrukturaSelectionStep
                        organizacionaStruktura={organizacionaStruktura}
                        selectedOrganizacionaStruktura={formData.organizacionaStrukturaSelection}
                        onOrganizacionaStrukturaSelect={handleOrganizacionaStrukturaSelection}
                    />
                );
            case 4:
                return (
                    <PredmetSelectionStep
                        predmeti={predmeti}
                        selectedPredmet={formData.predmetSelection}
                        onPredmetSelect={handlePredmetSelection}
                    />
                );
            case 5:
                return (
                    <ManualDataStep
                        manualData={formData.manualData}
                        onManualDataChange={handleManualDataChange}
                    />
                );
            case 6:
                return (
                    <GenerationStep
                        formData={formData}
                        loading={loading}
                        onGenerate={handleGenerateTemplate}
                    />
                );
            default:
                return null;
        }
    };

    if (loading && currentStep === 0) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Učitavanje podataka...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Generisanje Word rešenja</h2>
                <p className="text-gray-600 text-lg">Izaberite potrebne podatke za generisanje Word dokumenta</p>
            </div>
            
            {/* Progress Steps */}
            <WordTemplateStepper steps={steps} currentStep={currentStep} />

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
                
                {currentStep < 6 && (
                    <button
                        onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                        disabled={!canProceedToNext()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        Dalje →
                    </button>
                )}
            </div>
        </div>
    );
};

export default WordTemplateGenerationForm;
