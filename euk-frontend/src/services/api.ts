class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Auth endpoints
  async signUp(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
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

    return response.json();
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      
      return false;
    } catch (error) {
      console.error('Greška pri proveri korisničkog imena:', error);
      return false;
    }
  }

  async signIn(credentials: {
    usernameOrEmail: string; // Može biti username ILI email
    password: string;
  }) {
    const response = await fetch(`${this.baseURL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Greška pri prijavi');
    }

    return response.json();
  }

  async getCurrentUser(token: string) {
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

export const apiService = new ApiService(); 