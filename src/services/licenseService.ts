export interface LicenseInfo {
  hasValidLicense: boolean;
  endDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  message?: string;
  notificationSent?: boolean;
}

export interface LicenseCheckResponse {
  hasValidLicense: boolean;
  message: string;
}

export interface UserLicense {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  licenseType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLicensesResponse {
  success: boolean;
  licenses: UserLicense[];
  count: number;
}

class LicenseService {
  private baseURL: string;
  private requestCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com');
  }

  /**
   * Helper za retry logiku sa exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>, 
    retries: number = 3, 
    baseDelay: number = 1000
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (retries > 0 && (error.message?.includes('429') || error.message?.includes('Previše zahteva'))) {
        const delay = baseDelay * Math.pow(2, 3 - retries);
        console.log(`Rate limiting detected, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retries - 1, baseDelay);
      }
      throw error;
    }
  }

  /**
   * Helper za cache management
   */
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.requestCache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number = 30000): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Proverava status licence za korisnika
   * @param userId - ID korisnika
   * @param token - JWT token za autentifikaciju
   * @returns Promise<LicenseInfo>
   */
  async checkLicenseStatus(userId: number, token: string): Promise<LicenseInfo> {
    try {
      if (!userId || !token) {
        throw new Error('userId i token su obavezni');
      }

      const cacheKey = this.getCacheKey('/api/licenses/status', { userId });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Using cached license data for user:', userId);
        console.log('Cached data:', cached);
        // Proveri da li cached data sadrži notificationSent
        if (cached.notificationSent === undefined) {
          console.log('Cached data missing notificationSent, fetching fresh data...');
          // Ukloni cached data i fetch fresh
          this.requestCache.delete(cacheKey);
        } else {
          return cached;
        }
      }

      // Proveri da li je već u toku zahtev za ovog korisnika
      if (this.pendingRequests.has(cacheKey)) {
        console.log('Request already pending for user:', userId);
        return this.pendingRequests.get(cacheKey)!;
      }

      const requestPromise = this.retryRequest(async () => {
        console.log(`Checking license status for user ${userId}...`);
        const url = `${this.baseURL}/api/licenses/status?userId=${userId}`;
        console.log(`Request URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            throw new Error('Nemate dozvolu za pristup licencnim podacima.');
          } else if (response.status === 404) {
            throw new Error('Licencni podaci nisu pronađeni.');
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          }
          throw new Error(`Greška pri proveri licence: HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        // Validacija odgovora
        if (!data || typeof data !== 'object') {
          throw new Error('Neispravan odgovor od servera');
        }

        const licenseInfo = {
          hasValidLicense: data.hasValidLicense || false,
          endDate: data.endDate || '',
          daysUntilExpiry: data.daysUntilExpiry || 0,
          isExpiringSoon: data.isExpiringSoon || false,
          message: data.message,
          notificationSent: data.notificationSent || false
        };
        
        console.log('Processed license info:', licenseInfo);

        // Cache za 15 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, licenseInfo, 900000);
        return licenseInfo;
      });

      // Dodaj pending zahtev
      this.pendingRequests.set(cacheKey, requestPromise);

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Ukloni pending zahtev
        this.pendingRequests.delete(cacheKey);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri proveri statusa licence');
    }
  }

  /**
   * Proverava da li korisnik ima važeću licencu
   * @param userId - ID korisnika
   * @param token - JWT token za autentifikaciju
   * @returns Promise<LicenseCheckResponse>
   */
  async checkLicense(userId: number, token: string): Promise<LicenseCheckResponse> {
    try {
      if (!userId || !token) {
        throw new Error('userId i token su obavezni');
      }

      const cacheKey = this.getCacheKey('/api/licenses/check', { userId });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const requestFn = async () => {
        const response = await fetch(`${this.baseURL}/api/licenses/check/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            throw new Error('Nemate dozvolu za pristup licencnim podacima.');
          } else if (response.status === 404) {
            throw new Error('Licencni podaci nisu pronađeni.');
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          }
          throw new Error(`Greška pri proveri licence: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Validacija odgovora
        if (!data || typeof data !== 'object') {
          throw new Error('Neispravan odgovor od servera');
        }

        const result = {
          hasValidLicense: data.hasValidLicense || false,
          message: data.message || 'Licenca nije važeća'
        };

        // Cache za 15 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, result, 900000);
        return result;
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri proveri licence');
    }
  }

  /**
   * Dobija sve licence korisnika
   * @param userId - ID korisnika
   * @param token - JWT token za autentifikaciju
   * @returns Promise<UserLicensesResponse>
   */
  async getUserLicenses(userId: number, token: string): Promise<UserLicensesResponse> {
    try {
      if (!userId || !token) {
        throw new Error('userId i token su obavezni');
      }

      const cacheKey = this.getCacheKey('/api/licenses/user', { userId });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const requestFn = async () => {
        const response = await fetch(`${this.baseURL}/api/licenses/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            throw new Error('Nemate dozvolu za pristup licencnim podacima.');
          } else if (response.status === 404) {
            throw new Error('Licencni podaci nisu pronađeni.');
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          }
          throw new Error(`Greška pri učitavanju licenci: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Validacija odgovora
        if (!data || typeof data !== 'object') {
          throw new Error('Neispravan odgovor od servera');
        }

        const result = {
          success: data.success || false,
          licenses: data.licenses || [],
          count: data.count || 0
        };

        // Cache za 20 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, result, 1200000);
        return result;
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri učitavanju licenci korisnika');
    }
  }

  /**
   * Proverava da li je licenca istekla ili će uskoro isteći
   * @param licenseInfo - Informacije o licenci
   * @returns boolean
   */
  isLicenseExpired(licenseInfo: LicenseInfo): boolean {
    return !licenseInfo.hasValidLicense;
  }

  /**
   * Proverava da li licenca ističe uskoro (manje od 30 dana)
   * @param licenseInfo - Informacije o licenci
   * @returns boolean
   */
  isLicenseExpiringSoon(licenseInfo: LicenseInfo): boolean {
    return licenseInfo.isExpiringSoon || licenseInfo.daysUntilExpiry <= 30;
  }

  /**
   * Formatira datum isteka licence
   * @param endDate - Datum isteka u ISO formatu
   * @returns string
   */
  formatEndDate(endDate: string): string {
    try {
      const date = new Date(endDate);
      return date.toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Nepoznat datum';
    }
  }

  /**
   * Generiše poruku o statusu licence
   * @param licenseInfo - Informacije o licenci
   * @returns string
   */
  getLicenseStatusMessage(licenseInfo: LicenseInfo): string {
    if (this.isLicenseExpired(licenseInfo)) {
      return 'Vaša licenca je istekla. Kontaktirajte administratora za produženje licence.';
    }
    
    if (this.isLicenseExpiringSoon(licenseInfo)) {
      return `Vaša licenca će isteći za ${licenseInfo.daysUntilExpiry} dana (${this.formatEndDate(licenseInfo.endDate)}).`;
    }
    
    if (licenseInfo.notificationSent) {
      return `Imate licencno obaveštenje. Vaša licenca je važeća do ${this.formatEndDate(licenseInfo.endDate)}.`;
    }
    
    return `Vaša licenca je važeća do ${this.formatEndDate(licenseInfo.endDate)}.`;
  }

  /**
   * Očisti cache za licence
   */
  clearLicenseCache(): void {
    this.requestCache.clear();
    console.log('License cache cleared');
  }

  /**
   * Očisti cache za određenog korisnika
   */
  clearUserLicenseCache(userId: number): void {
    const cacheKey = this.getCacheKey('/api/licenses/status', { userId });
    this.requestCache.delete(cacheKey);
    console.log(`License cache cleared for user: ${userId}`);
  }
}

export const licenseService = new LicenseService();