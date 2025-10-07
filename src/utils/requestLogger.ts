/**
 * Request logger za debugging API poziva
 * Pomaže u identifikaciji problema sa autentifikacijom
 */
export const logRequest = (endpoint: string, isDevelopment: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Making request to ${endpoint} ${isDevelopment ? 'without' : 'with'} authentication`);
  }
};

export const logResponse = (endpoint: string, success: boolean, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Response from ${endpoint}:`, success ? 'SUCCESS' : 'ERROR', data);
  }
};

export const logError = (endpoint: string, error: Error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[DEV] Error from ${endpoint}:`, error.message);
  }
};

export const logAuthCheck = (hasToken: boolean, tokenValue?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Auth check: ${hasToken ? 'Token found' : 'No token'}`, tokenValue ? `(${tokenValue.substring(0, 10)}...)` : '');
  }
};

export const logServiceSelection = (serviceType: string, isDevelopment: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Service selection: ${serviceType} (development: ${isDevelopment})`);
  }
};

export const logCacheHit = (key: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Cache hit for ${key}`);
  }
};

export const logCacheMiss = (key: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Cache miss for ${key}`);
  }
};

export const logThrottleQueue = (queueLength: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Throttle queue length: ${queueLength}`);
  }
};
