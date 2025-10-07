import optimizedTemplateService from './optimizedTemplateService';
import fallbackTemplateService from './fallbackTemplateService';

/**
 * Adaptive template service koji automatski prebacuje na fallback
 * kada optimizovani servis ne radi zbog 429/403 grešaka
 */
class AdaptiveTemplateService {
  private useFallback = false;
  private fallbackTriggered = false;
  private readonly maxRetries = 2;

  /**
   * Proveri da li treba da koristi fallback
   */
  private shouldUseFallback(error: any): boolean {
    const status = error?.status || error?.response?.status;
    // 403 greške znače problem sa autentifikacijom, ne prebacujemo na fallback
    return status === 429 || error?.message?.includes('Circuit breaker');
  }

  /**
   * Resetuj fallback mode
   */
  resetFallback() {
    this.useFallback = false;
    this.fallbackTriggered = false;
    console.log('[Adaptive] Reset to optimized service');
  }

  /**
   * Uzmi kategorije sa adaptive logikom
   */
  async getKategorije() {
    if (this.useFallback) {
      return fallbackTemplateService.getKategorije();
    }

    try {
      return await optimizedTemplateService.getKategorije();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for kategorije due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getKategorije();
      }
      throw error;
    }
  }

  /**
   * Uzmi obrasci vrste sa adaptive logikom
   */
  async getObrasciVrste() {
    if (this.useFallback) {
      return fallbackTemplateService.getObrasciVrste();
    }

    try {
      return await optimizedTemplateService.getObrasciVrste();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for obrasci vrste due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getObrasciVrste();
      }
      throw error;
    }
  }

  /**
   * Uzmi organizaciona struktura sa adaptive logikom
   */
  async getOrganizacionaStruktura() {
    if (this.useFallback) {
      return fallbackTemplateService.getOrganizacionaStruktura();
    }

    try {
      return await optimizedTemplateService.getOrganizacionaStruktura();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for organizaciona struktura due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getOrganizacionaStruktura();
      }
      throw error;
    }
  }

  /**
   * Uzmi predmeti sa adaptive logikom
   */
  async getPredmeti() {
    if (this.useFallback) {
      return fallbackTemplateService.getPredmeti();
    }

    try {
      return await optimizedTemplateService.getPredmeti();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for predmeti due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getPredmeti();
      }
      throw error;
    }
  }

  /**
   * Uzmi T1 lice sa adaptive logikom
   */
  async getT1Lice() {
    if (this.useFallback) {
      return fallbackTemplateService.getT1Lice();
    }

    try {
      return await optimizedTemplateService.getT1Lice();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for T1 lice due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getT1Lice();
      }
      throw error;
    }
  }

  /**
   * Uzmi T2 lice sa adaptive logikom
   */
  async getT2Lice() {
    if (this.useFallback) {
      return fallbackTemplateService.getT2Lice();
    }

    try {
      return await optimizedTemplateService.getT2Lice();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for T2 lice due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.getT2Lice();
      }
      throw error;
    }
  }

  /**
   * Load all data sa adaptive logikom
   */
  async loadAllData() {
    if (this.useFallback) {
      console.log('[Adaptive] Using fallback service for loadAllData');
      return fallbackTemplateService.loadAllData();
    }

    try {
      console.log('[Adaptive] Attempting to load data with optimized service');
      return await optimizedTemplateService.loadAllData();
    } catch (error) {
      if (this.shouldUseFallback(error)) {
        console.log('[Adaptive] Switching to fallback for loadAllData due to error:', error);
        this.useFallback = true;
        this.fallbackTriggered = true;
        return fallbackTemplateService.loadAllData();
      }
      throw error;
    }
  }

  /**
   * Očisti cache
   */
  clearCache() {
    if (!this.useFallback) {
      optimizedTemplateService.clearCache();
    }
    console.log('[Adaptive] Cache cleared');
  }

  /**
   * Vrati statistike servisa
   */
  getServiceStats() {
    return {
      currentService: this.useFallback ? 'fallback' : 'optimized',
      fallbackTriggered: this.fallbackTriggered,
      optimizedStats: !this.useFallback ? optimizedTemplateService.getCacheStats() : null,
      fallbackInfo: this.useFallback ? fallbackTemplateService.getServiceInfo() : null
    };
  }

  /**
   * Pokušaj da se vrati na optimizovani servis
   */
  async tryOptimizedService(): Promise<boolean> {
    if (!this.useFallback) {
      return true; // Već koristi optimizovani servis
    }

    try {
      console.log('[Adaptive] Testing if optimized service is available...');
      await optimizedTemplateService.getKategorije();
      
      // Ako je uspešno, vrati se na optimizovani servis
      this.resetFallback();
      console.log('[Adaptive] Successfully switched back to optimized service');
      return true;
    } catch (error) {
      console.log('[Adaptive] Optimized service still not available:', error);
      return false;
    }
  }

  /**
   * Resetuj circuit breaker i pokušaj ponovo
   */
  async resetAndRetry() {
    console.log('[Adaptive] Resetting circuit breaker and retrying...');
    optimizedTemplateService.resetCircuitBreaker();
    
    // Sačekaj malo pre ponovnog pokušaja
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.tryOptimizedService();
  }
}

const adaptiveTemplateService = new AdaptiveTemplateService();
export default adaptiveTemplateService;
