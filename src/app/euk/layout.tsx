'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { RouteGuard } from '../../components/PermissionGuard';
import SidebarNav from '../SidebarNav';
import Navbar from '../Navbar';
import { ThemeProvider } from '../ThemeContext';

export default function EUKLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <RouteGuard routeName="/euk" userId={user?.id}>
        <ThemeProvider>
          <div className="flex h-screen bg-gray-100">
              {/* Navbar - fiksiran na vrhu */}
              <div className="fixed top-0 left-0 right-0 z-40">
                <Navbar 
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
                  <div className="p-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </ThemeProvider>
        </RouteGuard>
      </ProtectedRoute>
    );
  }
