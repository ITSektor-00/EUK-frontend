'use client';

import { useIsMobile } from '@/hooks/useIsMobile';

export default function Branding() {
  const isMobile = useIsMobile();

  return (
    <div className="text-center mb-2 mt-2">
      <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
        Добро дошли у ЕУК платформу
      </h1>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 mb-1 px-2`}>
        ЕУК - Платформа за евиденцију, обраду и извештавање
      </p>
      <div className="gradient-line"></div>
    </div>
  );
} 