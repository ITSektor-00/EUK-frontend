// import { api } from './api'; // Ne koristi se trenutno

export interface FormData {
  broj_predmeta: string;
  datum_donosenja: string;
  broj_ovlascenja: string;
  datum_ovlascenja: string;
  ime_podsekretara: string;
  ime_prezime_korisnika: string;
  jmbg_korisnika: string;
  adresa_korisnika: string;
  broj_ed: string;
  domacinstvo: string;
  kolicina_kwh: string;
  godina: string;
  broj_infostan: string;
  procenat_racuna: string;
  broj_gas_meter: string;
  kolicina_gas: string;
  meseci_gas: string;
  datum_podnosenja: string;
  datum_resenja: string;
  broj_clanova: string;
  godina_pocetka: string;
}

export interface UgrozenoLice {
  id: number;
  ime: string;
  prezime: string;
  jmbg: string;
  adresa: string;
  broj_ed?: string;
  domacinstvo?: string;
  kolicina_kwh?: string;
  godina?: string;
  broj_infostan?: string;
  procenat_racuna?: string;
  broj_gas_meter?: string;
  kolicina_gas?: string;
  meseci_gas?: string;
  datum_podnosenja?: string;
  datum_resenja?: string;
  broj_clanova?: string;
  godina_pocetka?: string;
}

export class WordService {
  /**
   * Generiše Word rešenje iz ručno unetih podataka
   */
  static async generateFromForm(formData: FormData): Promise<void> {
    try {
      const response = await fetch('/api/word/generate-from-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Preuzimanje Word dokumenta
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resenje_${formData.jmbg_korisnika}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Greška pri generisanju Word-a iz forme:', error);
      throw error;
    }
  }

  /**
   * Generiše Word rešenje iz podataka iz baze
   */
  static async generateFromDatabase(id: number): Promise<void> {
    try {
      const response = await fetch('/api/word/generate-from-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Preuzimanje Word dokumenta
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resenje_${id}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Greška pri generisanju Word-a iz baze:', error);
      throw error;
    }
  }

  /**
   * Čuva podatke u bazu i generiše Word rešenje
   */
  static async saveAndGenerate(formData: FormData): Promise<{ id: number; message: string }> {
    try {
      const response = await fetch('/api/word/save-and-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Greška pri čuvanju i generisanju:', error);
      throw error;
    }
  }

  /**
   * Dohvata sva lica iz baze za dropdown
   */
  static async getUgrozenaLica(): Promise<UgrozenoLice[]> {
    try {
      const response = await fetch('/api/ugrozeno-lice-t1');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Greška pri dohvatanju lica iz baze:', error);
      throw error;
    }
  }

  /**
   * Pretražuje lica u bazi
   */
  static async searchUgrozenaLica(searchTerm: string): Promise<UgrozenoLice[]> {
    try {
      const response = await fetch(`/api/ugrozeno-lice-t1/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Greška pri pretrazi lica:', error);
      throw error;
    }
  }
}
