/**
 * Globalni cache servis za sprečavanje duplikata API poziva
 * Rešava problem 429 grešaka u React development mode-u
 */
class GlobalCacheService {
  private static instance: GlobalCacheService;
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();
  private lastFetch = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minuta

  static getInstance(): GlobalCacheService {
    if (!GlobalCacheService.instance) {
      GlobalCacheService.instance = new GlobalCacheService();
    }
    return GlobalCacheService.instance;
  }

  /**
   * Uzmi podatke iz cache-a ili ih učitaj ako nisu dostupni
   */
  async getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const lastFetchTime = this.lastFetch.get(key) || 0;
    
    // Proveri da li je cache još uvek važeći
    if (this.cache.has(key) && (now - lastFetchTime) < this.CACHE_DURATION) {
      console.log(`Cache hit for ${key}`);
      return this.cache.get(key);
    }

    // Proveri da li se već učitava
    if (this.loadingPromises.has(key)) {
      console.log(`Loading in progress for ${key}`);
      return this.loadingPromises.get(key);
    }

    // Kreiraj novi promise
    const promise = fetchFn()
      .then(data => {
        this.cache.set(key, data);
        this.lastFetch.set(key, now);
        this.loadingPromises.delete(key);
        console.log(`Data cached for ${key}`);
        return data;
      })
      .catch(error => {
        this.loadingPromises.delete(key);
        console.error(`Error fetching ${key}:`, error);
        throw error;
      });

    this.loadingPromises.set(key, promise);
    return promise;
  }

  /**
   * Očisti ceo cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.lastFetch.clear();
    console.log('Cache cleared');
  }

  /**
   * Očisti cache za specifičan ključ
   */
  clearCacheFor(key: string) {
    this.cache.delete(key);
    this.loadingPromises.delete(key);
    this.lastFetch.delete(key);
    console.log(`Cache cleared for ${key}`);
  }

  /**
   * Vrati cache statistike
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      loadingPromises: this.loadingPromises.size,
      cacheKeys: Array.from(this.cache.keys()),
      loadingKeys: Array.from(this.loadingPromises.keys()),
      lastFetchTimes: Object.fromEntries(this.lastFetch)
    };
  }

  /**
   * Proveri da li je cache važeći za ključ
   */
  isCacheValid(key: string): boolean {
    const now = Date.now();
    const lastFetchTime = this.lastFetch.get(key) || 0;
    return this.cache.has(key) && (now - lastFetchTime) < this.CACHE_DURATION;
  }

  /**
   * Vrati cache duration u milisekundama
   */
  getCacheDuration(): number {
    return this.CACHE_DURATION;
  }

  /**
   * Postavi cache duration
   */
  setCacheDuration(duration: number) {
    (this as any).CACHE_DURATION = duration;
    console.log(`Cache duration set to ${duration}ms`);
  }
}

export default GlobalCacheService.getInstance();
