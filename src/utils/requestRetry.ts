/**
 * Retry utility sa eksponencijalnim backoff-om za HTTP greške
 * Rešava probleme sa 429 (Too Many Requests) i 403 (Forbidden) greškama
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition: (error: any) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

export class RequestRetry {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 sekunda
    maxDelay: 10000, // 10 sekundi
    backoffMultiplier: 2,
    retryCondition: (error: any) => {
      // Retry za 429, 500, 502, 503, 504 greške (ne retry-ujemo 403)
      const status = error?.status || error?.response?.status;
      return [429, 500, 502, 503, 504].includes(status);
    }
  };

  /**
   * Izvršava zahtev sa retry logikom
   */
  static async execute<T>(
    requestFn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        console.log(`[Retry] Attempt ${attempt}/${finalConfig.maxAttempts}`);
        
        const result = await requestFn();
        
        console.log(`[Retry] Success on attempt ${attempt}`);
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        console.log(`[Retry] Attempt ${attempt} failed:`, error);

        // Proveri da li treba da retry-ujemo
        if (attempt === finalConfig.maxAttempts || !finalConfig.retryCondition(error)) {
          break;
        }

        // Izračunaj delay za sledeći pokušaj
        const delay = this.calculateDelay(attempt, finalConfig);
        console.log(`[Retry] Waiting ${delay}ms before retry...`);
        
        await this.sleep(delay);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[Retry] All attempts failed after ${totalTime}ms`);
    
    return {
      success: false,
      error: lastError!,
      attempts: finalConfig.maxAttempts,
      totalTime
    };
  }

  /**
   * Izračunava delay za sledeći pokušaj
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry condition za 429 greške
   */
  static retryOn429(error: any): boolean {
    const status = error?.status || error?.response?.status;
    return status === 429;
  }

  /**
   * Retry condition za 403 greške (obično ne retry-ujemo 403 jer je to auth problem)
   */
  static retryOn403(error: any): boolean {
    const status = error?.status || error?.response?.status;
    // 403 greške obično znače problem sa autentifikacijom, ne retry-ujemo ih
    return false;
  }

  /**
   * Retry condition za network greške
   */
  static retryOnNetworkError(error: any): boolean {
    return error?.name === 'TypeError' || 
           error?.message?.includes('fetch') ||
           error?.message?.includes('network');
  }

  /**
   * Kombinovana retry condition
   */
  static retryOnCommonErrors(error: any): boolean {
    return this.retryOn429(error) || 
           this.retryOnNetworkError(error);
  }

  /**
   * Kreiraj custom retry config za specifične slučajeve
   */
  static createConfig(overrides: Partial<RetryConfig> = {}): RetryConfig {
    return { ...this.DEFAULT_CONFIG, ...overrides };
  }

  /**
   * Kreiraj aggressive retry config za kritične operacije
   */
  static createAggressiveConfig(): RetryConfig {
    return {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 15000,
      backoffMultiplier: 1.5,
      retryCondition: this.retryOnCommonErrors
    };
  }

  /**
   * Kreiraj conservative retry config za non-kritične operacije
   */
  static createConservativeConfig(): RetryConfig {
    return {
      maxAttempts: 2,
      baseDelay: 2000,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryCondition: this.retryOn429
    };
  }
}

export default RequestRetry;
