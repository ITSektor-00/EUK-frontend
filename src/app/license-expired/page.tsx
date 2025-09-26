'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../contexts/LicenseContext';
import { useRouter } from 'next/navigation';

const LicenseExpiredPage: React.FC = () => {
  const { logout, user } = useAuth();
  const { licenseInfo, getFormattedEndDate } = useLicense();
  const router = useRouter();

  const handleContactAdmin = () => {
    // Otvori email klijent sa predloženim sadržajem
    const subject = encodeURIComponent('Zahtev za produženje licence');
    const body = encodeURIComponent(
      `Poštovani,\n\nMolim Vas da produžite moju licencu za EUK Platformu.\n\nKorisničko ime: ${user?.username || 'Nepoznato'}\nEmail: ${user?.email || 'Nepoznato'}\n\nHvala unapred.\n\nS poštovanjem,\n${user?.firstName || ''} ${user?.lastName || ''}`
    );
    
    window.location.href = `mailto:admin@euk.rs?subject=${subject}&body=${body}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      // Forsiraj odjavu čak i ako API poziv ne uspe
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center animate-fadeInUp">
          {/* Ikona */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>

          {/* Naslov */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Licenca je istekla
          </h1>

          {/* Poruka */}
          <div className="text-gray-600 mb-6 space-y-2">
            <p>
              Vaša licenca za EUK Platformu je istekla.
            </p>
            {licenseInfo?.endDate && (
              <p className="text-sm">
                Datum isteka: <span className="font-semibold">{getFormattedEndDate()}</span>
              </p>
            )}
            <p>
              Molimo kontaktirajte administratora za produženje licence.
            </p>
          </div>

          {/* Informacije o korisniku */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Vaši podaci:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Korisničko ime:</span> {user.username}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Ime:</span> {user.firstName} {user.lastName}</p>
              </div>
            </div>
          )}

          {/* Akcije */}
          <div className="space-y-3">
            <button
              onClick={handleContactAdmin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              📧 Kontaktiraj administratora
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              🚪 Odjavi se
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              EUK Platforma - Sistem za upravljanje socijalnom zaštitom
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LicenseExpiredPage;
