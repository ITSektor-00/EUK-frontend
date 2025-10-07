import { 
    TemplateGenerationRequest, 
    TemplateGenerationResponse, 
    ObrasciVrste, 
    OrganizacionaStruktura,
    Lice,
    Kategorija
} from '@/types/template';
import RequestRetry from '@/utils/requestRetry';
import CircuitBreaker from '@/utils/circuitBreaker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export class TemplateGenerationService {
    private readonly circuitBreaker: CircuitBreaker;
    private readonly retryConfig = RequestRetry.createConservativeConfig();

    constructor() {
        this.circuitBreaker = CircuitBreaker.getInstance('template-generation-service', {
            failureThreshold: 3,
            timeout: 10000,
            resetTimeout: 30000,
            monitoringPeriod: 60000
        });
    }
    
    // Generisanje template-a
    async generateTemplate(request: TemplateGenerationRequest): Promise<TemplateGenerationResponse> {
        return this.circuitBreaker.execute(async () => {
            const retryResult = await RequestRetry.execute(async () => {
                console.log('Sending template generation request:', request);
                
                const response = await fetch(`${API_BASE_URL}/api/template/generate`, {
                    method: 'POST',
                    headers: {
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
            }, this.retryConfig);

            if (retryResult.success) {
                return retryResult.data;
            } else {
                throw retryResult.error;
            }
        });
    }
    
    // Obrasci vrste
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
    
    async getObrasciVrsteById(id: number): Promise<ObrasciVrste> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/obrasci-vrste/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching obrasci vrste by id:', error);
            throw error;
        }
    }
    
    async createObrasciVrste(obrasciVrste: Omit<ObrasciVrste, 'id' | 'createdAt' | 'updatedAt'>): Promise<ObrasciVrste> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/obrasci-vrste`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obrasciVrste)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating obrasci vrste:', error);
            throw error;
        }
    }
    
    async updateObrasciVrste(id: number, obrasciVrste: Partial<ObrasciVrste>): Promise<ObrasciVrste> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/obrasci-vrste/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obrasciVrste)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating obrasci vrste:', error);
            throw error;
        }
    }
    
    async deleteObrasciVrste(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/obrasci-vrste/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting obrasci vrste:', error);
            throw error;
        }
    }
    
    // Organizaciona struktura
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
    
    async getOrganizacionaStrukturaById(id: number): Promise<OrganizacionaStruktura> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/organizaciona-struktura/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching organizaciona struktura by id:', error);
            throw error;
        }
    }
    
    async createOrganizacionaStruktura(organizacionaStruktura: Omit<OrganizacionaStruktura, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrganizacionaStruktura> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/organizaciona-struktura`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(organizacionaStruktura)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating organizaciona struktura:', error);
            throw error;
        }
    }
    
    async updateOrganizacionaStruktura(id: number, organizacionaStruktura: Partial<OrganizacionaStruktura>): Promise<OrganizacionaStruktura> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/organizaciona-struktura/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(organizacionaStruktura)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating organizaciona struktura:', error);
            throw error;
        }
    }
    
    async deleteOrganizacionaStruktura(id: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/template/organizaciona-struktura/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting organizaciona struktura:', error);
            throw error;
        }
    }

    // Dodatne funkcije za dobijanje podataka potrebnih za formu
    async getLice(tip: 't1' | 't2'): Promise<Lice[]> {
        try {
            // Učitaj sva lice sa paginacijom
            const allLice: Lice[] = [];
            let page = 0;
            let hasMore = true;
            const pageSize = 100; // Učitaj 100 po stranici

            while (hasMore) {
                const response = await fetch(`${API_BASE_URL}/api/euk/${tip}?page=${page}&size=${pageSize}`);
                
                if (!response.ok) {
                    console.warn(`Backend endpoint not available: /api/euk/${tip}. Using mock data.`);
                    return this.getMockLice(tip);
                }

                const data = await response.json();
                
                if (data.content && Array.isArray(data.content)) {
                    allLice.push(...data.content);
                    hasMore = !data.last; // last: true znači da je poslednja stranica
                    page++;
                } else {
                    hasMore = false;
                }
            }

            console.log(`Loaded ${allLice.length} ${tip} lice`);
            return allLice;
        } catch (error) {
            console.warn('Error fetching lice from backend, using mock data:', error);
            return this.getMockLice(tip);
        }
    }

    async getKategorije(): Promise<Kategorija[]> {
        try {
            const retryResult = await RequestRetry.execute(async () => {
                const response = await fetch(`${API_BASE_URL}/api/kategorije`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            }, this.retryConfig);

            if (retryResult.success) {
                return retryResult.data;
            } else {
                console.warn('Error fetching kategorije from backend, using mock data:', retryResult.error);
                return this.getMockKategorije();
            }
        } catch (error) {
            console.warn('Error fetching kategorije from backend, using mock data:', error);
            return this.getMockKategorije();
        }
    }

    async getPredmeti(): Promise<any[]> {
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

    // Mock data methods for development
    private getMockLice(tip: 't1' | 't2'): Lice[] {
        console.log(`Getting mock lice for ${tip}`);
        if (tip === 't1') {
            const mockData: Lice[] = [
                { id: 1, ime: 'Marko', prezime: 'Marković', jmbg: '1234567890123', tip: 't1' },
                { id: 2, ime: 'Petar', prezime: 'Petrović', jmbg: '1234567890124', tip: 't1' },
                { id: 3, ime: 'Ana', prezime: 'Anić', jmbg: '1234567890125', tip: 't1' }
            ];
            console.log('Mock T1 lice:', mockData);
            return mockData;
        } else {
            const mockData: Lice[] = [
                { id: 4, ime: 'Jovan', prezime: 'Jovanović', jmbg: '1234567890126', tip: 't2' },
                { id: 5, ime: 'Milica', prezime: 'Milić', jmbg: '1234567890127', tip: 't2' },
                { id: 6, ime: 'Stefan', prezime: 'Stefanović', jmbg: '1234567890128', tip: 't2' }
            ];
            console.log('Mock T2 lice:', mockData);
            return mockData;
        }
    }

    private getMockKategorije(): Kategorija[] {
        return [
            { id: 1, naziv: 'Kategorija 1', opis: 'Opis kategorije 1' },
            { id: 2, naziv: 'Kategorija 2', opis: 'Opis kategorije 2' },
            { id: 3, naziv: 'Kategorija 3', opis: 'Opis kategorije 3' }
        ];
    }

    private getMockPredmeti(): any[] {
        return [
            { id: 1, naziv: 'Predmet 1', opis: 'Opis predmeta 1' },
            { id: 2, naziv: 'Predmet 2', opis: 'Opis predmeta 2' },
            { id: 3, naziv: 'Predmet 3', opis: 'Opis predmeta 3' }
        ];
    }

    private getMockObrasciVrste(): ObrasciVrste[] {
        return [
            { 
                id: 1, 
                naziv: 'negativno', 
                opis: 'Negativni obrasci', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 2, 
                naziv: 'neograniceno', 
                opis: 'Neograničeni obrasci', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 3, 
                naziv: 'ograniceno', 
                opis: 'Ograničeni obrasci', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 4, 
                naziv: 'borci', 
                opis: 'Obrasci za borce', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 5, 
                naziv: 'penzioneri', 
                opis: 'Obrasci za penzionere', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 6, 
                naziv: 'obustave', 
                opis: 'Obrasci za obustave', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            }
        ];
    }

    private getMockOrganizacionaStruktura(): OrganizacionaStruktura[] {
        return [
            { 
                id: 1, 
                naziv: 'sekretar', 
                opis: 'Sekretar', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            },
            { 
                id: 2, 
                naziv: 'podsekretar', 
                opis: 'Podsekretar', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
            }
        ];
    }
}

// Export singleton instance
export const templateService = new TemplateGenerationService();
