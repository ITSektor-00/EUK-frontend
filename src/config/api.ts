/**
 * Centralizovana API konfiguracija
 * Backend URL se automatski povlači iz environment varijabli
 */

export const API_CONFIG = {
  // Backend URL - koristi NEXT_PUBLIC_API_URL iz .env.local ili default localhost:8080
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // Timeout za API pozive (u milisekundama)
  timeout: 10000,
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Export API_BASE_URL za kompatibilnost sa postojećim kodom
 * Koristi se u svim route fajlovima i servisima
 */
export const API_BASE_URL = API_CONFIG.baseURL;

/**
 * Helper funkcija za pravljenje API URL-ova
 * @param path - API endpoint path (npr. '/api/auth/signin')
 * @returns Kompletan URL
 */
export function getApiUrl(path: string): string {
  const baseURL = API_CONFIG.baseURL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
}

/**
 * Helper funkcija za API pozive sa standardnim konfiguracijama
 * @param path - API endpoint path
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function apiRequest(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options?.headers,
    },
  };

  return fetch(url, config);
}

