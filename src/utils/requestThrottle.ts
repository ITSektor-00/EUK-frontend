import RequestRetry from './requestRetry';
import CircuitBreaker from './circuitBreaker';

/**
 * Poboljšani Request throttle utility za kontrolu istovremenih zahteva
 * Kombinuje throttling, retry logiku i circuit breaker pattern
 */
class RequestThrottle {
  private static instance: RequestThrottle;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private readonly maxConcurrent = 1; // Smanjeno sa 2 na 1 za bolju kontrolu
  private readonly delayBetweenRequests = 200; // Povećano sa 100ms na 200ms
  private readonly circuitBreaker: CircuitBreaker;
  private readonly retryConfig = RequestRetry.createConservativeConfig();

  constructor() {
    this.circuitBreaker = CircuitBreaker.getInstance('api-throttle', {
      failureThreshold: 3,
      timeout: 5000,
      resetTimeout: 15000,
      monitoringPeriod: 30000
    });
  }

  static getInstance(): RequestThrottle {
    if (!RequestThrottle.instance) {
      RequestThrottle.instance = new RequestThrottle();
    }
    return RequestThrottle.instance;
  }

  /**
   * Izvršava zahtev kroz throttle sistem sa retry logikom
   */
  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Koristi circuit breaker za zaštitu
          const result = await this.circuitBreaker.execute(async () => {
            // Koristi retry logiku za greške
            const retryResult = await RequestRetry.execute(requestFn, this.retryConfig);
            
            if (retryResult.success) {
              return retryResult.data;
            } else {
              throw retryResult.error;
            }
          });
          
          resolve(result!);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Procesira queue zahteva u batch-ovima
   */
  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, this.maxConcurrent);
      
      console.log(`Processing batch of ${batch.length} requests`);
      
      // Izvršava batch zahteva
      await Promise.allSettled(batch.map(request => request()));
      
      // Pauza između batch-ova
      if (this.requestQueue.length > 0) {
        console.log(`Waiting ${this.delayBetweenRequests}ms before next batch`);
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Očisti queue
   */
  clearQueue() {
    this.requestQueue = [];
    console.log('Request queue cleared');
  }

  /**
   * Vrati broj zahteva u queue-u
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Vrati throttle statistike
   */
  getThrottleStats() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      maxConcurrent: this.maxConcurrent,
      delayBetweenRequests: this.delayBetweenRequests,
      circuitBreaker: this.circuitBreaker.getStats(),
      retryConfig: this.retryConfig
    };
  }

  /**
   * Resetuj circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }

  /**
   * Postavi agresivniju retry konfiguraciju
   */
  setAggressiveRetry() {
    (this as any).retryConfig = RequestRetry.createAggressiveConfig();
  }

  /**
   * Postavi konzervativnu retry konfiguraciju
   */
  setConservativeRetry() {
    (this as any).retryConfig = RequestRetry.createConservativeConfig();
  }

  /**
   * Postavi maksimalni broj istovremenih zahteva
   */
  setMaxConcurrent(max: number) {
    (this as any).maxConcurrent = max;
    console.log(`Max concurrent requests set to ${max}`);
  }

  /**
   * Postavi pauzu između batch-ova
   */
  setDelayBetweenRequests(delay: number) {
    (this as any).delayBetweenRequests = delay;
    console.log(`Delay between requests set to ${delay}ms`);
  }
}

export default RequestThrottle.getInstance();
