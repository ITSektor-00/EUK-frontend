import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const shouldRetry = (error: Error, attempt: number, maxRetries: number): boolean => {
    if (attempt >= maxRetries) return false;
    
    // Retry za network greške, timeout greške, i 5xx greške
    const retryableErrors = [
      'Failed to fetch',
      'NetworkError',
      'timeout',
      'ECONNRESET',
      'ENOTFOUND'
    ];
    
    const retryableStatuses = [500, 502, 503, 504, 408, 429];
    
    // Proveri da li je greška retryable
    if (retryableErrors.some(err => error.message.includes(err))) {
      return true;
    }
    
    // Proveri HTTP status kod
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      return retryableStatuses.includes(status);
    }
    
    return false;
  };

  const apiCall = useCallback(async (
    endpoint: string, 
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ) => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      retryCondition = shouldRetry
    } = retryOptions;

    setLoading(true);
    setError(null);
    
    let lastError: Error | null = null;
    
    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
            ...options,
          });
          
          if (!response.ok) {
            let errorData: any = {};
            try {
              errorData = await response.json();
            } catch {
              errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
            }
            
            const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            lastError = new Error(errorMessage);
            
            // Ako je 401 ili 403, ne retry-uj
            if (response.status === 401 || response.status === 403) {
              throw lastError;
            }
            
            // Proveri da li treba retry
            if (attempt < maxRetries && retryCondition(lastError, attempt, maxRetries)) {
              const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
              console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
              await sleep(delay);
              continue;
            }
            
            throw lastError;
          }
          
          const data = await response.json();
          return data;
          
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error('Nepoznata greška');
          
          // Ako je poslednji pokušaj ili greška nije retryable, baci grešku
          if (attempt >= maxRetries || !retryCondition(lastError, attempt, maxRetries)) {
            break;
          }
          
          const delay = retryDelay * Math.pow(2, attempt);
          console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
          await sleep(delay);
        }
      }
      
      // Svi pokušaji su neuspešni
      const errorMessage = lastError?.message || 'Nepoznata greška';
      setError(errorMessage);
      throw lastError || new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
} 