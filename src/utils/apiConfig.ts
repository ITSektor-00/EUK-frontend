import { API_BASE_URL } from '@/config/api';

/**
 * API konfiguracija za optimizaciju zahteva
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_CONCURRENT_REQUESTS: 3,
  DEBOUNCE_DELAY: 300,
  THROTTLE_LIMIT: 1000,
};

/**
 * HTTP status kodovi za retry logiku
 */
export const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Rate limit headers
 */
export const RATE_LIMIT_HEADERS = {
  RETRY_AFTER: 'Retry-After',
  X_RATE_LIMIT_REMAINING: 'X-Rate-Limit-Remaining',
  X_RATE_LIMIT_RESET: 'X-Rate-Limit-Reset',
};
