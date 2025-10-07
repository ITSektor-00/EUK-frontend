/**
 * Utility funkcije za autentifikaciju
 */
export class AuthUtils {
  /**
   * Proveri da li je token validan
   */
  static isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      // Dekodiraj JWT token (ako je JWT)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false; // Nije JWT format
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Proveri da li je token istekao
      if (payload.exp && payload.exp < currentTime) {
        console.log('[Auth] Token has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Auth] Error validating token:', error);
      return false;
    }
  }

  /**
   * Dobij token iz localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Postavi token u localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem('token', token);
    console.log('[Auth] Token saved to localStorage');
  }

  /**
   * Obriši token iz localStorage
   */
  static removeToken(): void {
    localStorage.removeItem('token');
    console.log('[Auth] Token removed from localStorage');
  }

  /**
   * Proveri da li je korisnik ulogovan
   */
  static isLoggedIn(): boolean {
    return this.isTokenValid();
  }

  /**
   * Dobij informacije o token-u
   */
  static getTokenInfo(): { isValid: boolean; expiresAt?: Date; userId?: string } {
    const token = this.getToken();
    if (!token) {
      return { isValid: false };
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false };
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = !payload.exp || payload.exp > currentTime;

      return {
        isValid,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined,
        userId: payload.sub || payload.userId || payload.id
      };
    } catch (error) {
      console.error('[Auth] Error parsing token:', error);
      return { isValid: false };
    }
  }

  /**
   * Kreiraj Authorization header
   */
  static createAuthHeader(): { Authorization: string } | Record<string, never> {
    const token = this.getToken();
    if (token && this.isTokenValid()) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Loguj auth status
   */
  static logAuthStatus(): void {
    const tokenInfo = this.getTokenInfo();
    console.log('[Auth] Status:', {
      isLoggedIn: this.isLoggedIn(),
      hasToken: !!this.getToken(),
      tokenValid: tokenInfo.isValid,
      expiresAt: tokenInfo.expiresAt?.toISOString(),
      userId: tokenInfo.userId
    });
  }
}

export default AuthUtils;


