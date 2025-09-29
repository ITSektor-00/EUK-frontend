'use client';

import { useState } from 'react';
import { AuthError } from '../components/AuthErrorPopup';

export const useAuthError = () => {
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const showError = (type: AuthError['type'], customMessage?: string) => {
    setAuthError({
      type,
      message: customMessage || '',
      title: '',
      icon: ''
    });
  };

  const hideError = () => {
    setAuthError(null);
  };

  const showInvalidCredentials = (message?: string) => {
    showError('INVALID_CREDENTIALS', message);
  };

  const showUserNotFound = (message?: string) => {
    showError('USER_NOT_FOUND', message);
  };

  const showAccountPending = (message?: string) => {
    showError('ACCOUNT_PENDING', message);
  };

  const showNetworkError = (message?: string) => {
    showError('NETWORK_ERROR', message);
  };

  return {
    authError,
    showError,
    hideError,
    showInvalidCredentials,
    showUserNotFound,
    showAccountPending,
    showNetworkError
  };
};
