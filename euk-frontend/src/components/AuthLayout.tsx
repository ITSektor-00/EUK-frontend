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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex flex-col items-center justify-start py-8 px-4 overflow-y-auto">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} space-y-4 relative z-10`}>
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