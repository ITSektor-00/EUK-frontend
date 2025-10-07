'use client';

import React from 'react';
import { WordTemplateFormData } from '@/types/wordTemplate';

interface GenerationStepProps {
    formData: WordTemplateFormData;
    loading: boolean;
    onGenerate: () => void;
}

const GenerationStep: React.FC<GenerationStepProps> = ({
    formData,
    loading,
    onGenerate
}) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Generisanje Word dokumenta</h3>
                <p className="text-gray-600">Svi potrebni podaci su izabrani. Kliknite dugme ispod da generišete Word dokument.</p>
            </div>
            
            {/* Pregled izabranih podataka */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Pregled izabranih podataka:</h4>
                <div className="space-y-3">
                    {formData.liceSelection && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">Lice:</span>
                            <span className="text-gray-600">
                                {formData.liceSelection.liceNaziv} ({formData.liceSelection.liceTip.toUpperCase()})
                            </span>
                        </div>
                    )}
                    
                    {formData.kategorijaSelection && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">Kategorija:</span>
                            <span className="text-gray-600">{formData.kategorijaSelection.kategorijaNaziv}</span>
                        </div>
                    )}
                    
                    {formData.obrasciVrsteSelection && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">Obrasci vrste:</span>
                            <span className="text-gray-600">{formData.obrasciVrsteSelection.obrasciVrsteNaziv}</span>
                        </div>
                    )}
                    
                    {formData.organizacionaStrukturaSelection && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">Organizaciona struktura:</span>
                            <span className="text-gray-600">{formData.organizacionaStrukturaSelection.organizacionaStrukturaNaziv}</span>
                        </div>
                    )}
                    
                    {formData.predmetSelection && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700">Predmet:</span>
                            <span className="text-gray-600">{formData.predmetSelection.predmetNaziv}</span>
                        </div>
                    )}
                    
                    {formData.manualData.ZAGLAVLJE && (
                        <div className="py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700 block mb-1">Zaglavlje:</span>
                            <span className="text-gray-600 text-sm">{formData.manualData.ZAGLAVLJE}</span>
                        </div>
                    )}
                    
                    {formData.manualData.OBRAZLOZENJE && (
                        <div className="py-2 border-b border-gray-200">
                            <span className="font-medium text-gray-700 block mb-1">Obrazloženje:</span>
                            <span className="text-gray-600 text-sm">{formData.manualData.OBRAZLOZENJE}</span>
                        </div>
                    )}
                    
                    {formData.manualData.DODATNI_PODACI && (
                        <div className="py-2">
                            <span className="font-medium text-gray-700 block mb-1">Dodatni podaci:</span>
                            <span className="text-gray-600 text-sm">{formData.manualData.DODATNI_PODACI}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Dugme za generisanje */}
            <div className="text-center">
                <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generiše se...
                        </div>
                    ) : (
                        'Generiši Word dokument'
                    )}
                </button>
            </div>
            
            {/* Informacije o generisanju */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Informacije o generisanju:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Crvena slova u template-u će biti automatski zamenjena sa podacima</li>
                    <li>• Linije pored crvenih slova će biti obrisane</li>
                    <li>• Ručni podaci će biti uključeni u zaglavlje i obrazloženje</li>
                    <li>• Generisani fajl će se automatski download-ovati</li>
                </ul>
            </div>
        </div>
    );
};

export default GenerationStep;
