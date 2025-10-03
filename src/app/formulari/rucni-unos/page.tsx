'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowBack, Download, Save } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { WordService, FormData } from '@/services/wordService';

// FormData interface je sada importovan iz wordService

export default function RucniUnosPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    broj_predmeta: '',
    datum_donosenja: '',
    broj_ovlascenja: '',
    datum_ovlascenja: '',
    ime_podsekretara: '',
    ime_prezime_korisnika: '',
    jmbg_korisnika: '',
    adresa_korisnika: '',
    broj_ed: '',
    domacinstvo: '',
    kolicina_kwh: '',
    godina: '',
    broj_infostan: '',
    procenat_racuna: '',
    broj_gas_meter: '',
    kolicina_gas: '',
    meseci_gas: '',
    datum_podnosenja: '',
    datum_resenja: '',
    broj_clanova: '',
    godina_pocetka: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateWord = async () => {
    setIsGenerating(true);
    try {
      await WordService.generateFromForm(formData);
      alert('Word dokument je generisan i preuzet!');
    } catch (error) {
      console.error('Greška pri generisanju Word-a:', error);
      alert('Greška pri generisanju Word-a');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDatabase = async () => {
    try {
      const result = await WordService.saveAndGenerate(formData);
      alert(`Podaci su sačuvani u bazu podataka! ID: ${result.id}`);
    } catch (error) {
      console.error('Greška pri čuvanju u bazu:', error);
      alert('Greška pri čuvanju u bazu podataka');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowBack className="h-4 w-4" />
          Назад
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ручни унос података</h1>
          <p className="text-gray-600 mt-2">Унесите податке за генерисање решења</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Osnovni podaci */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Основни подаци</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="broj_predmeta" className="block text-sm font-medium text-gray-700 mb-2">Број предмета</label>
              <input
                id="broj_predmeta"
                type="text"
                value={formData.broj_predmeta}
                onChange={(e) => handleInputChange('broj_predmeta', e.target.value)}
                placeholder="Унесите број предмета"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <Label htmlFor="datum_donosenja">Датум доношења решења</Label>
              <Input
                id="datum_donosenja"
                type="date"
                value={formData.datum_donosenja}
                onChange={(e) => handleInputChange('datum_donosenja', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="broj_ovlascenja">Број овлашћења</Label>
              <Input
                id="broj_ovlascenja"
                value={formData.broj_ovlascenja}
                onChange={(e) => handleInputChange('broj_ovlascenja', e.target.value)}
                placeholder="Унесите број овлашћења"
              />
            </div>

            <div>
              <Label htmlFor="datum_ovlascenja">Датум овлашћења</Label>
              <Input
                id="datum_ovlascenja"
                type="date"
                value={formData.datum_ovlascenja}
                onChange={(e) => handleInputChange('datum_ovlascenja', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ime_podsekretara">Име и презиме подсекретара</Label>
              <Input
                id="ime_podsekretara"
                value={formData.ime_podsekretara}
                onChange={(e) => handleInputChange('ime_podsekretara', e.target.value)}
                placeholder="Унесите име и презиме подсекретара"
              />
            </div>
          </div>
        </Card>

        {/* Podaci o korisniku */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Подаци о кориснику</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ime_prezime_korisnika">Име и презиме корисника</Label>
              <Input
                id="ime_prezime_korisnika"
                value={formData.ime_prezime_korisnika}
                onChange={(e) => handleInputChange('ime_prezime_korisnika', e.target.value)}
                placeholder="Унесите име и презиме корисника"
              />
            </div>

            <div>
              <Label htmlFor="jmbg_korisnika">JMBG корисника</Label>
              <Input
                id="jmbg_korisnika"
                value={formData.jmbg_korisnika}
                onChange={(e) => handleInputChange('jmbg_korisnika', e.target.value)}
                placeholder="Унесите JMBG"
              />
            </div>

            <div>
              <Label htmlFor="adresa_korisnika">Адреса корисника</Label>
              <Textarea
                id="adresa_korisnika"
                value={formData.adresa_korisnika}
                onChange={(e) => handleInputChange('adresa_korisnika', e.target.value)}
                placeholder="Унесите адресу корисника"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="domacinstvo">Домаћинство</Label>
              <Input
                id="domacinstvo"
                value={formData.domacinstvo}
                onChange={(e) => handleInputChange('domacinstvo', e.target.value)}
                placeholder="Унесите податке о домаћинству"
              />
            </div>
          </div>
        </Card>

        {/* Energetski podaci */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Енергетски подаци</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="broj_ed">Број ED (електрична дистрибуција)</Label>
              <Input
                id="broj_ed"
                value={formData.broj_ed}
                onChange={(e) => handleInputChange('broj_ed', e.target.value)}
                placeholder="Унесите број ED"
              />
            </div>

            <div>
              <Label htmlFor="kolicina_kwh">Количина kWh</Label>
              <Input
                id="kolicina_kwh"
                value={formData.kolicina_kwh}
                onChange={(e) => handleInputChange('kolicina_kwh', e.target.value)}
                placeholder="Унесите количину kWh"
              />
            </div>

            <div>
              <Label htmlFor="godina">Година</Label>
              <Input
                id="godina"
                value={formData.godina}
                onChange={(e) => handleInputChange('godina', e.target.value)}
                placeholder="Унесите годину"
              />
            </div>

            <div>
              <Label htmlFor="broj_infostan">Број Infostan</Label>
              <Input
                id="broj_infostan"
                value={formData.broj_infostan}
                onChange={(e) => handleInputChange('broj_infostan', e.target.value)}
                placeholder="Унесите број Infostan"
              />
            </div>

            <div>
              <Label htmlFor="procenat_racuna">Проценат рачуна</Label>
              <Input
                id="procenat_racuna"
                value={formData.procenat_racuna}
                onChange={(e) => handleInputChange('procenat_racuna', e.target.value)}
                placeholder="Унесите проценат рачуна"
              />
            </div>
          </div>
        </Card>

        {/* Gas podaci */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Гас подаци</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="broj_gas_meter">Број гасног бројила</Label>
              <Input
                id="broj_gas_meter"
                value={formData.broj_gas_meter}
                onChange={(e) => handleInputChange('broj_gas_meter', e.target.value)}
                placeholder="Унесите број гасног бројила"
              />
            </div>

            <div>
              <Label htmlFor="kolicina_gas">Количина гаса</Label>
              <Input
                id="kolicina_gas"
                value={formData.kolicina_gas}
                onChange={(e) => handleInputChange('kolicina_gas', e.target.value)}
                placeholder="Унесите количину гаса"
              />
            </div>

            <div>
              <Label htmlFor="meseci_gas">Месеци за гас</Label>
              <Input
                id="meseci_gas"
                value={formData.meseci_gas}
                onChange={(e) => handleInputChange('meseci_gas', e.target.value)}
                placeholder="Унесите месеце за гас"
              />
            </div>
          </div>
        </Card>

        {/* Dodatni podaci */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Додатни подаци</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="datum_podnosenja">Датум подношења захтева</Label>
              <Input
                id="datum_podnosenja"
                type="date"
                value={formData.datum_podnosenja}
                onChange={(e) => handleInputChange('datum_podnosenja', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="datum_resenja">Датум решења</Label>
              <Input
                id="datum_resenja"
                type="date"
                value={formData.datum_resenja}
                onChange={(e) => handleInputChange('datum_resenja', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="broj_clanova">Број чланова домаћинства</Label>
              <Input
                id="broj_clanova"
                value={formData.broj_clanova}
                onChange={(e) => handleInputChange('broj_clanova', e.target.value)}
                placeholder="Унесите број чланова"
              />
            </div>

            <div>
              <Label htmlFor="godina_pocetka">Година почетка</Label>
              <Input
                id="godina_pocetka"
                value={formData.godina_pocetka}
                onChange={(e) => handleInputChange('godina_pocetka', e.target.value)}
                placeholder="Унесите годину почетка"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Akcije */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Button 
              onClick={handleSaveToDatabase}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Сачувај у базу
            </Button>
          </div>
          
          <Button 
            onClick={handleGenerateWord}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Генерише се...' : 'Генериши Word'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
