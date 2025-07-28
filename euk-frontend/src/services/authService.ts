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
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Helper za auth headers
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Auth endpoints
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Greška pri registraciji');
    }
    
    return response.json();
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
        const errorText = await response.text();
        console.error('SignIn Error:', response.status, errorText);
        throw new Error(`Greška pri prijavi: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('SignIn Exception:', error);
      throw error;
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    
    if (!response.ok) {
      throw new Error('Greška pri dohvatanju korisnika');
    }
    
    return response.json();
  }

  // Test endpoints
  async testHello(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/test/hello`);
    if (!response.ok) {
      throw new Error('Greška pri testiranju hello endpoint-a');
    }
    return response.text();
  }

  async testStatus(): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/test/status`);
    if (!response.ok) {
      throw new Error('Greška pri testiranju status endpoint-a');
    }
    return response.text();
  }

  async testEcho(message: unknown): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/test/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error('Greška pri testiranju echo endpoint-a');
    }
    
    return response.text();
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