'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthErrorPopup, { AuthError } from './AuthErrorPopup';

interface GlobalErrorContextType {
  showAuthError: (error: AuthError) => void;
  hideAuthError: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export const useGlobalError = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ children }) => {
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const showAuthError = (error: AuthError) => {
    setAuthError(error);
  };

  const hideAuthError = () => {
    setAuthError(null);
  };

  return (
    <GlobalErrorContext.Provider value={{ showAuthError, hideAuthError }}>
      {children}
      
      {authError && (
        <AuthErrorPopup 
          error={authError}
          onClose={hideAuthError}
          onRetry={hideAuthError}
        />
      )}
    </GlobalErrorContext.Provider>
  );
};
