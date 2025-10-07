'use client';

import React, { useState } from 'react';
import TemplateGenerationForm from '@/components/TemplateGenerationForm';
import WordTemplateGenerationForm from '@/components/WordTemplateGenerationForm';
import OdbijaSeTemplateForm from '@/components/OdbijaSeTemplateForm';
import ObrasciVrsteList from '@/components/ObrasciVrsteList';
import OrganizacionaStrukturaList from '@/components/OrganizacionaStrukturaList';
import { ObrasciVrste, OrganizacionaStruktura } from '@/types/template';

const FormulariPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'generate' | 'word-template' | 'odbija-se' | 'obrasci' | 'organizaciona'>('generate');
    const [selectedObrasci, setSelectedObrasci] = useState<ObrasciVrste | null>(null);
    const [selectedOrganizaciona, setSelectedOrganizaciona] = useState<OrganizacionaStruktura | null>(null);
    const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);

    const handleTemplateGenerated = (response: any) => {
        setGeneratedTemplate(response);
        // Možete dodati dodatnu logiku ovde, npr. prikazivanje notifikacije
    };

    const tabs = [
        { id: 'generate', label: 'Generisanje Template-a', icon: '📝' },
        { id: 'word-template', label: 'Word Template', icon: '📄' },
        { id: 'odbija-se', label: 'OДБИЈА СЕ Template', icon: '❌' },
        { id: 'obrasci', label: 'Obrasci Vrste', icon: '📋' },
        { id: 'organizaciona', label: 'Organizaciona Struktura', icon: '🏢' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Template Generisanje Sistema</h1>
                    <p className="mt-2 text-gray-600">
                        Hijerarhijski sistem za generisanje personalizovanih template rešenja
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                      <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                      </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow">
                    {activeTab === 'generate' && (
                        <div className="p-6">
                            <TemplateGenerationForm onTemplateGenerated={handleTemplateGenerated} />
                            
                            {/* Generated Template Info */}
                            {generatedTemplate && (
                                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                                        Template je uspešno generisan!
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Predmet ID:</strong> {generatedTemplate.predmetId}</div>
                                        <div><strong>Status:</strong> {generatedTemplate.templateStatus}</div>
                                        <div><strong>Generisan:</strong> {new Date(generatedTemplate.templateGeneratedAt).toLocaleString('sr-RS')}</div>
                                        <div><strong>Putanja fajla:</strong> {generatedTemplate.templateFilePath}</div>
                                    </div>
                                    <div className="mt-4">
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/template/download?filePath=${encodeURIComponent(generatedTemplate.templateFilePath)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            📥 Preuzmi Template
                                        </a>
                            </div>
                          </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'word-template' && (
                        <div className="p-6">
                            <WordTemplateGenerationForm onTemplateGenerated={handleTemplateGenerated} />
                        </div>
                    )}

                    {activeTab === 'odbija-se' && (
                        <div className="p-6">
                            <OdbijaSeTemplateForm />
                        </div>
                    )}

                    {activeTab === 'obrasci' && (
                        <div className="p-6">
                            <ObrasciVrsteList 
                                onSelectionChange={setSelectedObrasci}
                                selectedId={selectedObrasci?.id}
                            />
                            
                            {selectedObrasci && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Izabrana obrasci vrste:</h4>
                                    <div className="text-sm text-blue-700">
                                        <div><strong>Naziv:</strong> {selectedObrasci.naziv}</div>
                                        {selectedObrasci.opis && (
                                            <div><strong>Opis:</strong> {selectedObrasci.opis}</div>
                                        )}
                            </div>
                            </div>
                            )}
                            </div>
                    )}

                    {activeTab === 'organizaciona' && (
                        <div className="p-6">
                            <OrganizacionaStrukturaList 
                                onSelectionChange={setSelectedOrganizaciona}
                                selectedId={selectedOrganizaciona?.id}
                            />
                            
                            {selectedOrganizaciona && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Izabrana organizaciona struktura:</h4>
                                    <div className="text-sm text-blue-700">
                                        <div><strong>Naziv:</strong> {selectedOrganizaciona.naziv}</div>
                                        {selectedOrganizaciona.opis && (
                                            <div><strong>Opis:</strong> {selectedOrganizaciona.opis}</div>
                                        )}
                            </div>
                          </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Kako koristiti sistem?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">1. Generisanje Template-a</h4>
                            <p className="text-sm text-blue-600">
                                Korak po korak izaberite lice, kategoriju, obrasci vrste, organizacionu strukturu i predmet za generisanje personalizovanog template-a.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">2. Word Template</h4>
                            <p className="text-sm text-blue-600">
                                Generiši Word dokumente sa hijerarhijskim izborom parametara i automatskom zamenu crvenih slova sa podacima iz baze.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">3. OДБИЈА СЕ Template</h4>
                            <p className="text-sm text-blue-600">
                                Specijalizovani template za odbijanje NSP, UNSP, DD, UDTNP sa automatskim popunjavanjem podataka iz baze.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">4. Upravljanje Obrasci Vrste</h4>
                            <p className="text-sm text-blue-600">
                                Dodajte, uređujte ili obrišite obrasci vrste koje se koriste u template generisanju.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-700 mb-2">5. Upravljanje Organizacionom Strukturom</h4>
                            <p className="text-sm text-blue-600">
                                Upravljajte organizacionom strukturom (sekretar, podsekretar) koja se koristi u template generisanju.
                            </p>
                        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulariPage;