/**
 * Circuit Breaker pattern za zaštitu od kaskadnih grešaka
 * Sprečava slanje zahteva kada servis nije dostupan
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
}

export class CircuitBreaker {
  private static instances = new Map<string, CircuitBreaker>();
  
  private readonly config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private readonly name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = {
      failureThreshold: 5,
      timeout: 10000, // 10 sekundi
      resetTimeout: 30000, // 30 sekundi
      monitoringPeriod: 60000, // 1 minut
      ...config
    };
    
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0
    };
  }

  /**
   * Dobij instance circuit breaker-a
   */
  static getInstance(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.instances.has(name)) {
      this.instances.set(name, new CircuitBreaker(name, config));
    }
    return this.instances.get(name)!;
  }

  /**
   * Izvršava zahtev kroz circuit breaker
   */
  async execute<T>(requestFn: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error(`Circuit breaker ${this.name} is OPEN. Next attempt at ${new Date(this.state.nextAttemptTime)}`);
      }
      this.state.state = 'HALF_OPEN';
      this.state.successCount = 0;
    }

    try {
      const result = await requestFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handler za uspešne zahteve
   */
  private onSuccess(): void {
    this.state.failureCount = 0;
    
    if (this.state.state === 'HALF_OPEN') {
      this.state.successCount++;
      if (this.state.successCount >= 2) {
        this.state.state = 'CLOSED';
        console.log(`[CircuitBreaker] ${this.name} state changed to CLOSED`);
      }
    }
  }

  /**
   * Handler za neuspešne zahteve
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();
    
    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.resetTimeout;
      console.log(`[CircuitBreaker] ${this.name} state changed to OPEN (from HALF_OPEN)`);
    } else if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.resetTimeout;
      console.log(`[CircuitBreaker] ${this.name} state changed to OPEN (threshold reached)`);
    }
  }

  /**
   * Vrati trenutno stanje circuit breaker-a
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Resetuj circuit breaker
   */
  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0
    };
    console.log(`[CircuitBreaker] ${this.name} reset to CLOSED state`);
  }

  /**
   * Vrati statistike
   */
  getStats() {
    return {
      name: this.name,
      state: this.state.state,
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      lastFailureTime: new Date(this.state.lastFailureTime).toISOString(),
      nextAttemptTime: new Date(this.state.nextAttemptTime).toISOString(),
      config: this.config
    };
  }

  /**
   * Proveri da li je circuit breaker spreman za zahteve
   */
  isAvailable(): boolean {
    return this.state.state === 'CLOSED' || 
           (this.state.state === 'HALF_OPEN' && this.state.successCount < 2) ||
           (this.state.state === 'OPEN' && Date.now() >= this.state.nextAttemptTime);
  }

  /**
   * Dobij sve instance
   */
  static getAllInstances(): Map<string, CircuitBreaker> {
    return new Map(this.instances);
  }

  /**
   * Resetuj sve instance
   */
  static resetAll(): void {
    this.instances.forEach(instance => instance.reset());
  }
}

export default CircuitBreaker;


