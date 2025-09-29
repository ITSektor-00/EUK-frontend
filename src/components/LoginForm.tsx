'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import UserApprovalPending from './UserApprovalPending';
import AuthErrorPopup, { AuthError } from './AuthErrorPopup';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApprovalPending, setShowApprovalPending] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials);
      
      // Proverava da li je rezultat neodobreni korisnik
      if (result && (result as any).success === false && (result as any).code === 'ACCOUNT_PENDING_APPROVAL') {
        setPendingUsername(credentials.usernameOrEmail);
        setShowApprovalPending(true);
        return; // Ne ide dalje, samo prikazuje pop-up
      }
      
      // Posle uspešnog logina, preusmeri na home page
      // Auth context će se ažurirati, a useEffect u page.tsx će preusmeriti korisnika
      // na osnovu role (admin -> /admin, obični korisnik -> /dashboard)
      router.push('/');
    } catch (error: unknown) {
      // Poboljšana obrada grešaka sa lepim popup-om
      let authErrorType: AuthError['type'] = 'INVALID_CREDENTIALS';
      let errorMessage = 'Greška pri prijavi';
      
      if (error instanceof Error && error.message) {
        // Mapiranje grešaka sa backend-a na AuthError tipove
        switch (error.message) {
          case 'Pogrešno korisničko ime/email pri prijavi':
            authErrorType = 'USER_NOT_FOUND';
            errorMessage = 'Pogrešno korisničko ime ili email adresa';
            break;
          case 'Pogrešna lozinka':
            authErrorType = 'INVALID_CREDENTIALS';
            errorMessage = 'Pogrešna lozinka';
            break;
          case 'Nalog je deaktiviran':
            authErrorType = 'ACCOUNT_PENDING';
            errorMessage = 'Vaš nalog je deaktiviran. Kontaktirajte administratora.';
            break;
          case 'Neispravno korisničko ime ili lozinka':
            authErrorType = 'INVALID_CREDENTIALS';
            errorMessage = 'Neispravno korisničko ime ili lozinka';
            break;
          case 'Korisničko ime već postoji':
            errorMessage = 'Korisničko ime već postoji';
            break;
          case 'Email adresa već postoji':
            errorMessage = 'Email adresa već postoji';
            break;
          default:
            // Proverava da li je network greška
            if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('konekcija')) {
              authErrorType = 'NETWORK_ERROR';
            }
            errorMessage = error.message;
        }
      }
      
      // Postavi AuthError za popup
      setAuthError({
        type: authErrorType,
        message: errorMessage,
        title: '', // Title će biti postavljen u AuthErrorPopup komponenti
        icon: '' // Icon će biti postavljen u AuthErrorPopup komponenti
      });
      
      // Zadržavamo i staru error logiku za slučaj da popup ne radi
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showApprovalPending && (
        <UserApprovalPending 
          username={pendingUsername}
          onClose={() => {
            setShowApprovalPending(false);
            setPendingUsername('');
          }}
        />
      )}
      
      {authError && (
        <AuthErrorPopup 
          error={authError}
          onClose={() => setAuthError(null)}
          onRetry={() => {
            setAuthError(null);
            setError('');
          }}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Корисничко име или Email
        </label>
        <input
          type="text"
          id="usernameOrEmail"
          value={credentials.usernameOrEmail}
          onChange={(e) => setCredentials({...credentials, usernameOrEmail: e.target.value})}
          className="input w-full"
          placeholder="Корисничко име или e-mail"
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
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="input w-full pr-10"
            placeholder="Унесите вашу лозинку"
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Грешка при пријављивању
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
        disabled={loading}
        className="btn btn-primary w-full py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Пријављивање...
          </div>
        ) : (
          'Пријави се'
        )}
      </button>
    </form>
    </>
  );
};

export default LoginForm; 