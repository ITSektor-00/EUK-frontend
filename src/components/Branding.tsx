'use client';

import { useIsMobile } from '@/hooks/useIsMobile';

export default function Branding() {
  const isMobile = useIsMobile();

  return (
    <div className="text-center mb-3 mt-4">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>
        Добро дошли у ЕУК платформу
      </h1>
      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 mb-1 px-4`}>
        ЕУК - Платформа за евиденцију, обраду и извештавање
      </p>
      <div className="gradient-line"></div>
    </div>
  );
} 