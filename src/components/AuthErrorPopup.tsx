'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Interface za tipove grešaka
interface AuthError {
  type: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'ACCOUNT_PENDING' | 'NETWORK_ERROR';
  message: string;
  title: string;
  icon: string;
  action?: string;
}

// Konstante za greške
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    title: "Neispravni podaci",
    message: "Korisničko ime ili lozinka nisu ispravni. Proverite podatke i pokušajte ponovo.",
    icon: "🔐",
    action: "Proverite podatke"
  },
  
  USER_NOT_FOUND: {
    title: "Korisnik ne postoji", 
    message: "Korisnik sa tim podacima ne postoji u sistemu. Proverite korisničko ime ili email.",
    icon: "👤",
    action: "Registrujte se"
  },
  
  ACCOUNT_PENDING: {
    title: "Nalog čeka odobrenje",
    message: "Vaš nalog čeka odobrenje od administratora. Kontaktirajte administratora za više informacija.",
    icon: "⏳", 
    action: "Kontaktirajte administratora"
  },
  
  NETWORK_ERROR: {
    title: "Greška konekcije",
    message: "Nema konekcije sa serverom. Proverite internet konekciju i pokušajte ponovo.",
    icon: "🌐",
    action: "Pokušajte ponovo"
  }
};

interface AuthErrorPopupProps {
  error: AuthError | null;
  onClose: () => void;
  onRetry?: () => void;
}

const AuthErrorPopup: React.FC<AuthErrorPopupProps> = ({ error, onClose, onRetry }) => {
  const router = useRouter();
  
  if (!error) return null;

  const errorConfig = AUTH_ERRORS[error.type];

  const handleActionClick = () => {
    if (error.type === 'USER_NOT_FOUND') {
      // Za USER_NOT_FOUND, idi na register stranicu
      router.push('/register');
      onClose();
    } else if (onRetry) {
      onRetry();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="error-backdrop" onClick={onClose}></div>
      
      {/* Popup */}
      <div className="error-popup">
        <div className="error-popup-header">
          <span className="error-icon">{errorConfig.icon}</span>
          <h3 className="error-title">{errorConfig.title}</h3>
        </div>
        
        <p className="error-message">{errorConfig.message}</p>
        
        <div className="error-actions">
          <button 
            className="error-btn error-btn-secondary"
            onClick={onClose}
          >
            Zatvori
          </button>
          
          {errorConfig.action && (
            <button 
              className="error-btn error-btn-primary"
              onClick={handleActionClick}
            >
              {errorConfig.action}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease-out;
        }

        .error-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          max-width: 400px;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .error-popup-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .error-icon {
          font-size: 2rem;
        }

        .error-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .error-message {
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .error-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-btn-primary {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .error-btn-primary:hover {
          background: rgba(255,255,255,0.3);
        }

        .error-btn-secondary {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
        }

        .error-btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .error-popup {
            margin: 1rem;
            max-width: calc(100% - 2rem);
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default AuthErrorPopup;
export type { AuthError };
export { AUTH_ERRORS };
