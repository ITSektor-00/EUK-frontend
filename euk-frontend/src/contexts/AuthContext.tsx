'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiService } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiService.getCurrentUser(token!);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Proveri localStorage tek nakon mount-a
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      const response = await apiService.signIn(credentials);
      setToken(response.token);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        role: response.role,
        isActive: response.isActive !== undefined ? response.isActive : true
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
    } catch (error) {
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
      setToken(response.token);
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        role: response.role,
        isActive: response.isActive !== undefined ? response.isActive : true
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
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
      isAuthenticated: !!token
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