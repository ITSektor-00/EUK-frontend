import { 
    OdbijaSeTemplateRequest, 
    OdbijaSeTemplateResponse, 
    Lice, 
    Kategorija, 
    ObrasciVrste, 
    OrganizacionaStruktura, 
    Predmet 
} from '@/types/odbijaSeTemplate';
import { API_BASE_URL } from '@/config/api';

export class OdbijaSeTemplateService {
    // Generisanje OДБИЈА СЕ template-a
    async generateOdbijaSeTemplate(request: OdbijaSeTemplateRequest): Promise<OdbijaSeTemplateResponse> {
        try {
            console.log('Sending OДБИЈА СЕ template generation request:', request);
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/template/generate-odbija-se`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating OДБИЈА СЕ template:', error);
            throw error;
        }
    }

    // Download generisanog dokumenta
    async downloadTemplate(filePath: string): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/template/download?filePath=${encodeURIComponent(filePath)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath.split('/').pop() || 'odbija-se-template.doc';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    }

    // Učitavanje podataka
    async getT1Lice(): Promise<Lice[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/euk/t1`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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

    async getT2Lice(): Promise<Lice[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/euk/t2`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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

    async getKategorije(): Promise<Kategorija[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/kategorije`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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

    async getObrasciVrste(): Promise<ObrasciVrste[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/obrasci-vrste`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/obrasci-vrste. Using mock data.');
                return this.getMockObrasciVrste();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching obrasci vrste from backend, using mock data:', error);
            return this.getMockObrasciVrste();
        }
    }

    async getOrganizacionaStruktura(): Promise<OrganizacionaStruktura[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/organizaciona-struktura`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.warn('Backend endpoint not available: /api/organizaciona-struktura. Using mock data.');
                return this.getMockOrganizacionaStruktura();
            }
            return await response.json();
        } catch (error) {
            console.warn('Error fetching organizaciona struktura from backend, using mock data:', error);
            return this.getMockOrganizacionaStruktura();
        }
    }

    async getPredmeti(): Promise<Predmet[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/predmeti`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
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

    // Mock data methods
    private getMockT1Lice(): Lice[] {
        console.warn('Using mock T1 lice data');
        return [
            {
                id: 1,
                ime: 'Марко',
                prezime: 'Петровић',
                jmbg: '1234567890123',
                ulicaIBroj: 'Краља Петра 15',
                gradOpstina: 'Београд',
                pttBroj: '11000',
                mesto: 'Београд'
            },
            {
                id: 2,
                ime: 'Ана',
                prezime: 'Марковић',
                jmbg: '9876543210987',
                ulicaIBroj: 'Немањина 25',
                gradOpstina: 'Нови Сад',
                pttBroj: '21000',
                mesto: 'Нови Сад'
            }
        ];
    }

    private getMockT2Lice(): Lice[] {
        console.warn('Using mock T2 lice data');
        return [
            {
                id: 1,
                ime: 'Петар',
                prezime: 'Јовановић',
                jmbg: '1111111111111',
                ulicaIBroj: 'Кнеза Милоша 10',
                gradOpstina: 'Београд',
                pttBroj: '11000',
                mesto: 'Београд'
            }
        ];
    }

    private getMockKategorije(): Kategorija[] {
        console.warn('Using mock kategorije data');
        return [
            { id: 1, naziv: 'NSP', skracenica: 'NSP' },
            { id: 2, naziv: 'UNSP', skracenica: 'UNSP' },
            { id: 3, naziv: 'DD', skracenica: 'DD' },
            { id: 4, naziv: 'UDTNP', skracenica: 'UDTNP' }
        ];
    }

    private getMockObrasciVrste(): ObrasciVrste[] {
        console.warn('Using mock obrasci vrste data');
        return [
            { id: 1, naziv: 'OДБИЈА СЕ NSP,UNSP,DD,UDTNP', opis: 'Template za odbijanje' },
            { id: 2, naziv: 'ОДОБРАВА СЕ', opis: 'Template za odobravanje' }
        ];
    }

    private getMockOrganizacionaStruktura(): OrganizacionaStruktura[] {
        console.warn('Using mock organizaciona struktura data');
        return [
            { id: 1, naziv: 'Секретаријат', opis: 'Секретаријат за енергетику' },
            { id: 2, naziv: 'Управа', opis: 'Управа за енергетику' }
        ];
    }

    private getMockPredmeti(): Predmet[] {
        console.warn('Using mock predmeti data');
        return [
            { id: 1, naziv: 'Енергетски угрожени купац', opis: 'Статус енергетски угроженог купца' },
            { id: 2, naziv: 'Социјална помоћ', opis: 'Социјална помоћ и нега' }
        ];
    }
}

export const odbijaSeTemplateService = new OdbijaSeTemplateService();
