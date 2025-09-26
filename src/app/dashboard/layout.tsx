'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { UserOnlyGuard } from '../../components/RoleBasedGuards';
import LicenseGuard from '../../components/LicenseGuard';
import SidebarNav from '../SidebarNav';
import UserNavbar from '../components/UserNavbar';
import { ThemeProvider } from '../ThemeContext';
import ClientLayoutShell from '../ClientLayoutShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  

  // Middleware sada radi rutiranje na osnovu role
  // useEffect(() => {
  //   if (!loading && isAdmin) {
  //     router.replace('/admin');
  //   }
  // }, [isAdmin, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Ako je admin, ne prikazuj ovaj layout
  if (isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <UserOnlyGuard>
        <LicenseGuard>
          <ThemeProvider>
            <ClientLayoutShell>
              <div className="flex h-screen bg-gray-100">
              {/* Navbar - fiksiran na vrhu */}
              <div className="fixed top-0 left-0 right-0 z-40">
                <UserNavbar 
                  user={user || undefined}
                  onLogout={handleLogout}
                />
              </div>

              {/* Sidebar - ispod navbar-a */}
              <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-white shadow-lg z-30 fixed left-0 top-12 h-full`}>
                <SidebarNav 
                  sidebarOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  userId={user?.id || null}
                />
              </div>

              {/* Main Content - sa margin-left za sidebar */}
              <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
              {/* Main Content Area */}
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100" style={{ marginTop: '48px' }}>
                {children}
              </main>
              </div>
            </div>
            </ClientLayoutShell>
          </ThemeProvider>
        </LicenseGuard>
      </UserOnlyGuard>
    </ProtectedRoute>
  );
}
