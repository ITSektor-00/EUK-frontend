import { useState, useCallback } from 'react';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  lastError: any;
}

export function useRetry(config: RetryConfig = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error: any) => {
      // Podrazumevano retry za 429, 500, 502, 503, 504 greške
      if (typeof error === 'object' && error.status) {
        return [429, 500, 502, 503, 504].includes(error.status);
      }
      return false;
    }
  } = config;

  const [state, setState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    lastError: null
  });

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    onRetry?: (retryCount: number, delay: number) => void
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt }));
          
          // Eksponencijalni backoff
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
          
          if (onRetry) {
            onRetry(attempt, delay);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await operation();
        
        // Uspešno izvršeno - resetuj stanje
        setState({
          retryCount: 0,
          isRetrying: false,
          lastError: null
        });
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !shouldRetry(error)) {
          // Poslednji pokušaj ili ne treba retry
          setState({
            retryCount: attempt,
            isRetrying: false,
            lastError: error
          });
          throw error;
        }
      }
    }
    
    throw lastError;
  }, [maxRetries, baseDelay, maxDelay, shouldRetry]);

  const reset = useCallback(() => {
    setState({
      retryCount: 0,
      isRetrying: false,
      lastError: null
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state
  };
}
