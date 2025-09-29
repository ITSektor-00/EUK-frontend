'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { ImageWithFallback } from './ImageWithFallback';

export default function Header() {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-center mb-3 mt-1">
      <div className="card flex items-center gap-3 p-2">
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center`}>
          <ImageWithFallback 
            src="/picture/grbBeograd.svg" 
            alt="Грб Београда" 
            width={isMobile ? 40 : 48} 
            height={isMobile ? 40 : 48}
            className="rounded-lg w-auto h-auto"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <div className="flex flex-col">
          <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>Град Београд</h1>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 whitespace-nowrap`}>Секретаријат за социјалну заштиту</p>
        </div>
      </div>
    </div>
  );
} 