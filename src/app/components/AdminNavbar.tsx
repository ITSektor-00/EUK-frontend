import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { useUser } from "../ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AdminNotifications from "../admin/korisnici/AdminNotifications";
import LicenseNotificationBell from "../../components/LicenseNotificationBell";

type User = {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon?: string;
  fotografija?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  fotografija?: string;
  role?: string;
}

// Funkcija za generisanje boje na osnovu imena
function getInitialsColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-green-500 to-green-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-pink-500 to-pink-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-red-500 to-red-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', text: 'text-white' },
    { bg: 'bg-gradient-to-br from-teal-500 to-teal-600', text: 'text-white' },
  ];
  
  if (!name || name.length === 0) {
    return colors[0];
  }
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Komponenta za inicijale
function UserInitials({ user }: { user: UserData | User }) {
  const imeInitial = user.firstName ? user.firstName.charAt(0) : '';
  const prezimeInitial = user.lastName ? user.lastName.charAt(0) : '';
  const initials = `${imeInitial}${prezimeInitial}`.toUpperCase();
  const colors = getInitialsColor((user.firstName || '') + (user.lastName || ''));
  
  return (
    <div className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-sm shadow-sm`}>
      {initials || 'A'}
    </div>
  );
}

// Komponenta za veće inicijale (dropdown)
function UserInitialsLarge({ user }: { user: UserData | User }) {
  const imeInitial = user.firstName ? user.firstName.charAt(0) : '';
  const prezimeInitial = user.lastName ? user.lastName.charAt(0) : '';
  const initials = `${imeInitial}${prezimeInitial}`.toUpperCase();
  const colors = getInitialsColor((user.firstName || '') + (user.lastName || ''));
  
  return (
    <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-lg shadow-sm`}>
      {initials || 'A'}
    </div>
  );
}

// Helper function to check if user has fotografija property
function hasFotografija(user: UserData | User | null | undefined): user is (UserData | User) & { fotografija: string } {
  return user !== null && user !== undefined && 'fotografija' in user && !!user.fotografija;
}

interface AdminNavbarProps {
  user?: UserData | User;
  onLogout?: () => void;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export default function AdminNavbar({ user: propUser, onLogout }: AdminNavbarProps) {
  const [profilOpen, setProfilOpen] = useState(false)
  const { user: contextUser, loading } = useUser();
  const { token } = useAuth();
  
  
  // Koristi prop user ako je prosleđen, inače koristi iz context-a
  const user = propUser || contextUser;

  // Zatvori dropdown kada se klikne van njega ili pritisne ESC
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (profilOpen && !target.closest('.profile-dropdown')) {
        setProfilOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (profilOpen && event.key === 'Escape') {
        setProfilOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profilOpen]);



  async function handleLogout() {
    if (onLogout) {
      await onLogout();
    } else {
      await fetch('/api/odjava', { method: 'POST', credentials: 'include' })
      window.location.replace('/login')
    }
  }
  
  if (loading) {
    return (
      <header className="sticky top-0 z-40 h-12 border-b border-[var(--border-color)] flex items-center px-2 sm:px-4 justify-between w-full shadow-sm transition-all duration-300" style={{ backgroundColor: '#2D5A3D' }}>
        <div className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 bg-gray-300 rounded animate-pulse"></div>
          <span className="hidden sm:inline font-semibold text-xl tracking-wide text-white">ЕУК Платформа - Admin</span>
        </div>
        
        {/* Centralni naslov - loading stanje */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
          <div className="text-white text-center">
            <div className="text-base font-semibold leading-tight">Администратор панел</div>
            <div className="text-sm font-medium leading-tight opacity-90">Управљање корисницима</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 h-12 border-b border-[var(--border-color)] flex items-center px-2 sm:px-4 justify-between w-full shadow-sm transition-all duration-300" style={{ backgroundColor: '#2D5A3D' }}>
      {/* Leva strana: logo i naziv */}
      <div className="flex items-center gap-2 select-none">
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
          <Image
            src="/picture/grbBeograd.svg"
            alt="Grb Beograda"
            width={36}
            height={36}
            className="w-9 h-9"
            style={{ display: 'inline-block' }}
            priority
          />
          <span className="hidden sm:inline font-semibold text-xl tracking-wide text-white" style={{fontFamily: 'InterVariable, sans-serif', letterSpacing: '0.04em'}}>ЕУК Платформа - Админ</span>
        </Link>
      </div>
      
      {/* Centralni naslov */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <div className="text-base font-semibold leading-tight">Администратор панел</div>
          <div className="text-sm font-medium leading-tight opacity-90">Управљање корисницима</div>
        </div>
      </div>
      
      {/* Desna strana: admin notifikacije i profil dugme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Licencno obaveštenje */}
        <div className="hidden md:block mr-1">
          <LicenseNotificationBell />
        </div>
        
        {/* Admin notifikacije */}
        <div className="hidden md:block mr-1">
          <AdminNotifications />
        </div>
        
        {/* Profil dugme uvek vidljivo */}
        <div className="relative ml-1 profile-dropdown">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-full focus:outline-none transition-colors duration-200 overflow-hidden hover:bg-white/20 cursor-pointer"
            onClick={() => user && setProfilOpen(v => !v)}
            aria-label="Profil"
          >
            {user && hasFotografija(user) ? (
              <Image
                src={user.fotografija}
                alt="Profil"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              user && <UserInitials user={user} />
            )}
          </button>
          {/* Dropdown samo ako postoji user */}
          {user && profilOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl p-4 z-50 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                {hasFotografija(user) ? (
                  <Image
                    src={user.fotografija}
                    alt="Profil"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover"
                    priority
                  />
                ) : (
                  <UserInitialsLarge user={user} />
                )}
                <div>
                  <div className="font-bold text-lg text-black">{user.firstName} {user.lastName}</div>
                  {('role' in user && user.role === 'superAdmin') && (
                    <div className="text-sm text-[#D4AF37] font-semibold">👑 Super Admin</div>
                  )}
                  {('role' in user && user.role === 'admin') && (
                    <div className="text-sm text-[#347C17] font-semibold">👑 Administrator</div>
                  )}
                </div>
              </div>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold cursor-pointer"
                onClick={handleLogout}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
                Odjava
              </button>
            </div>
          )}
        </div>
      </div>
      
    </header>
  )
}

