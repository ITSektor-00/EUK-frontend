class ApiService {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 500; // Minimum 500ms between requests

  constructor() {
    // Koristi direktne URL-ove za backend
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080'  // Direktan poziv backend-a u development-u
      : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'); // Direktan poziv u production-u
  }

  // Cache helper methods
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Helper za error handling
  private handleApiError(error: Error | unknown): string {
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Greška mreže. Proverite internet konekciju.';
      }
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return 'Backend server nije dostupan. Proverite da li je server pokrenut na portu 8080.';
      }
      return error.message;
    }
    
    return 'Nepoznata greška';
  }

  // Helper za API pozive sa token-om
  async apiCall(endpoint: string, options: RequestInit = {}, token?: string, retries: number = 1, useCache: boolean = false, cacheTTL: number = 30000): Promise<any> {
    
    // Validacija token-a ako je potreban
    if (token && typeof token !== 'string') {
      throw new Error('Neispravan token format');
    }
    
    if (token && token.trim() === '') {
      throw new Error('Token ne može biti prazan');
    }
    
    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
    
    // Create request key for deduplication
    const requestKey = `${options.method || 'GET'}:${endpoint}:${token?.substring(0, 10) || 'no-token'}`;
    
    // Check if same request is already pending
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }
    
    // Check cache for GET requests
    if (useCache && (options.method === 'GET' || !options.method)) {
      const cacheKey = this.getCacheKey(endpoint, { token: token?.substring(0, 10) });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create the request promise and store it for deduplication
    const requestPromise = this.executeRequest(url, options, headers, endpoint, token, retries, useCache, cacheTTL);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest(url: string, options: RequestInit, headers: Record<string, string>, endpoint: string, token?: string, retries: number = 1, useCache: boolean = false, cacheTTL: number = 30000): Promise<any> {
    try {
      // Dodaj timeout od 30 sekundi da sprečimo beskonačno čekanje
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekundi timeout
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          const responseText = await response.text();
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { error: 'Empty response body' };
          }
        } catch (parseError) {
          errorData = { error: 'Response is not JSON', parseError: parseError };
        }
        
        
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else if (response.status === 403) {
          throw new Error('Nemate dozvolu za pristup ovom resursu. Proverite da li ste ulogovani kao administrator.');
        } else if (response.status === 404) {
          throw new Error('Traženi resurs nije pronađen.');
        } else if (response.status === 429) {
          // Retry for rate limiting with exponential backoff
          if (retries > 0) {
            const backoffDelay = Math.pow(2, 3 - retries) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            return this.executeRequest(url, options, headers, endpoint, token, retries - 1, useCache, cacheTTL);
          }
          throw new Error('Previše zahteva. Molimo sačekajte malo pre ponovnog pokušaja.');
        } else if (response.status >= 500) {
          // For 500 errors, retry ako je moguće
          if (retries > 0) {
            const backoffDelay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            return this.executeRequest(url, options, headers, endpoint, token, retries - 1, useCache, cacheTTL);
          }
          throw new Error(`Backend endpoint not implemented (${response.status}): ${url}`);
        }
        
        const errorMessage = 
          (typeof errorData.message === 'string' && errorData.message) ||
          (typeof errorData.error === 'string' && errorData.error) ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      let data;
      
      // Handle 204 No Content response (common for DELETE operations)
      if (response.status === 204) {
        return { success: true, message: 'Operation completed successfully' };
      }
      
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(`Server returned invalid JSON response. Status: ${response.status}`);
      }
      
      // Cache successful GET responses
      if (useCache && (options.method === 'GET' || !options.method)) {
        const cacheKey = this.getCacheKey(endpoint, { token: token?.substring(0, 10) });
        this.setCache(cacheKey, data, cacheTTL);
      }
      
      return data;
    } catch (error) {
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Zahtev je prekinut zbog prekoračenja vremena (30s). Server je možda preopterećen.');
      }
      // Handle network connection errors specifically
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Backend server nije dostupan. Proverite da li je server pokrenut na portu 8080.');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Greška mreže. Proverite internet konekciju.');
      }
      throw error;
    }
  }

  // EUK API endpoints

  async getPredmeti(params: string, token: string) {
    return this.apiCall(`/api/euk/predmeti?${params}`, { method: 'GET' }, token);
  }

  async createPredmet(data: Record<string, unknown>, token: string) {
    const result = await this.apiCall('/api/euk/predmeti', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    
    return result;
  }

  async updatePredmet(id: number, data: Record<string, unknown>, token: string) {
    const result = await this.apiCall(`/api/euk/predmeti/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
    
    return result;
  }

  async deletePredmet(id: number, token: string) {
    const result = await this.apiCall(`/api/euk/predmeti/${id}`, { method: 'DELETE' }, token);
    return result;
  }

  async getUgrozenaLica(params: string, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica-t1?${params}`, { method: 'GET' }, token);
  }

  async createUgrozenoLice(data: Record<string, unknown>, token: string) {
    const result = await this.apiCall('/api/euk/ugrozena-lica-t1', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async createUgrozenoLiceBatch(data: Record<string, unknown>[], token: string) {
    const result = await this.apiCall('/api/euk/ugrozena-lica-t1/batch', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }, token);
    return result;
  }

  async updateUgrozenoLice(id: number, data: Record<string, unknown>, token: string) {
    const result = await this.apiCall(`/api/euk/ugrozena-lica-t1/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async deleteUgrozenoLice(id: number, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica-t1/${id}`, { method: 'DELETE' }, token);
  }

  // Novi T1 endpoint-i za napredne pretrage
  async searchUgrozenoLiceByJmbg(jmbg: string, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica-t1/search/jmbg/${jmbg}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceByRedniBroj(redniBroj: string, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica-t1/search/redni-broj/${redniBroj}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceByName(ime: string, prezime: string, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica-t1/search/name?ime=${ime}&prezime=${prezime}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceByFilters(filters: Record<string, unknown>, token: string) {
    return this.apiCall('/api/euk/ugrozena-lica-t1/search/filters', { 
      method: 'POST', 
      body: JSON.stringify(filters) 
    }, token);
  }

  async getUgrozenaLicaStatistics(token: string) {
    return this.apiCall('/api/euk/ugrozena-lica-t1/statistics', { method: 'GET' }, token);
  }

  async getUgrozenaLicaCount(token: string) {
    return this.apiCall('/api/euk/ugrozena-lica-t1/count', { method: 'GET' }, token);
  }

  // ===== UGROZENO LICE T2 API ENDPOINTS =====

  async getUgrozenaLicaT2(params: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2?${params}`, { method: 'GET' }, token);
  }

  async createUgrozenoLiceT2(data: Record<string, unknown>, token: string) {
    const result = await this.apiCall('/api/ugrozeno-lice-t2', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async createUgrozenoLiceT2Batch(data: Record<string, unknown>[], token: string) {
    const result = await this.apiCall('/api/ugrozeno-lice-t2/bulk', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }, token);
    return result;
  }

  async updateUgrozenoLiceT2(id: number, data: Record<string, unknown>, token: string) {
    const result = await this.apiCall(`/api/ugrozeno-lice-t2/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async deleteUgrozenoLiceT2(id: number, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/${id}`, { method: 'DELETE' }, token);
  }

  // T2 napredne pretrage
  async searchUgrozenoLiceT2ByJmbg(jmbg: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/search?jmbg=${jmbg}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceT2ByRedniBroj(redniBroj: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/search?redniBroj=${redniBroj}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceT2ByName(ime: string, prezime: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/search/ime-prezime?ime=${ime}&prezime=${prezime}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceT2ByAdresa(gradOpstina: string, mesto: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/search/adresa?gradOpstina=${gradOpstina}&mesto=${mesto}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceT2ByEnergetski(edBroj: string, token: string) {
    return this.apiCall(`/api/ugrozeno-lice-t2/search/energetski?edBroj=${edBroj}`, { method: 'GET' }, token);
  }

  async searchUgrozenoLiceT2ByFilters(filters: Record<string, unknown>, token: string) {
    return this.apiCall('/api/ugrozeno-lice-t2/search', { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, token);
  }

  async searchUgrozenoLiceT2ByJmbgList(jmbgList: string[], token: string) {
    return this.apiCall('/api/ugrozeno-lice-t2/search/jmbg-list', { 
      method: 'POST', 
      body: JSON.stringify(jmbgList) 
    }, token);
  }

  async getUgrozenaLicaT2Statistics(token: string) {
    return this.apiCall('/api/ugrozeno-lice-t2/statistics', { method: 'GET' }, token);
  }

  async getUgrozenaLicaT2Count(token: string) {
    return this.apiCall('/api/ugrozeno-lice-t2/count', { method: 'GET' }, token);
  }

  // Kategorije endpoints
  async getKategorije(params: string, token: string) {
    return this.apiCall(`/api/euk/kategorije?${params}`, { method: 'GET' }, token);
  }

  async createKategorija(data: Record<string, unknown>, token: string) {
    const result = await this.apiCall('/api/euk/kategorije', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    this.clearCache('kategorije');
    return result;
  }

  async createKategorijaBatch(data: Record<string, unknown>[], token: string) {
    const result = await this.apiCall('/api/euk/kategorije/batch', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    this.clearCache('kategorije');
    return result;
  }

  async updateKategorija(id: number, data: Record<string, unknown>, token: string) {
    const result = await this.apiCall(`/api/euk/kategorije/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
    this.clearCache('kategorije');
    return result;
  }

  async deleteKategorija(id: number, token: string) {
    const result = await this.apiCall(`/api/euk/kategorije/${id}`, { method: 'DELETE' }, token);
    this.clearCache('kategorije');
    return result;
  }

  async searchKategorijeByFilters(filters: Record<string, unknown>, token: string) {
    return this.apiCall('/api/euk/kategorije/search', { 
      method: 'POST', 
      body: JSON.stringify(filters) 
    }, token);
  }

  async getKategorijeStatistics(token: string) {
    return this.apiCall('/api/euk/kategorije/statistics', { method: 'GET' }, token);
  }

  async getKategorijeCount(token: string) {
    return this.apiCall('/api/euk/kategorije/count', { method: 'GET' }, token);
  }

  async getKategorijaBatchProgress(batchId: string, token: string) {
    return this.apiCall(`/api/euk/kategorije/batch-progress/${batchId}`, { method: 'GET' }, token);
  }

  // Auth endpoints
  async signUp(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      // Validacija podataka
      if (!userData.username || !userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Svi podaci su obavezni za registraciju');
      }

      if (typeof userData.username !== 'string' || typeof userData.email !== 'string' || 
          typeof userData.password !== 'string' || typeof userData.firstName !== 'string' || 
          typeof userData.lastName !== 'string') {
        throw new Error('Neispravan format podataka');
      }

      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        if (response.status === 400) {
          throw new Error('Neispravni podaci za registraciju');
        } else if (response.status === 409) {
          throw new Error('Korisnik sa tim korisničkim imenom ili email-om već postoji');
        } else if (response.status === 429) {
          throw new Error('Previše pokušaja registracije. Molimo sačekajte malo');
        }
        
        throw new Error(errorData.message || 'Greška pri registraciji');
      }

      const data = await response.json();
      
      // Validacija odgovora
      if (!data || !data.token) {
        throw new Error('Neispravan odgovor od servera. Token nije pronađen.');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    if (!username || typeof username !== 'string') {
      return false;
    }

    try {
      if (!this.baseURL) {
        return false;
      }

      const url = `${this.baseURL}/api/auth/check-username?username=${encodeURIComponent(username)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      
      const testUrl = `${this.baseURL}/api/test/check-username-test?username=${encodeURIComponent(username)}`;
      
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        return testData.available;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async signIn(credentials: {
    usernameOrEmail: string;
    password: string;
  }) {
    try {
      // Validacija credentials
      if (!credentials.usernameOrEmail || !credentials.password) {
        throw new Error('Korisničko ime/email i lozinka su obavezni');
      }

      if (typeof credentials.usernameOrEmail !== 'string' || typeof credentials.password !== 'string') {
        throw new Error('Neispravan format credentials');
      }

      const response = await fetch(`${this.baseURL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        if (response.status === 401) {
          // Proverava da li je greška zbog neodobrenog naloga
          if (errorData && (
              errorData.message === 'Nalog nije odobren od strane administratora' ||
              errorData.error === 'Nalog nije odobren od strane administratora' ||
              (typeof errorData.message === 'string' && errorData.message.includes('odobren')) ||
              (typeof errorData.error === 'string' && errorData.error.includes('odobren'))
          )) {
            // Vraćamo specijalan response umesto bacanja greške
            return {
              success: false,
              code: 'ACCOUNT_PENDING_APPROVAL',
              message: 'Nalog nije odobren od strane administratora'
            };
          }
          throw new Error('Neispravno korisničko ime ili lozinka');
        } else if (response.status === 403) {
          // Specijalan status za neodobrene korisnike - vraćamo response umesto greške
          return {
            success: false,
            code: 'ACCOUNT_PENDING_APPROVAL',
            message: 'Nalog nije odobren od strane administratora'
          };
        } else if (response.status === 429) {
          throw new Error('Previše pokušaja prijave. Molimo sačekajte malo');
        }
        
        throw new Error(errorData.message || 'Greška pri prijavi');
      }

      const data = await response.json();
      
      // Validacija odgovora
      if (!data || !data.token) {
        throw new Error('Neispravan odgovor od servera. Token nije pronađen.');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(token: string) {
    try {
      // Validacija token-a
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('Token je obavezan i ne može biti prazan');
      }

      // Očisti sve cache-ove pre fetch-a
      this.clearAllCache();

      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else if (response.status === 403) {
          throw new Error('Nemate dozvolu za pristup ovom resursu.');
        }
        throw new Error(`Greška pri učitavanju korisnika: HTTP ${response.status}`);
      }

      const userData = await response.json();
      
      // Validacija odgovora
      if (!userData || typeof userData !== 'object') {
        throw new Error('Neispravan odgovor od servera');
      }

      return userData;
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
  }

  async getUserProfile(token: string) {
    return this.apiCall('/api/user/profile', { method: 'GET' }, token);
  }


  // Test endpoints
  async testHello(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/test/hello`);
      if (!response.ok) {
        throw new Error('Greška pri testiranju hello endpoint-a');
      }
      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
  }

  // Admin endpoints
  async getAllUsers(token: string, useCache: boolean = true, cacheTTL: number = 60000) {
    return this.apiCall('/api/admin/users', { method: 'GET' }, token, 1, useCache, cacheTTL);
  }

  async getUsersWithPagination(token: string, page: number = 1, size: number = 20, filters?: {
    page?: number;
    role?: string;
    search?: string;
  }, useCache: boolean = true, cacheTTL: number = 60000) {
    const params = new URLSearchParams({
      page: (filters?.page !== undefined ? filters.page : page).toString(),
      size: size.toString(),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.search && { search: filters.search })
    });
    
    const endpoint = `/api/admin/users?${params.toString()}`;
    
    return this.apiCall(endpoint, { method: 'GET' }, token, 1, useCache, cacheTTL);
  }

  async getUserById(userId: number, token: string) {
    return this.apiCall(`/api/users/${userId}`, { method: 'GET' }, token);
  }

  async getUserByUsername(username: string, token: string) {
    return this.apiCall(`/api/users/username/${username}`, { method: 'GET' }, token);
  }

  async getUserByEmail(email: string, token: string) {
    return this.apiCall(`/api/users/email/${email}`, { method: 'GET' }, token);
  }

  async getUsersByRole(role: string, token: string) {
    return this.apiCall(`/api/users/role/${role}`, { method: 'GET' }, token);
  }

  async getActiveUsers(token: string) {
    return this.apiCall('/api/users/active', { method: 'GET' }, token);
  }

  async getInactiveUsers(token: string) {
    return this.apiCall('/api/users/inactive', { method: 'GET' }, token);
  }

  async getUsersCount(token: string) {
    return this.apiCall('/api/users/count', { method: 'GET' }, token, 1, true, 60000); // Cache for 1 minute
  }

  async getActiveUsersCount(token: string) {
    return this.apiCall('/api/users/count/active', { method: 'GET' }, token, 1, true, 60000); // Cache for 1 minute
  }

  async approveUser(userId: number, token: string) {
    const result = await this.apiCall(`/api/admin/users/${userId}/approve`, { method: 'POST' }, token, 3, false, 0); // 3 retries, no cache
    this.clearCache('users'); // Clear user-related cache after approval
    return result;
  }

  async rejectUser(userId: number, token: string) {
    const result = await this.apiCall(`/api/admin/users/${userId}/reject`, { method: 'POST' }, token, 3, false, 0); // 3 retries, no cache
    this.clearCache('users'); // Clear user-related cache after rejection
    return result;
  }

  async updateUserRole(userId: number, role: string, token: string) {
    const result = await this.apiCall(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }, token, 3, false, 0); // 3 retries, no cache, no TTL for PUT requests
    this.clearCache('users'); // Clear user-related cache after role update
    return result;
  }

  async deleteUser(userId: number, token: string) {
    const result = await this.apiCall(`/api/admin/users/${userId}`, { method: 'DELETE' }, token, 3, false, 0); // 3 retries, no cache
    this.clearCache('users'); // Clear user-related cache after deletion
    return result;
  }

  // AdminController specific endpoints
  async getAdminUsersCount(token: string) {
    return this.apiCall('/api/admin/users/count', { method: 'GET' }, token, 1, true, 60000); // Cache for 1 minute
  }

  async getAdminActiveUsersCount(token: string) {
    return this.apiCall('/api/admin/users/count/active', { method: 'GET' }, token, 1, true, 60000); // Cache for 1 minute
  }

  async getAdminPendingUsersCount(token: string) {
    return this.apiCall('/api/admin/users/count/pending', { method: 'GET' }, token, 1, true, 60000); // Cache for 1 minute
  }

  async getAdminActiveUsers(token: string) {
    return this.apiCall('/api/admin/users/active', { method: 'GET' }, token, 1, true, 30000); // Cache for 30 seconds
  }

  async getAdminInactiveUsers(token: string) {
    return this.apiCall('/api/admin/users/inactive', { method: 'GET' }, token, 1, true, 30000); // Cache for 30 seconds
  }

  async testStatus(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/test/status`);
      if (!response.ok) {
        throw new Error('Greška pri testiranju status endpoint-a');
      }
      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
  }

  async testEcho(message: unknown): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/test/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: message as string
      });
      
      if (!response.ok) {
        throw new Error('Greška pri testiranju echo endpoint-a');
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
  }

  // CORS test
  async testCORS() {
    try {
      const response = await fetch(`${this.baseURL}/api/test/cors-test`);
      if (!response.ok) {
        throw new Error('Greška pri testiranju CORS endpoint-a');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
  }

  // ===== NOVI SISTEM NIVOA PRISTUPA =====

  // GET /api/admin/routes - Vrati sve rute sa nivoima
  async getRoutes(token: string) {
    try {
      return await this.apiCall('/api/admin/routes', { method: 'GET' }, token, 1, true, 60000);
    } catch {
      // Fallback data - sve rute sa nivoima
      return [
        {
          id: 1,
          ruta: 'euk/kategorije',
          naziv: 'Kategorije',
          opis: 'Upravljanje kategorijama predmeta',
          sekcija: 'EUK',
          nivoMin: 1,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          ruta: 'euk/predmeti',
          naziv: 'Predmeti',
          opis: 'Upravljanje predmetima',
          sekcija: 'EUK',
          nivoMin: 2,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 3,
          ruta: 'euk/ugrozena-lica',
          naziv: 'Ugrožena lica',
          opis: 'Upravljanje ugroženim licima',
          sekcija: 'EUK',
          nivoMin: 3,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 4,
          ruta: 'euk/stampanje',
          naziv: 'Štampanje',
          opis: 'Štampanje dokumenata',
          sekcija: 'EUK',
          nivoMin: 4,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 5,
          ruta: 'reports',
          naziv: 'Izveštaji',
          opis: 'Generisanje izveštaja',
          sekcija: 'REPORTS',
          nivoMin: 4,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 6,
          ruta: 'analytics',
          naziv: 'Analitika',
          opis: 'Analitika sistema',
          sekcija: 'ANALYTICS',
          nivoMin: 4,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 7,
          ruta: 'settings',
          naziv: 'Podešavanja',
          opis: 'Korisnička podešavanja',
          sekcija: 'SETTINGS',
          nivoMin: 1,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        },
        {
          id: 8,
          ruta: 'profile',
          naziv: 'Profil',
          opis: 'Korisnički profil',
          sekcija: 'PROFILE',
          nivoMin: 1,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: '2024-01-15T10:30:00'
        }
      ];
    }
  }

  // GET /api/admin/user-routes - Vrati sve user routes sa nivoima
  async getUserRoutes(token: string) {
    try {
      return await this.apiCall('/api/admin/user-routes', { method: 'GET' }, token, 1, true, 60000);
    } catch {
      return [];
    }
  }

  // GET /api/admin/user-routes/{userId} - Vrati rute za specifičnog korisnika
  async getUserRoutesByUserId(userId: number, token: string) {
    try {
      return await this.apiCall(`/api/admin/user-routes/${userId}`, { method: 'GET' }, token, 1, true, 60000);
    } catch {
      return [];
    }
  }

  // POST /api/admin/user-routes - Dodaj novu rutu za korisnika
  async createUserRoute(userId: number, routeId: number, nivoDozvola: number, token: string) {
    try {
      // Validacija podataka
      if (!userId || !routeId || !nivoDozvola) {
        throw new Error('userId, routeId i nivoDozvola su obavezni');
      }
      
      if (nivoDozvola < 1 || nivoDozvola > 5) {
        throw new Error('nivoDozvola mora biti između 1 i 5');
      }

      const requestBody = {
        userId: Number(userId),
        routeId: Number(routeId),
        nivoDozvola: Number(nivoDozvola)
      };


      return await this.apiCall('/api/admin/user-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, token, 3, false, 0); // 3 retries, no cache
    } catch (error) {
      throw error; // Ne simuliraj uspeh, baci grešku
    }
  }

  // PUT /api/admin/user-routes/{userId}/{routeId} - Ažuriraj nivo dozvole
  async updateUserRoute(userId: number, routeId: number, nivoDozvola: number, token: string) {
    try {
      // Validacija podataka
      if (!userId || !routeId || !nivoDozvola) {
        throw new Error('userId, routeId i nivoDozvola su obavezni');
      }
      
      if (nivoDozvola < 1 || nivoDozvola > 5) {
        throw new Error('nivoDozvola mora biti između 1 i 5');
      }

      const requestBody = {
        nivoDozvola: Number(nivoDozvola)
      };


      return await this.apiCall(`/api/admin/user-routes/${userId}/${routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, token, 3, false, 0); // 3 retries, no cache
    } catch (error) {
      throw error; // Ne simuliraj uspeh, baci grešku
    }
  }

  // DELETE /api/admin/user-routes/{userId}/{routeId} - Ukloni rutu za korisnika
  async deleteUserRoute(userId: number, routeId: number, token: string) {
    try {
      // Validacija podataka
      if (!userId || !routeId) {
        throw new Error('userId i routeId su obavezni');
      }


      return await this.apiCall(`/api/admin/user-routes/${userId}/${routeId}`, { 
        method: 'DELETE' 
      }, token, 3, false, 0); // 3 retries, no cache
    } catch (error) {
      throw error; // Ne simuliraj uspeh, baci grešku
    }
  }

  // PUT /api/admin/users/{userId}/level - Ažuriraj nivo pristupa korisnika
  async updateUserLevel(userId: number, nivoPristupa: number, token: string) {
    try {
      // Validacija podataka
      if (!userId || !nivoPristupa) {
        throw new Error('userId i nivoPristupa su obavezni');
      }
      
      if (nivoPristupa < 1 || nivoPristupa > 5) {
        throw new Error('nivoPristupa mora biti između 1 i 5');
      }

      const requestBody = {
        nivoPristupa: Number(nivoPristupa)
      };


      return await this.apiCall(`/api/admin/users/${userId}/level`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }, token, 3, false, 0); // 3 retries, no cache
    } catch (error) {
      throw error;
    }
  }

  private clearAllCache(): void {
    // Očisti sve cache-ove
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }
}

export const apiService = new ApiService(); 