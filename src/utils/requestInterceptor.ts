import { API_CONFIG } from './apiConfig';

/**
 * Request interceptor za kontrolu istovremenih zahteva
 * Sprečava preopterećenje servera sa previše istovremenih zahteva
 */
export class RequestInterceptor {
  private static instance: RequestInterceptor;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private readonly maxConcurrent = API_CONFIG.MAX_CONCURRENT_REQUESTS;

  static getInstance(): RequestInterceptor {
    if (!RequestInterceptor.instance) {
      RequestInterceptor.instance = new RequestInterceptor();
    }
    return RequestInterceptor.instance;
  }

  /**
   * Izvršava zahtev kroz queue sistem
   */
  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
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
      await Promise.allSettled(batch.map(request => request()));
      
      // Kratka pauza između batch-ova da se izbegne rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * Očisti queue
   */
  clearQueue() {
    this.requestQueue = [];
  }

  /**
   * Vrati broj zahteva u queue-u
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }
}

export default RequestInterceptor.getInstance();
