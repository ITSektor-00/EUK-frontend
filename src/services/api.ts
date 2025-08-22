class ApiService {
  private baseURL: string;

  constructor() {
    // Koristi direktne URL-ove za backend
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8080'  // Direktan poziv backend-a u development-u
      : (process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com'); // Direktan poziv u production-u
  }

  // Helper za error handling
  private handleApiError(error: Error | unknown): string {
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Greška mreže. Proverite internet konekciju.';
      }
      return error.message;
    }
    
    return 'Nepoznata greška';
  }

  // Helper za API pozive sa token-om
  async apiCall(endpoint: string, options: RequestInit = {}, token?: string) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

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
        
        throw new Error((errorData.message as string) || (errorData.error as string) || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // EUK API endpoints
  async getKategorije(token: string) {
    return this.apiCall('/api/euk/kategorije', { method: 'GET' }, token);
  }

  async createKategorija(data: { naziv: string }, token: string) {
    return this.apiCall('/api/euk/kategorije', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
  }

  async updateKategorija(id: number, data: { naziv: string }, token: string) {
    return this.apiCall(`/api/euk/kategorije/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
  }

  async deleteKategorija(id: number, token: string) {
    return this.apiCall(`/api/euk/kategorije/${id}`, { method: 'DELETE' }, token);
  }

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
    return this.apiCall(`/api/euk/ugrozena-lica?${params}`, { method: 'GET' }, token);
  }

  async createUgrozenoLice(data: Record<string, unknown>, token: string) {
    const result = await this.apiCall('/api/euk/ugrozena-lica', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async updateUgrozenoLice(id: number, data: Record<string, unknown>, token: string) {
    const result = await this.apiCall(`/api/euk/ugrozena-lica/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, token);
    return result;
  }

  async deleteUgrozenoLice(id: number, token: string) {
    return this.apiCall(`/api/euk/ugrozena-lica/${id}`, { method: 'DELETE' }, token);
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
      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Greška pri registraciji' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { error: this.handleApiError(error) };
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
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  async signIn(credentials: {
    usernameOrEmail: string;
    password: string;
  }) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Greška pri prijavi' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { error: this.handleApiError(error) };
    }
  }

  async getCurrentUser(token: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Greška pri učitavanju korisnika');
      }

      return response.json();
    } catch (error) {
      throw new Error(this.handleApiError(error));
    }
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
}

export const apiService = new ApiService(); 