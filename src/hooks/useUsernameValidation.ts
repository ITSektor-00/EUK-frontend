import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface UsernameValidationState {
  isValid: boolean;
  isChecking: boolean;
  message: string;
}

export const useUsernameValidation = (username: string) => {
  const [validation, setValidation] = useState<UsernameValidationState>({
    isValid: false,
    isChecking: false,
    message: ''
  });

  const validateUsername = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setValidation({
        isValid: false,
        isChecking: false,
        message: usernameToCheck.length > 0 ? 'Korisničko ime mora imati najmanje 3 karaktera' : ''
      });
      return;
    }

    // Provera formata korisničkog imena
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(usernameToCheck)) {
      setValidation({
        isValid: false,
        isChecking: false,
        message: 'Korisničko ime može sadržati samo slova, brojeve i donju crtu'
      });
      return;
    }

    setValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const isAvailable = await apiService.checkUsernameAvailability(usernameToCheck);
      
      setValidation({
        isValid: isAvailable,
        isChecking: false,
        message: isAvailable 
          ? 'Korisničko ime je dostupno' 
          : 'Korisničko ime već postoji'
      });
    } catch {
      setValidation({
        isValid: false,
        isChecking: false,
        message: 'Greška pri proveri dostupnosti'
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        validateUsername(username);
      } else {
        setValidation({
          isValid: false,
          isChecking: false,
          message: ''
        });
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [username, validateUsername]);

  return validation;
}; 