'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SidebarNav from '../SidebarNav';
import Navbar from '../Navbar';
import AdminNotifications from './korisnici/AdminNotifications';
import { ThemeProvider } from '../ThemeContext';
import ClientLayoutShell from '../ClientLayoutShell';
import { AdminPanelGuard } from '../../components/RoleBasedGuards';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Middleware sada radi rutiranje na osnovu role
  // useEffect(() => {
  //   if (!loading && user && !isAdmin) {
  //     router.replace('/dashboard');
  //   }
  // }, [user, isAdmin, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Optimizovano loading - prikaži sadržaj čim je user admin, bez čekanja
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <ThemeProvider>
      <ClientLayoutShell>
        <AdminPanelGuard>
          <div className="flex h-screen bg-gray-100">
            {/* Navbar - fiksiran na vrhu */}
            <div className="fixed top-0 left-0 right-0 z-40">
              <Navbar 
                user={user}
                onLogout={handleLogout}
              />
              {/* Admin notifications u navbar */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50">
                <AdminNotifications />
              </div>
            </div>

            {/* Sidebar - ispod navbar-a, samo sa admin opcijama */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-white shadow-lg z-30 fixed left-0 top-12 h-full`}>
              <SidebarNav 
                sidebarOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isAdmin={true}
                showOnlyUsers={true}
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
        </AdminPanelGuard>
      </ClientLayoutShell>
    </ThemeProvider>
  );
}
