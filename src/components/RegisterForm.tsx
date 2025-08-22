'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useUsernameValidation } from '../hooks/useUsernameValidation';
import { ValidationIndicator } from './ValidationIndicator';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time validacija korisničkog imena
  const usernameValidation = useUsernameValidation(userData.username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Provera validacije korisničkog imena
    if (!usernameValidation.isValid) {
      setError('Molimo ispravite greške u formi pre slanja');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError('Лозинке се не поклапају');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      // Poboljšana obrada grešaka
      let errorMessage = 'Greška pri registraciji';
      
      if (error instanceof Error && error.message) {
        // Mapiranje grešaka sa backend-a
        switch (error.message) {
          case 'Korisničko ime već postoji':
            errorMessage = 'Korisničko ime već postoji';
            break;
          case 'Email adresa već postoji':
            errorMessage = 'Email adresa već postoji';
            break;
          case 'Pogrešno korisničko ime/email pri prijavi':
            errorMessage = 'Pogrešno korisničko ime ili email adresa';
            break;
          case 'Pogrešna lozinka':
            errorMessage = 'Pogrešna lozinka';
            break;
          case 'Nalog je deaktiviran':
            errorMessage = 'Vaš nalog je deaktiviran. Kontaktirajte administratora.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Име
          </label>
          <input
            type="text"
            id="firstName"
            value={userData.firstName}
            onChange={(e) => setUserData({...userData, firstName: e.target.value})}
            className="input w-full py-2"
            placeholder="Унесите име"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Презиме
          </label>
          <input
            type="text"
            id="lastName"
            value={userData.lastName}
            onChange={(e) => setUserData({...userData, lastName: e.target.value})}
            className="input w-full py-2"
            placeholder="Унесите презиме"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Корисничко име
        </label>
        <div className="relative">
          <input
            type="text"
            id="username"
            value={userData.username}
            onChange={(e) => setUserData({...userData, username: e.target.value})}
            className={`input w-full py-2 pr-10 ${
              userData.username && !usernameValidation.isChecking
                ? usernameValidation.isValid 
                  ? 'border-green-300 focus:border-green-500' 
                  : 'border-red-300 focus:border-red-500'
                : ''
            }`}
            placeholder="Изаберите корисничко име"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <ValidationIndicator
              isValid={usernameValidation.isValid}
              isChecking={usernameValidation.isChecking}
              message={usernameValidation.message}
            />
          </div>
        </div>
        {usernameValidation.message && (
          <p className={`text-xs mt-1 ${
            usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {usernameValidation.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={userData.email}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
          className="input w-full py-2"
          placeholder="Унесите вашу e-mail адресу"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Лозинка
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={userData.password}
            onChange={(e) => setUserData({...userData, password: e.target.value})}
            className="input w-full pr-10 py-2"
            placeholder="Креирајте сигурну лозинку"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Потврдите лозинку
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={userData.confirmPassword}
            onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
            className="input w-full pr-10 py-2"
            placeholder="Поновите вашу лозинку за потврду"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-2.5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Грешка при регистрацији
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !usernameValidation.isValid}
        className="btn btn-success w-full py-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Регистрација...
          </div>
        ) : (
          'Региструј се'
        )}
      </button>
    </form>
  );
};

export default RegisterForm; 