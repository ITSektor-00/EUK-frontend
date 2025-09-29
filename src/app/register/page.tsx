'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import Branding from '@/components/Branding';
import { useIsMobile } from '@/hooks/useIsMobile';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <AuthLayout>
      <Branding />
      
      <div className="card w-full max-w-lg mx-auto">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-center text-gray-900 mb-1`}>
          Регистрација
        </h2>
        <p className="text-center text-gray-700 mb-2">
          Креирајте ваш EUK налог
        </p>
        
        <RegisterForm />
        
        <div className="subtle-divider my-1.5"></div>
        
        <div className="text-center mt-1">
          <p className="text-gray-700 mb-1 text-sm">Већ имате налог?</p>
          <div className={`flex ${isMobile ? 'flex-col gap-1' : 'gap-2'}`}>
            <button 
              onClick={() => router.push('/login')}
              className="btn btn-secondary flex-1"
            >
              Пријави се
            </button>
            <button 
              onClick={() => router.push('/')}
              className="btn flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
} 