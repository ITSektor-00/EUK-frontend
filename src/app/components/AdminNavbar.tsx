import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { useUser } from "../ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AdminNotifications from "../admin/korisnici/AdminNotifications";

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
  const [modalOpen, setModalOpen] = useState(false)
  const { user: contextUser, loading } = useUser();
  const { token } = useAuth();
  
  console.log('AdminNavbar token:', token); // Debug log
  
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

  React.useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Zatvori modal kada se klikne van njega ili pritisne ESC
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (modalOpen && target.classList.contains('modal-overlay')) {
        setModalOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (modalOpen && event.key === 'Escape') {
        setModalOpen(false);
      }
    }

    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

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
      <header className="sticky top-0 z-40 h-12 border-b border-[var(--border-color)] flex items-center px-2 sm:px-4 justify-between w-full shadow-sm transition-all duration-300" style={{ backgroundColor: '#88EBA7' }}>
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
    <header className="sticky top-0 z-40 h-12 border-b border-[var(--border-color)] flex items-center px-2 sm:px-4 justify-between w-full shadow-sm transition-all duration-300" style={{ backgroundColor: '#88EBA7' }}>
      {/* Leva strana: logo i naziv */}
      <div className="flex items-center gap-2 select-none">
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
          <Image
            src="/picture/grbBeograd.svg"
            alt="Grb Beograda"
            width={36}
            height={36}
            className="w-9 h-9"
            style={{ display: 'inline-block' }}
            priority
          />
          <span className="hidden sm:inline font-semibold text-xl tracking-wide text-white" style={{fontFamily: 'InterVariable, sans-serif', letterSpacing: '0.04em'}}>ЕУК Платформа - Admin</span>
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
        {/* Admin notifikacije */}
        <div className="hidden md:block mr-1">
          <AdminNotifications />
        </div>
        
        {/* Profil dugme uvek vidljivo */}
        <div className="relative ml-1 profile-dropdown">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-full focus:outline-none transition-colors duration-200 overflow-hidden hover:bg-white/20"
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
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-900 text-black font-semibold mb-2 transition-colors"
                onClick={() => { setModalOpen(true); setProfilOpen(false); }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9-9a2.828 2.828 0 10-4-4l-9 9z" />
                </svg>
                Uredi profil
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold"
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
      
      {/* Modal za izmenu profila */}
      {modalOpen && (
        <ProfileModal user={user} onClose={() => setModalOpen(false)} />
      )}
    </header>
  )
}

// Modal za izmenu profila - isti kao u originalnom Navbar.tsx
function ProfileModal({ user, onClose }: { user: UserData | User | null | undefined, onClose: () => void }) {
  const [ime, setIme] = useState(() => {
    if (!user) return "";
    return user.firstName || (user as User).ime || "";
  })
  const [prezime, setPrezime] = useState(() => {
    if (!user) return "";
    return user.lastName || (user as User).prezime || "";
  })
  const [email, setEmail] = useState(user?.email || "")
  const [username, setUsername] = useState(user?.username || "")
  const [lozinka, setLozinka] = useState("")
  const [potvrdaLozinke, setPotvrdaLozinke] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Zatvori modal kada se klikne van njega ili pritisne ESC
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (target.classList.contains('modal-overlay')) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    // Uzmi token iz localStorage-a direktno
    const token = localStorage.getItem('token');
    console.log('handleSubmit - token:', token); // Debug log
    
    // Proveri da li je token istekao
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // konvertuj u milisekunde
        
        if (Date.now() >= expiry) {
          console.log('Token je istekao!');
          localStorage.removeItem('token');
          setError('Token je istekao. Molimo prijavite se ponovo.');
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Greška pri proveri token-a:', error);
        setError('Greška pri proveri token-a.');
        setLoading(false)
        return
      }
    }
    
    // Validacija lozinke
    if (lozinka && lozinka.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera")
      setLoading(false)
      return
    }
    
    if (lozinka && lozinka !== potvrdaLozinke) {
      setError("Lozinke se ne poklapaju")
      setLoading(false)
      return
    }
    
    try {
      if (!token) {
        setError("Nema token-a. Molimo prijavite se ponovo.")
        setLoading(false)
        return
      }

      const response = await fetch('/api/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          first_name: ime,
          last_name: prezime,
          email,
          password: lozinka || undefined,
          current_username: user?.username
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profil uspešno ažuriran!")
        setLozinka("")
        setPotvrdaLozinke("")
        
        // Ažuriraj lokalno stanje
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || "Greška pri ažuriranju profila")
      }
    } catch (error) {
      console.error('Greška pri ažuriranju profila:', error);
      setError("Greška pri ažuriranju profila")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Uredi profil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ime
            </label>
            <input
              type="text"
              value={ime}
              onChange={(e) => setIme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prezime
            </label>
            <input
              type="text"
              value={prezime}
              onChange={(e) => setPrezime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Korisničko ime
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova lozinka (opciono)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={lozinka}
                onChange={(e) => setLozinka(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ostavite prazno ako ne želite da promenite"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {lozinka && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potvrda nove lozinke
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={potvrdaLozinke}
                  onChange={(e) => setPotvrdaLozinke(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={!!lozinka}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Čuvam..." : "Sačuvaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
