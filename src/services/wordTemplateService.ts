import {
    WordTemplateGenerationRequest,
    WordTemplateGenerationResponse,
    Lice,
    Kategorija,
    ObrasciVrste,
    OrganizacionaStruktura,
    Predmet
} from '@/types/wordTemplate';
import { API_BASE_URL } from '@/config/api';

export class WordTemplateService {
    
    // Generisanje Word dokumenta
    async generateWordTemplate(request: WordTemplateGenerationRequest): Promise<WordTemplateGenerationResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error generating Word template:', error);
            throw error;
        }
    }
    
    // Download generisanog dokumenta
    async downloadTemplate(filePath: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/download?filePath=${encodeURIComponent(filePath)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath.split('/').pop() || 'resenje.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    }
    
    // Dobijanje obrasci vrste
    async getObrasciVrste(): Promise<ObrasciVrste[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/obrasci-vrste`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/template/obrasci-vrste. Using mock data.');
                return this.getMockObrasciVrste();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching obrasci vrste from backend, using mock data:', error);
            return this.getMockObrasciVrste();
        }
    }
    
    // Dobijanje organizaciona struktura
    async getOrganizacionaStruktura(): Promise<OrganizacionaStruktura[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/organizaciona-struktura`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/template/organizaciona-struktura. Using mock data.');
                return this.getMockOrganizacionaStruktura();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching organizaciona struktura from backend, using mock data:', error);
            return this.getMockOrganizacionaStruktura();
        }
    }
    
    // Dobijanje kategorija
    async getKategorije(): Promise<Kategorija[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/kategorije`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/kategorije. Using mock data.');
                return this.getMockKategorije();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching kategorije from backend, using mock data:', error);
            return this.getMockKategorije();
        }
    }
    
    // Dobijanje predmeti
    async getPredmeti(): Promise<Predmet[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/predmeti`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/predmeti. Using mock data.');
                return this.getMockPredmeti();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching predmeti from backend, using mock data:', error);
            return this.getMockPredmeti();
        }
    }
    
    // Dobijanje T1 lice
    async getT1Lice(): Promise<Lice[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/euk/t1`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/euk/t1. Using mock data.');
                return this.getMockT1Lice();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching T1 lice from backend, using mock data:', error);
            return this.getMockT1Lice();
        }
    }
    
    // Dobijanje T2 lice
    async getT2Lice(): Promise<Lice[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/euk/t2`);
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/euk/t2. Using mock data.');
                return this.getMockT2Lice();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching T2 lice from backend, using mock data:', error);
            return this.getMockT2Lice();
        }
    }

    // Mock data methods
    private getMockT1Lice(): Lice[] {
        console.warn('Using mock T1 lice data');
        return [
            { id: 1, ime: 'Marko', prezime: 'Marković', jmbg: '1234567890123' },
            { id: 2, ime: 'Ana', prezime: 'Petrović', jmbg: '1234567890124' },
            { id: 3, ime: 'Stefan', prezime: 'Nikolić', jmbg: '1234567890125' },
            { id: 4, ime: 'Marija', prezime: 'Jovanović', jmbg: '1234567890126' },
            { id: 5, ime: 'Nikola', prezime: 'Stojanović', jmbg: '1234567890127' }
        ];
    }

    private getMockT2Lice(): Lice[] {
        console.warn('Using mock T2 lice data');
        return [
            { id: 1, ime: 'Jovan', prezime: 'Milošević', jmbg: '2234567890123' },
            { id: 2, ime: 'Milica', prezime: 'Radić', jmbg: '2234567890124' },
            { id: 3, ime: 'Aleksandar', prezime: 'Popović', jmbg: '2234567890125' },
            { id: 4, ime: 'Jelena', prezime: 'Lazić', jmbg: '2234567890126' },
            { id: 5, ime: 'Miloš', prezime: 'Đorđević', jmbg: '2234567890127' }
        ];
    }

    private getMockKategorije(): Kategorija[] {
        console.warn('Using mock kategorije data');
        return [
            { id: 1, naziv: 'Socijalna zaštita', opis: 'Kategorija za socijalnu zaštitu' },
            { id: 2, naziv: 'Zdravstvena zaštita', opis: 'Kategorija za zdravstvenu zaštitu' },
            { id: 3, naziv: 'Obrazovanje', opis: 'Kategorija za obrazovanje' },
            { id: 4, naziv: 'Zaposlenje', opis: 'Kategorija za zaposlenje' }
        ];
    }

    private getMockObrasciVrste(): ObrasciVrste[] {
        console.warn('Using mock obrasci vrste data');
        return [
            { id: 1, naziv: 'Negativno', opis: 'Negativno rešenje' },
            { id: 2, naziv: 'Neograničeno', opis: 'Neograničeno rešenje' },
            { id: 3, naziv: 'Ograničeno', opis: 'Ograničeno rešenje' },
            { id: 4, naziv: 'Borci', opis: 'Rešenje za borce' },
            { id: 5, naziv: 'Penzioneri', opis: 'Rešenje za penzionere' },
            { id: 6, naziv: 'Obustave', opis: 'Rešenje za obustave' }
        ];
    }

    private getMockOrganizacionaStruktura(): OrganizacionaStruktura[] {
        console.warn('Using mock organizaciona struktura data');
        return [
            { id: 1, naziv: 'Sekretar', opis: 'Sekretar opštine' },
            { id: 2, naziv: 'Podsekretar', opis: 'Podsekretar opštine' }
        ];
    }

    private getMockPredmeti(): Predmet[] {
        console.warn('Using mock predmeti data');
        return [
            { id: 1, naziv: 'Predmet 1', opis: 'Opis predmeta 1' },
            { id: 2, naziv: 'Predmet 2', opis: 'Opis predmeta 2' },
            { id: 3, naziv: 'Predmet 3', opis: 'Opis predmeta 3' },
            { id: 4, naziv: 'Predmet 4', opis: 'Opis predmeta 4' }
        ];
    }
}

export const wordTemplateService = new WordTemplateService();
