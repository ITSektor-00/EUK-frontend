import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
}

export default function ErrorHandler({ error, onRetry }: ErrorHandlerProps) {
  const { logout } = useAuth();

  if (!error) return null;

  const isAuthError = error.includes('Nemate dozvolu') || error.includes('prijavite se ponovo');

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {isAuthError ? 'Greška autentifikacije' : 'Greška'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4 flex space-x-3">
            {isAuthError ? (
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
              >
                Prijavi se ponovo
              </button>
            ) : (
              onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Pokušaj ponovo
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
