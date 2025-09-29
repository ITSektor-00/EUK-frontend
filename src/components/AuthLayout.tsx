'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Header from './Header';
import Footer from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex flex-col items-center justify-start py-4 px-4 overflow-y-auto">
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} space-y-2 relative z-10`}>
        {/* Header */}
        <Header />
        
        {/* Content */}
        {children}
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
} 