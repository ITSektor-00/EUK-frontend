// API_BASE_URL je uklonjen jer se ne koristi

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://euk.onrender.com';
  }

  // Helper za auth headers
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Helper za error handling
  private handleApiError(error: any, endpoint: string): string {
    console.error(`Error calling ${endpoint}:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Greška mreže. Proverite internet konekciju.';
    }
    
    if (error.response) {
      return `HTTP greška ${error.response.status}: ${error.response.statusText}`;
    }
    
    return error.message || 'Nepoznata greška';
  }

  // Auth endpoints
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  async signIn(credentials: SignInData): Promise<AuthResponse> {
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
      console.error('SignIn Exception:', error);
      throw new Error(this.handleApiError(error, '/api/auth/signin'));
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(token)
      });
      
      if (!response.ok) {
        throw new Error('Greška pri dohvatanju korisnika');
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

// Export instance
export const apiService = new ApiService();

// Legacy functions for backward compatibility
export const signUp = (userData: SignUpData): Promise<AuthResponse> => {
  return apiService.signUp(userData);
};

export const signIn = (credentials: SignInData): Promise<AuthResponse> => {
  return apiService.signIn(credentials);
};

export const getCurrentUser = (token: string): Promise<User> => {
  return apiService.getCurrentUser(token);
}; 