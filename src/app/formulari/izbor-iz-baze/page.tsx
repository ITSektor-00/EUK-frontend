'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowBack, Download, Search, Storage } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { WordService, UgrozenoLice } from '@/services/wordService';

// UgrozenoLice interface je sada importovan iz wordService

export default function IzborIzBazePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLice, setSelectedLice] = useState<UgrozenoLice | null>(null);
  const [lica, setLica] = useState<UgrozenoLice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulacija podataka iz baze
  const mockData: UgrozenoLice[] = [
    {
      id: 1,
      ime: 'Петар',
      prezime: 'Петровић',
      jmbg: '1234567890123',
      adresa: 'Кнез Михаилова 1, Београд',
      broj_ed: 'ED001',
      domacinstvo: '3 члана',
      kolicina_kwh: '150',
      godina: '2024',
      broj_infostan: 'INF001',
      procenat_racuna: '50',
      broj_gas_meter: 'GAS001',
      kolicina_gas: '100',
      meseci_gas: 'јануар, фебруар, март',
      datum_podnosenja: '2024-01-15',
      datum_resenja: '2024-02-01',
      broj_clanova: '3',
      godina_pocetka: '2024'
    },
    {
      id: 2,
      ime: 'Ана',
      prezime: 'Анић',
      jmbg: '9876543210987',
      adresa: 'Теразије 5, Београд',
      broj_ed: 'ED002',
      domacinstvo: '2 члана',
      kolicina_kwh: '200',
      godina: '2024',
      broj_infostan: 'INF002',
      procenat_racuna: '60',
      broj_gas_meter: 'GAS002',
      kolicina_gas: '120',
      meseci_gas: 'април, мај, јун',
      datum_podnosenja: '2024-02-10',
      datum_resenja: '2024-03-01',
      broj_clanova: '2',
      godina_pocetka: '2024'
    }
  ];

  useEffect(() => {
    const loadLica = async () => {
      setIsLoading(true);
      try {
        const data = await WordService.getUgrozenaLica();
        setLica(data);
      } catch (error) {
        console.error('Greška pri učitavanju lica:', error);
        // Fallback na mock data ako API ne radi
        setLica(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    loadLica();
  }, []);

  const filteredLica = lica.filter(lice => 
    lice.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lice.prezime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lice.jmbg.includes(searchTerm) ||
    lice.adresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectLice = (lice: UgrozenoLice) => {
    setSelectedLice(lice);
  };

  const handleGenerateWord = async () => {
    if (!selectedLice) {
      alert('Молимо изаберите лице из базе');
      return;
    }

    setIsGenerating(true);
    try {
      await WordService.generateFromDatabase(selectedLice.id);
      alert(`Word документ је генерисан за ${selectedLice.ime} ${selectedLice.prezime}!`);
    } catch (error) {
      console.error('Greška pri generisanju Word-a:', error);
      alert('Greška pri generisanju Word-a');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowBack className="h-4 w-4" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Избор из базе података</h1>
          <p className="text-gray-600 mt-2">Изаберите лице из базе и генеришите решење</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pretraga i izbor */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Претрага и избор</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Претражи лице</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Унесите име, презиме, JMBG или адресу..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredLica.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Storage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Нема резултата за претрагу</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLica.map((lice) => (
                    <Card 
                      key={lice.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedLice?.id === lice.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectLice(lice)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lice.ime} {lice.prezime}
                          </h3>
                          <p className="text-sm text-gray-600">JMBG: {lice.jmbg}</p>
                          <p className="text-sm text-gray-600">{lice.adresa}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">ID: {lice.id}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Izabrano lice */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Изабрано лице</h2>
          
          {selectedLice ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">
                  {selectedLice.ime} {selectedLice.prezime}
                </h3>
                <p className="text-blue-700">JMBG: {selectedLice.jmbg}</p>
                <p className="text-blue-700">{selectedLice.adresa}</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Домаћинство:</span>
                    <p className="text-gray-600">{selectedLice.domacinstvo || 'Н/А'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Број ED:</span>
                    <p className="text-gray-600">{selectedLice.broj_ed || 'Н/А'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Количина kWh:</span>
                    <p className="text-gray-600">{selectedLice.kolicina_kwh || 'Н/А'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Година:</span>
                    <p className="text-gray-600">{selectedLice.godina || 'Н/А'}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleGenerateWord}
                    disabled={isGenerating}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isGenerating ? 'Генерише се...' : 'Генериши Word решење'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
                  <Storage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Изаберите лице из листе лево</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
