import { 
    OdbijaSeTemplateRequest, 
    OdbijaSeTemplateResponse, 
    Lice, 
    Kategorija, 
    ObrasciVrste, 
    OrganizacionaStruktura, 
    Predmet 
} from '@/types/odbijaSeTemplate';
import { debounce } from '@/utils/debounce';
import { API_CONFIG, RETRY_STATUS_CODES, RATE_LIMIT_HEADERS } from '@/utils/apiConfig';
import requestInterceptor from '@/utils/requestInterceptor';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Optimizovani OdbijaSeTemplateService sa caching-om, retry logikom i batch loading-om
 */
export class OptimizedOdbijaSeTemplateService {
    private cache = new Map<string, any>();
    private loadingPromises = new Map<string, Promise<any>>();
    private requestInterceptor = requestInterceptor;

    // Debounced API pozivi
    private debouncedGetKategorije = debounce(this.getKategorije.bind(this), API_CONFIG.DEBOUNCE_DELAY);
    private debouncedGetObrasciVrste = debounce(this.getObrasciVrste.bind(this), API_CONFIG.DEBOUNCE_DELAY);
    private debouncedGetOrganizacionaStruktura = debounce(this.getOrganizacionaStruktura.bind(this), API_CONFIG.DEBOUNCE_DELAY);

    /**
     * Generisanje OДБИЈА СЕ template-a
     */
    async generateOdbijaSeTemplate(request: OdbijaSeTemplateRequest): Promise<OdbijaSeTemplateResponse> {
        return this.requestInterceptor.execute(async () => {
            try {
                console.log('Sending OДБИЈА СЕ template generation request:', request);
                
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/template/generate-odbija-se`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request)
                });

                return await response.json();
            } catch (error) {
                console.error('Error generating OДБИЈА СЕ template:', error);
                throw error;
            }
        });
    }

    /**
     * Download generisanog dokumenta
     */
    async downloadTemplate(filePath: string): Promise<void> {
        return this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/template/download?filePath=${encodeURIComponent(filePath)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Kreiraj download link
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filePath.split('/').pop() || 'template.docx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Error downloading template:', error);
                throw error;
            }
        });
    }

    /**
     * Uzmi T1 lice sa caching-om
     */
    async getT1Lice(): Promise<Lice[]> {
        const cacheKey = 't1-lice';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning T1 lice from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('T1 lice already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/euk/t1`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const lice = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, lice);
                this.loadingPromises.delete(cacheKey);
                return lice;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading T1 lice:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Uzmi T2 lice sa caching-om
     */
    async getT2Lice(): Promise<Lice[]> {
        const cacheKey = 't2-lice';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning T2 lice from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('T2 lice already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/euk/t2`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const lice = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, lice);
                this.loadingPromises.delete(cacheKey);
                return lice;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading T2 lice:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Uzmi kategorije sa caching-om i debouncing-om
     */
    async getKategorije(): Promise<Kategorija[]> {
        const cacheKey = 'kategorije';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning kategorije from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('Kategorije already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/kategorije`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const kategorije = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, kategorije);
                this.loadingPromises.delete(cacheKey);
                return kategorije;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading kategorije:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Uzmi obrasci vrste sa caching-om i debouncing-om
     */
    async getObrasciVrste(): Promise<ObrasciVrste[]> {
        const cacheKey = 'obrasci-vrste';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning obrasci vrste from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('Obrasci vrste already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/obrasci-vrste`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const obrasci = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, obrasci);
                this.loadingPromises.delete(cacheKey);
                return obrasci;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading obrasci vrste:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Uzmi organizaciona struktura sa caching-om i debouncing-om
     */
    async getOrganizacionaStruktura(): Promise<OrganizacionaStruktura[]> {
        const cacheKey = 'organizaciona-struktura';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning organizaciona struktura from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('Organizaciona struktura already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/organizaciona-struktura`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const struktura = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, struktura);
                this.loadingPromises.delete(cacheKey);
                return struktura;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading organizaciona struktura:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Uzmi predmeti sa caching-om
     */
    async getPredmeti(): Promise<Predmet[]> {
        const cacheKey = 'predmeti';
        
        if (this.cache.has(cacheKey)) {
            console.log('Returning predmeti from cache');
            return this.cache.get(cacheKey);
        }

        if (this.loadingPromises.has(cacheKey)) {
            console.log('Predmeti already loading, returning existing promise');
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this.requestInterceptor.execute(async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await this.fetchWithRetry(`${API_BASE_URL}/api/predmeti`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                const predmeti = Array.isArray(data) ? data : (data.data || data.results || []);
                
                this.cache.set(cacheKey, predmeti);
                this.loadingPromises.delete(cacheKey);
                return predmeti;
            } catch (error) {
                this.loadingPromises.delete(cacheKey);
                console.error('Error loading predmeti:', error);
                return [];
            }
        });

        this.loadingPromises.set(cacheKey, promise);
        return promise;
    }

    /**
     * Batch loading - učitaj sve podatke odjednom
     */
    async loadAllInitialData() {
        // Dodaj malu pauzu da se token stigne učitati iz localStorage-a
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Proveri da li je korisnik autentifikovan
        const token = localStorage.getItem('token');
        console.log('Token check in loadAllInitialData:', token ? 'Token found' : 'No token');
        
        if (!token) {
            console.log('No token found, returning empty data');
            return {
                t1Lice: [],
                t2Lice: [],
                kategorije: [],
                obrasciVrste: [],
                organizacionaStruktura: [],
                predmeti: []
            };
        }

        try {
            console.log('Loading all initial data with batch loading...');
            
            const [t1Lice, t2Lice, kategorije, obrasciVrste, organizacionaStruktura, predmeti] = await Promise.allSettled([
                this.getT1Lice(),
                this.getT2Lice(),
                this.getKategorije(),
                this.getObrasciVrste(),
                this.getOrganizacionaStruktura(),
                this.getPredmeti()
            ]);

            const result = {
                t1Lice: t1Lice.status === 'fulfilled' ? t1Lice.value : [],
                t2Lice: t2Lice.status === 'fulfilled' ? t2Lice.value : [],
                kategorije: kategorije.status === 'fulfilled' ? kategorije.value : [],
                obrasciVrste: obrasciVrste.status === 'fulfilled' ? obrasciVrste.value : [],
                organizacionaStruktura: organizacionaStruktura.status === 'fulfilled' ? organizacionaStruktura.value : [],
                predmeti: predmeti.status === 'fulfilled' ? predmeti.value : []
            };

            console.log('Batch loading completed:', {
                t1Lice: result.t1Lice.length,
                t2Lice: result.t2Lice.length,
                kategorije: result.kategorije.length,
                obrasciVrste: result.obrasciVrste.length,
                organizacionaStruktura: result.organizacionaStruktura.length,
                predmeti: result.predmeti.length
            });

            return result;
        } catch (error) {
            console.error('Error in batch loading:', error);
            throw error;
        }
    }

    /**
     * Retry logika sa eksponencijalnim backoff-om
     */
    private async fetchWithRetry(url: string, options: RequestInit, maxRetries = API_CONFIG.RETRY_ATTEMPTS): Promise<Response> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
                });

                if (RETRY_STATUS_CODES.includes(response.status)) {
                    // Rate limit ili server greška - pokušaj ponovo
                    const retryAfter = response.headers.get(RATE_LIMIT_HEADERS.RETRY_AFTER);
                    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * API_CONFIG.RETRY_DELAY;
                    
                    if (i < maxRetries - 1) {
                        console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms for ${url}`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response;
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                
                // Eksponencijalni backoff
                const waitTime = Math.pow(2, i) * API_CONFIG.RETRY_DELAY;
                console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms for ${url}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        throw new Error(`Max retries (${maxRetries}) exceeded for ${url}`);
    }

    /**
     * Očisti cache
     */
    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
        console.log('Cache cleared');
    }

    /**
     * Očisti specifičan cache entry
     */
    clearCacheEntry(key: string) {
        this.cache.delete(key);
        this.loadingPromises.delete(key);
        console.log(`Cache entry '${key}' cleared`);
    }

    /**
     * Vrati cache statistike
     */
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            loadingPromises: this.loadingPromises.size,
            cacheKeys: Array.from(this.cache.keys()),
            loadingKeys: Array.from(this.loadingPromises.keys())
        };
    }
}

const optimizedOdbijaSeTemplateService = new OptimizedOdbijaSeTemplateService();
export default optimizedOdbijaSeTemplateService;
