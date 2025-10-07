'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  nivoPristupa: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<any>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<any>;
  logout: () => void;
  updateToken: (newToken: string) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  needsApproval: boolean;
  nivoPristupa: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      // Dodaj rate limiting - sprečimo previše poziva
      const lastCall = localStorage.getItem('lastUserCall');
      const now = Date.now();
      if (lastCall && (now - parseInt(lastCall)) < 5000) { // 5 sekundi između poziva
        return;
      }
      localStorage.setItem('lastUserCall', now.toString());

      // Uvek čitaj fresh user podatke - ne koristi cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('user_')) {
          localStorage.removeItem(key);
        }
      });
      
      const userData = await apiService.getCurrentUser(token);
      setUser(userData);
    } catch (error) {
      // Proveri da li je greška vezana za autentifikaciju
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('401') || errorMessage.includes('sesija') || errorMessage.includes('token')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Proveri localStorage i cookies tek nakon mount-a i pratiti promene
  useEffect(() => {
    const checkToken = () => {
      // Očisti sve user cache-ove na početku
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('user_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Prvo proveri localStorage
      const storedToken = localStorage.getItem('token');
      
      // Ako nema token-a u localStorage, proveri cookies
      if (!storedToken && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        if (tokenCookie) {
          const cookieToken = tokenCookie.split('=')[1];
          if (cookieToken && cookieToken !== token) {
            setToken(cookieToken);
            // Sinhronizuj sa localStorage
            localStorage.setItem('token', cookieToken);
            return;
          }
        }
      }
      
      if (storedToken !== token) {
        setToken(storedToken);
        // Sinhronizuj sa cookies
        if (storedToken && typeof document !== 'undefined') {
          document.cookie = `token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
      }
    };

    // Proveri na mount
    checkToken();

    // Dodaj event listener za promene u localStorage
    window.addEventListener('storage', checkToken);
    
    return () => {
      window.removeEventListener('storage', checkToken);
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]); // Uklonjen loadUser iz dependency array-a da sprečimo beskonačnu petlju

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      const response = await apiService.signIn(credentials);
      
      // Proverava da li je korisnik neodobren - samo vraćamo response bez bacanja greške
      if (response && response.success === false && response.code === 'ACCOUNT_PENDING_APPROVAL') {
        return response; // Vraćamo response direktno bez bacanja greške
      }
      
      // Proveri da li je response validan i ima potrebna polja
      if (!response || !response.token) {
        throw new Error('Neispravan odgovor od servera. Token nije pronađen.');
      }
      
      setToken(response.token);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        role: response.role,
        isActive: response.isActive !== undefined ? response.isActive : true,
        isApproved: response.isApproved !== undefined ? response.isApproved : false,
        nivoPristupa: response.nivoPristupa || 1
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        // ChatGPT rešenje - postavi token u cookies
        document.cookie = `token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      }
      
      // Client-side redirekcija na osnovu role
      setTimeout(() => {
        if (response.role === 'admin' || response.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (response.role === 'korisnik' || response.role === 'USER' || response.role === 'KORISNIK') {
          router.push('/dashboard');
        }
      }, 100);
      setLoading(false); // VAŽNO: Postavi loading na false nakon uspešnog login-a
      
      // Ne preusmeravaj ovde - neka middleware hendluje redirekciju
      // Middleware će preusmeriti korisnika na osnovu role kada pristupi home page-u
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await apiService.signUp(userData);
      
      // Proveri da li je response validan i ima potrebna polja
      if (!response || !response.token) {
        throw new Error('Neispravan odgovor od servera. Token nije pronađen.');
      }
      
      setToken(response.token);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        role: response.role,
        isActive: response.isActive !== undefined ? response.isActive : true,
        isApproved: response.isApproved !== undefined ? response.isApproved : false,
        nivoPristupa: response.nivoPristupa || 1
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        // Dodaj token u cookies da middleware može da ga čita
        const isSecure = window.location.protocol === 'https:';
        document.cookie = `token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; ${isSecure ? 'secure;' : ''} samesite=strict`;
      }
      
      // Direktno preusmeravanje nakon registracije
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          if (response.role === 'admin' || response.role === 'ADMIN') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }
      }, 100);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Pozovi backend API za odjavu
      if (token) {
        await fetch('/api/odjava', { 
          method: 'POST', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      // Nastavi sa odjavom čak i ako API poziv ne uspe
    } finally {
      // Uvek obriši lokalne podatke
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = "token=; Max-Age=0; path=/";
        
        // Obriši user cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('user_')) {
            localStorage.removeItem(key);
          }
        });
        
        // Očisti sve cache-ove
        localStorage.clear();
        sessionStorage.clear();
        
        // Očisti service worker cache (ako postoji)
        if ('caches' in window) {
          caches.keys().then(function(names) {
            for (const name of names) caches.delete(name);
          });
        }
      }
    }
  };

  const updateToken = (newToken: string) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      // ChatGPT rešenje - postavi token u cookies
      document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateToken,
      isAuthenticated: !!token,
      isAdmin: (() => {
        if (!user || typeof user !== 'object') {
          return false;
        }
        
        const userRole = user.role;
        return userRole === 'admin' || userRole === 'ADMIN';
      })(),
      isApproved: user?.isApproved || false,
      needsApproval: user ? !user.isApproved : false,
      nivoPristupa: user?.nivoPristupa || 1
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 