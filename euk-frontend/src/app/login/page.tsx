'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import Branding from '@/components/Branding';
import { useIsMobile } from '@/hooks/useIsMobile';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <AuthLayout>
      <Branding />
      
      <div className="card w-full max-w-md mx-auto">
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-center text-gray-900 mb-1`}>
          Пријављивање
        </h2>
        <p className="text-center text-gray-700 mb-3 text-sm">
          Унесите ваше приступне податке
        </p>
        
        <LoginForm />
        
        <div className="subtle-divider my-3"></div>
        
        <div className="text-center">
          <p className="text-gray-700 mb-2 text-sm">Немате налог?</p>
          <div className={`flex ${isMobile ? 'flex-col gap-1' : 'gap-2'}`}>
            <button 
              onClick={() => router.push('/register')}
              className="btn btn-secondary flex-1 py-2 text-sm"
            >
              Региструј се
            </button>
            <button 
              onClick={() => router.push('/')}
              className="btn flex-1 py-2 text-sm bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
} 