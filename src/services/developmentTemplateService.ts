import globalCache from './globalCacheService';
import requestThrottle from '@/utils/requestThrottle';
import RequestRetry from '@/utils/requestRetry';
import CircuitBreaker from '@/utils/circuitBreaker';
import AuthUtils from '@/utils/authUtils';
import { API_CONFIG } from '@/utils/apiConfig';

/**
 * Development-friendly template service
 * Ne šalje authentication token u development modu
 */
class DevelopmentTemplateService {
  private readonly BASE_URL = API_CONFIG.BASE_URL;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly circuitBreaker: CircuitBreaker;
  private readonly retryConfig = RequestRetry.createConservativeConfig();

  constructor() {
    this.circuitBreaker = CircuitBreaker.getInstance('development-template-service', {
      failureThreshold: 3,
      timeout: 5000,
      resetTimeout: 15000,
      monitoringPeriod: 30000
    });
  }

  /**
   * Kreiraj request sa ili bez autentifikacije
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      const retryResult = await RequestRetry.execute(async () => {
        const url = `${this.BASE_URL}${endpoint}`;
        
        // U development modu, ne šaljemo authentication token
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Uvek dodaj authentication token ako je dostupan i validan
        if (AuthUtils.isLoggedIn()) {
          const authHeader = AuthUtils.createAuthHeader();
          Object.assign(headers, authHeader);
          console.log(`[DEV] Using valid authentication token for ${endpoint}`);
        } else {
          console.warn(`[DEV] No valid authentication token found for ${endpoint}`);
          AuthUtils.logAuthStatus();
        }

        console.log(`[DEV] Making request to ${endpoint} ${AuthUtils.isLoggedIn() ? 'with' : 'without'} authentication`);

        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[DEV] Response from ${endpoint}: SUCCESS`, data);
        
        return Array.isArray(data) ? data : (data.data || data.results || []);
      }, this.retryConfig);

      if (retryResult.success) {
        return retryResult.data;
      } else {
        throw retryResult.error;
      }
    });
  }

  /**
   * Uzmi kategorije sa caching-om
   */
  async getKategorije() {
    return globalCache.getCachedData('kategorije', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/kategorije');
      });
    });
  }

  /**
   * Uzmi obrasci vrste sa caching-om
   */
  async getObrasciVrste() {
    return globalCache.getCachedData('obrasci-vrste', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/obrasci-vrste');
      });
    });
  }

  /**
   * Uzmi organizaciona struktura sa caching-om
   */
  async getOrganizacionaStruktura() {
    return globalCache.getCachedData('organizaciona-struktura', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/organizaciona-struktura');
      });
    });
  }

  /**
   * Uzmi predmeti sa caching-om
   */
  async getPredmeti() {
    return globalCache.getCachedData('predmeti', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/predmeti');
      });
    });
  }

  /**
   * Uzmi T1 lice sa caching-om
   */
  async getT1Lice() {
    return globalCache.getCachedData('t1-lice', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/euk/t1');
      });
    });
  }

  /**
   * Uzmi T2 lice sa caching-om
   */
  async getT2Lice() {
    return globalCache.getCachedData('t2-lice', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/euk/t2');
      });
    });
  }

  /**
   * Batch loading - učitaj sve podatke odjednom
   */
  async loadAllData() {
    try {
      console.log('Loading all data with development service...');
      
      const [kategorije, obrasciVrste, organizacionaStruktura, predmeti, t1Lice, t2Lice] = await Promise.allSettled([
        this.getKategorije(),
        this.getObrasciVrste(),
        this.getOrganizacionaStruktura(),
        this.getPredmeti(),
        this.getT1Lice(),
        this.getT2Lice()
      ]);

      const result = {
        kategorije: kategorije.status === 'fulfilled' ? kategorije.value : [],
        obrasciVrste: obrasciVrste.status === 'fulfilled' ? obrasciVrste.value : [],
        organizacionaStruktura: organizacionaStruktura.status === 'fulfilled' ? organizacionaStruktura.value : [],
        predmeti: predmeti.status === 'fulfilled' ? predmeti.value : [],
        t1Lice: t1Lice.status === 'fulfilled' ? t1Lice.value : [],
        t2Lice: t2Lice.status === 'fulfilled' ? t2Lice.value : []
      };

      console.log('Loaded data with development service:', {
        kategorije: Array.isArray(result.kategorije) ? result.kategorije.length : 0,
        obrasciVrste: Array.isArray(result.obrasciVrste) ? result.obrasciVrste.length : 0,
        organizacionaStruktura: Array.isArray(result.organizacionaStruktura) ? result.organizacionaStruktura.length : 0,
        predmeti: Array.isArray(result.predmeti) ? result.predmeti.length : 0,
        t1Lice: Array.isArray(result.t1Lice) ? result.t1Lice.length : 0,
        t2Lice: Array.isArray(result.t2Lice) ? result.t2Lice.length : 0
      });

      return result;
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }

  /**
   * Očisti cache
   */
  clearCache() {
    globalCache.clearCache();
    console.log('Development template service cache cleared');
  }

  /**
   * Očisti cache za specifičan tip podataka
   */
  clearCacheFor(type: string) {
    globalCache.clearCacheFor(type);
    console.log(`Cache cleared for ${type}`);
  }

  /**
   * Vrati cache statistike
   */
  getCacheStats() {
    return {
      globalCache: globalCache.getCacheStats(),
      throttle: requestThrottle.getThrottleStats(),
      isDevelopment: this.isDevelopment
    };
  }
}

const developmentTemplateService = new DevelopmentTemplateService();
export default developmentTemplateService;
