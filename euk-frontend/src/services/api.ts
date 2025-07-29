class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com';
  }

  // Helper za error handling
  private handleApiError(error: Error | unknown, endpoint: string): string {
    console.error(`Error calling ${endpoint}:`, error);
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Greška mreže. Proverite internet konekciju.';
      }
      return error.message;
    }
    
    return 'Nepoznata greška';
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
        throw new Error(errorData.message || 'Greška pri registraciji');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.handleApiError(error, '/api/auth/signup'));
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      // Prvo probaj real auth endpoint
      const response = await fetch(`${this.baseURL}/api/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Real username check:', data);
        return data.available;
      }
      
      // Fallback na test endpoint
      const testResponse = await fetch(`${this.baseURL}/api/test/check-username-test?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('Test username check:', data);
        return data.available;
      }
      
      return false;
    } catch (error) {
      console.error('Username check error:', error);
      return false; // Ako ne radi, pretpostavimo da je zauzet
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
        throw new Error(errorData.message || 'Greška pri prijavi');
      }

      const data = await response.json();
      console.log('Sign in successful:', data);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(this.handleApiError(error, '/api/auth/signin'));
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
      console.error('Get current user error:', error);
      throw new Error(this.handleApiError(error, '/api/auth/me'));
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
      console.log('Hello test:', data);
      return data;
    } catch (error) {
      console.error('Hello test error:', error);
      throw new Error(this.handleApiError(error, '/api/test/hello'));
    }
  }

  async testStatus(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/test/status`);
      if (!response.ok) {
        throw new Error('Greška pri testiranju status endpoint-a');
      }
      const data = await response.text();
      console.log('Status test:', data);
      return data;
    } catch (error) {
      console.error('Status test error:', error);
      throw new Error(this.handleApiError(error, '/api/test/status'));
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
      console.log('Echo test:', data);
      return data;
    } catch (error) {
      console.error('Echo test error:', error);
      throw new Error(this.handleApiError(error, '/api/test/echo'));
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
      console.log('CORS test:', data);
      return data;
    } catch (error) {
      console.error('CORS test error:', error);
      throw new Error(this.handleApiError(error, '/api/test/cors-test'));
    }
  }
}

export const apiService = new ApiService(); 