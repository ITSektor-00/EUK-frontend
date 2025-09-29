export interface GlobalLicenseInfo {
  hasValidLicense: boolean;
  endDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  message: string;
  notificationSent?: boolean;
}

export interface GlobalLicenseCheckResponse {
  hasValidLicense: boolean;
  message: string;
}

export interface GlobalLicense {
  id: number;
  licenseKey: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalLicenseResponse {
  success: boolean;
  license: GlobalLicense;
}

class GlobalLicenseService {
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
   * Proverava status globalne licence
   * @returns Promise<GlobalLicenseInfo>
   */
  async checkGlobalLicenseStatus(): Promise<GlobalLicenseInfo> {
    try {
      const cacheKey = this.getCacheKey('/api/global-license/status');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('Using cached global license data');
        return cached;
      }

      // Proveri da li je već u toku zahtev
      if (this.pendingRequests.has(cacheKey)) {
        console.log('Request already pending for global license');
        return this.pendingRequests.get(cacheKey)!;
      }

      const requestPromise = this.retryRequest(async () => {
        console.log('Checking global license status...');
        const url = `${this.baseURL}/api/global-license/status`;
        console.log(`Request URL: ${url}`);
        
        // Dodaj Authorization header ako postoji token
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });
        
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            // Ako nema dozvolu, pretpostavi da je licenca važeća (fallback)
            console.log('No permission for global license, assuming valid license');
            const fallbackLicense = {
              hasValidLicense: true,
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              daysUntilExpiry: 365,
              isExpiringSoon: false,
              message: 'Лиценца је важећа',
              notificationSent: false
            };
            this.setCache(cacheKey, fallbackLicense, 300000);
            return fallbackLicense;
          } else if (response.status === 404) {
            // Ako endpoint ne postoji, pretpostavi da je licenca važeća (fallback)
            console.log('Global license endpoint not found, assuming valid license');
            const fallbackLicense = {
              hasValidLicense: true,
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              daysUntilExpiry: 365,
              isExpiringSoon: false,
              message: 'Лиценца је важећа',
              notificationSent: false
            };
            this.setCache(cacheKey, fallbackLicense, 300000);
            return fallbackLicense;
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          } else if (response.status === 500) {
            throw new Error('Server greška pri proveri licence. Molimo pokušajte ponovo.');
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
          message: data.message || 'Лиценца није важећа',
          notificationSent: data.notificationSent || false
        };
        
        console.log('Processed global license info:', licenseInfo);

        // Cache za 5 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, licenseInfo, 300000);
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
      console.error('Global license check failed, using fallback:', error);
      
      // Fallback: pretpostavi da je licenca važeća ako ne može da se proveri
      const fallbackLicense = {
        hasValidLicense: true,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        daysUntilExpiry: 365,
        isExpiringSoon: false,
        message: 'Licenca je važeća',
        notificationSent: false
      };
      
      // Cache fallback rezultat
      const cacheKey = this.getCacheKey('/api/global-license/status');
      this.setCache(cacheKey, fallbackLicense, 60000); // Cache za 1 minut
      
      return fallbackLicense;
    }
  }

  /**
   * Proverava da li postoji važeća globalna licenca
   * @returns Promise<GlobalLicenseCheckResponse>
   */
  async checkGlobalLicense(): Promise<GlobalLicenseCheckResponse> {
    try {
      const cacheKey = this.getCacheKey('/api/global-license/check');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const requestFn = async () => {
        // Dodaj Authorization header ako postoji token
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseURL}/api/global-license/check`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            throw new Error('Nemate dozvolu za pristup globalnoj licenci.');
          } else if (response.status === 404) {
            throw new Error('Globalna licenca nije pronađena.');
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za globalnu licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          } else if (response.status === 500) {
            throw new Error('Server greška pri proveri globalne licence. Molimo pokušajte ponovo.');
          }
          throw new Error(`Greška pri proveri globalne licence: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Validacija odgovora
        if (!data || typeof data !== 'object') {
          throw new Error('Neispravan odgovor od servera');
        }

        const result = {
          hasValidLicense: data.hasValidLicense || false,
          message: data.message || 'Лиценца није важећа'
        };

        // Cache za 5 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, result, 300000);
        return result;
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri proveri globalne licence');
    }
  }

  /**
   * Dobija aktivnu globalnu licencu
   * @returns Promise<GlobalLicenseResponse>
   */
  async getActiveGlobalLicense(): Promise<GlobalLicenseResponse> {
    try {
      const cacheKey = this.getCacheKey('/api/global-license/active');
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const requestFn = async () => {
        // Dodaj Authorization header ako postoji token
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseURL}/api/global-license/active`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
          } else if (response.status === 403) {
            throw new Error('Nemate dozvolu za pristup globalnoj licenci.');
          } else if (response.status === 404) {
            throw new Error('Aktivna globalna licenca nije pronađena.');
          } else if (response.status === 429) {
            throw new Error('Previše zahteva za globalnu licencu. Molimo sačekajte malo pre ponovnog pokušaja.');
          } else if (response.status === 500) {
            throw new Error('Server greška pri učitavanju globalne licence. Molimo pokušajte ponovo.');
          }
          throw new Error(`Greška pri učitavanju globalne licence: HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Validacija odgovora
        if (!data || typeof data !== 'object') {
          throw new Error('Neispravan odgovor od servera');
        }

        const result = {
          success: data.success || false,
          license: data.license || null
        };

        // Cache za 10 minuta da smanjimo broj zahteva
        this.setCache(cacheKey, result, 600000);
        return result;
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri učitavanju globalne licence');
    }
  }

  /**
   * Proverava da li je globalna licenca istekla
   * @param licenseInfo - Informacije o globalnoj licenci
   * @returns boolean
   */
  isGlobalLicenseExpired(licenseInfo: GlobalLicenseInfo): boolean {
    return !licenseInfo.hasValidLicense;
  }

  /**
   * Proverava da li globalna licenca ističe uskoro (manje od 30 dana)
   * @param licenseInfo - Informacije o globalnoj licenci
   * @returns boolean
   */
  isGlobalLicenseExpiringSoon(licenseInfo: GlobalLicenseInfo): boolean {
    return licenseInfo.isExpiringSoon || licenseInfo.daysUntilExpiry <= 30;
  }

  /**
   * Formatira datum isteka globalne licence
   * @param endDate - Datum isteka u ISO formatu
   * @returns string
   */
  formatGlobalLicenseEndDate(endDate: string): string {
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
   * Generiše poruku o statusu globalne licence
   * @param licenseInfo - Informacije o globalnoj licenci
   * @returns string
   */
  getGlobalLicenseStatusMessage(licenseInfo: GlobalLicenseInfo): string {
    if (this.isGlobalLicenseExpired(licenseInfo)) {
      return 'Globalna licenca je istekla. Kontaktirajte administratora za produženje licence.';
    }
    
    if (this.isGlobalLicenseExpiringSoon(licenseInfo)) {
      return `Globalna licenca će isteći za ${licenseInfo.daysUntilExpiry} dana (${this.formatGlobalLicenseEndDate(licenseInfo.endDate)}).`;
    }
    
    if (licenseInfo.notificationSent) {
      return `Imate obaveštenje o globalnoj licenci. Globalna licenca je važeća do ${this.formatGlobalLicenseEndDate(licenseInfo.endDate)}.`;
    }
    
    return `Globalna licenca je važeća do ${this.formatGlobalLicenseEndDate(licenseInfo.endDate)}.`;
  }

  /**
   * Kreira novu globalnu licencu (Admin funkcija)
   * @param licenseData - Podaci o novoj licenci
   * @returns Promise<any>
   */
  async createGlobalLicense(licenseData: {
    licenseKey: string;
    startDate: string;
    endDate: string;
  }): Promise<any> {
    try {
      // Dodaj Authorization header
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseURL}/api/global-license/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(licenseData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else if (response.status === 403) {
          throw new Error('Nemate dozvolu za kreiranje globalne licence.');
        } else if (response.status === 409) {
          throw new Error('Globalna licenca već postoji.');
        } else if (response.status === 500) {
          throw new Error('Server greška pri kreiranju globalne licence. Molimo pokušajte ponovo.');
        }
        throw new Error(`Greška pri kreiranju globalne licence: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Očisti cache nakon kreiranja
      this.clearGlobalLicenseCache();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri kreiranju globalne licence');
    }
  }

  /**
   * Produžava globalnu licencu (Admin funkcija)
   * @param extensionData - Podaci o produženju
   * @returns Promise<any>
   */
  async extendGlobalLicense(extensionData: {
    newEndDate: string;
  }): Promise<any> {
    try {
      // Dodaj Authorization header
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseURL}/api/global-license/extend`, {
        method: 'POST',
        headers,
        body: JSON.stringify(extensionData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else if (response.status === 403) {
          throw new Error('Nemate dozvolu za produženje globalne licence.');
        } else if (response.status === 404) {
          throw new Error('Globalna licenca nije pronađena.');
        } else if (response.status === 500) {
          throw new Error('Server greška pri produženju globalne licence. Molimo pokušajte ponovo.');
        }
        throw new Error(`Greška pri produženju globalne licence: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Očisti cache nakon produženja
      this.clearGlobalLicenseCache();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri produženju globalne licence');
    }
  }

  /**
   * Deaktivira istekle globalne licence (Admin funkcija)
   * @returns Promise<any>
   */
  async deactivateExpiredGlobalLicenses(): Promise<any> {
    try {
      // Dodaj Authorization header
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseURL}/api/global-license/admin/deactivate-expired`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else if (response.status === 403) {
          throw new Error('Nemate dozvolu za deaktivaciju globalnih licenci.');
        } else if (response.status === 500) {
          throw new Error('Server greška pri deaktivaciji globalnih licenci. Molimo pokušajte ponovo.');
        }
        throw new Error(`Greška pri deaktivaciji globalnih licenci: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Očisti cache nakon deaktivacije
      this.clearGlobalLicenseCache();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Greška pri deaktivaciji globalnih licenci');
    }
  }

  /**
   * Očisti cache za globalnu licencu
   */
  clearGlobalLicenseCache(): void {
    this.requestCache.clear();
    console.log('Global license cache cleared');
  }
}

export const globalLicenseService = new GlobalLicenseService();
