'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import Branding from '@/components/Branding';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <AuthLayout>
      <Branding />
      
      <div className="card w-full">
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-center text-gray-900 mb-1`}>
          Добродошли у EUK платформу
        </h2>
        <p className="text-center text-gray-700 mb-3">
          Изаберите опцију за приступ систему
        </p>
        
        <div className="space-y-2">
          <button 
            onClick={() => router.push('/login')}
            className="btn btn-primary w-full"
          >
            Пријави се
          </button>
          
          <button 
            onClick={() => router.push('/register')}
            className="btn btn-secondary w-full"
          >
            Региструј се
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
