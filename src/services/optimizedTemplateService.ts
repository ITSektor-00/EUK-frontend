import globalCache from './globalCacheService';
import requestThrottle from '@/utils/requestThrottle';
import RequestRetry from '@/utils/requestRetry';
import CircuitBreaker from '@/utils/circuitBreaker';
import AuthUtils from '@/utils/authUtils';
import { API_CONFIG } from '@/utils/apiConfig';

/**
 * Optimizovani template service sa naprednim error handling-om
 * Kombinuje caching, throttling, retry logiku i circuit breaker pattern
 */
class OptimizedTemplateService {
  private readonly BASE_URL = API_CONFIG.BASE_URL;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly circuitBreaker: CircuitBreaker;
  private readonly retryConfig = RequestRetry.createConservativeConfig();

  constructor() {
    this.circuitBreaker = CircuitBreaker.getInstance('optimized-template-service', {
      failureThreshold: 3,
      timeout: 8000,
      resetTimeout: 20000,
      monitoringPeriod: 45000
    });
  }

  /**
   * Kreiraj request sa naprednim error handling-om
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      const retryResult = await RequestRetry.execute(async () => {
        const url = `${this.BASE_URL}${endpoint}`;
        
        // Pripremi headers
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        // Uvek dodaj authentication token ako je dostupan i validan
        if (AuthUtils.isLoggedIn()) {
          const authHeader = AuthUtils.createAuthHeader();
          Object.assign(headers, authHeader);
          console.log(`[Optimized] Using valid authentication token for ${endpoint}`);
        } else {
          console.warn(`[Optimized] No valid authentication token found for ${endpoint}`);
          AuthUtils.logAuthStatus();
        }

        console.log(`[Optimized] Making request to ${endpoint} ${AuthUtils.isLoggedIn() ? 'with' : 'without'} authentication`);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          ...options
        });

        if (!response.ok) {
          // Specijalno rukovanje za 429 greške
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
            console.log(`[Optimized] Rate limited, waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Specijalno rukovanje za 403 greške
          if (response.status === 403) {
            console.error(`[Optimized] Authentication error for ${endpoint}. Check if token is valid.`);
            const errorText = await response.text().catch(() => 'Authentication failed');
            throw new Error(`Authentication error! status: ${response.status}, message: ${errorText}`);
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[Optimized] Response from ${endpoint}: SUCCESS`);
        
        return Array.isArray(data) ? data : (data.data || data.results || data.content || []);
      }, this.retryConfig);

      if (retryResult.success) {
        return retryResult.data;
      } else {
        throw retryResult.error;
      }
    });
  }

  /**
   * Uzmi kategorije sa naprednim caching-om i error handling-om
   */
  async getKategorije() {
    return globalCache.getCachedData('kategorije', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/kategorije');
      });
    });
  }

  /**
   * Uzmi obrasci vrste sa naprednim caching-om i error handling-om
   */
  async getObrasciVrste() {
    return globalCache.getCachedData('obrasci-vrste', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/obrasci-vrste');
      });
    });
  }

  /**
   * Uzmi organizaciona struktura sa naprednim caching-om i error handling-om
   */
  async getOrganizacionaStruktura() {
    return globalCache.getCachedData('organizaciona-struktura', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/organizaciona-struktura');
      });
    });
  }

  /**
   * Uzmi predmeti sa naprednim caching-om i error handling-om
   */
  async getPredmeti() {
    return globalCache.getCachedData('predmeti', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/predmeti');
      });
    });
  }

  /**
   * Uzmi T1 lice sa naprednim caching-om i error handling-om
   */
  async getT1Lice() {
    return globalCache.getCachedData('t1-lice', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/euk/t1');
      });
    });
  }

  /**
   * Uzmi T2 lice sa naprednim caching-om i error handling-om
   */
  async getT2Lice() {
    return globalCache.getCachedData('t2-lice', async () => {
      return requestThrottle.execute(async () => {
        return this.makeRequest('/api/euk/t2');
      });
    });
  }

  /**
   * Batch loading sa naprednim error handling-om
   * Koristi Promise.allSettled da ne prekida loading ako neki endpoint ne radi
   */
  async loadAllData() {
    try {
      console.log('[Optimized] Loading all data with advanced error handling...');
      
      // Koristi Promise.allSettled da ne prekida loading ako neki endpoint ne radi
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

      // Loguj rezultate
      console.log('[Optimized] Loaded data successfully:', {
        kategorije: Array.isArray(result.kategorije) ? result.kategorije.length : 0,
        obrasciVrste: Array.isArray(result.obrasciVrste) ? result.obrasciVrste.length : 0,
        organizacionaStruktura: Array.isArray(result.organizacionaStruktura) ? result.organizacionaStruktura.length : 0,   
        predmeti: Array.isArray(result.predmeti) ? result.predmeti.length : 0,
        t1Lice: Array.isArray(result.t1Lice) ? result.t1Lice.length : 0,
        t2Lice: Array.isArray(result.t2Lice) ? result.t2Lice.length : 0
      });

      // Loguj greške
      [kategorije, obrasciVrste, organizacionaStruktura, predmeti, t1Lice, t2Lice].forEach((promise, index) => {
        if (promise.status === 'rejected') {
          const endpoints = ['kategorije', 'obrasci-vrste', 'organizaciona-struktura', 'predmeti', 't1-lice', 't2-lice'];
          console.warn(`[Optimized] Failed to load ${endpoints[index]}:`, promise.reason);
        }
      });

      return result;
    } catch (error) {
      console.error('[Optimized] Error loading all data:', error);
      throw error;
    }
  }

  /**
   * Očisti cache
   */
  clearCache() {
    globalCache.clearCache();
    console.log('[Optimized] Cache cleared');
  }

  /**
   * Očisti cache za specifičan tip podataka
   */
  clearCacheFor(type: string) {
    globalCache.clearCacheFor(type);
    console.log(`[Optimized] Cache cleared for ${type}`);
  }

  /**
   * Vrati cache statistike
   */
  getCacheStats() {
    return {
      globalCache: globalCache.getCacheStats(),
      throttle: requestThrottle.getThrottleStats(),
      circuitBreaker: this.circuitBreaker.getStats(),
      isDevelopment: this.isDevelopment
    };
  }

  /**
   * Resetuj circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset();
    requestThrottle.resetCircuitBreaker();
  }

  /**
   * Postavi agresivnu retry konfiguraciju
   */
  setAggressiveRetry() {
    (this as any).retryConfig = RequestRetry.createAggressiveConfig();
    requestThrottle.setAggressiveRetry();
  }

  /**
   * Postavi konzervativnu retry konfiguraciju
   */
  setConservativeRetry() {
    (this as any).retryConfig = RequestRetry.createConservativeConfig();
    requestThrottle.setConservativeRetry();
  }
}

const optimizedTemplateService = new OptimizedTemplateService();
export default optimizedTemplateService;