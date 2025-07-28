'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ImageWithFallback } from './ImageWithFallback';

export default function Header() {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-center mb-5 mt-1">
      <div className="card flex items-center gap-4 p-3">
        <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} flex items-center justify-center`}>
          <ImageWithFallback 
            src="/picture/grbBeograd.svg" 
            alt="Грб Београда" 
            width={isMobile ? 48 : 64} 
            height={isMobile ? 48 : 64}
            className="rounded-lg w-auto h-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <div className="flex flex-col">
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>Град Београд</h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 whitespace-nowrap`}>Секретаријат за социјалну заштиту</p>
        </div>
      </div>
    </div>
  );
} 