'use client';

import React from 'react';
import Image from 'next/image';

interface DynamicIconProps {
  iconName: string;
  alt: string;
  className?: string;
}

export default function DynamicIcon({ iconName, alt, className = "w-5 h-5" }: DynamicIconProps) {
  // Mapiranje ikona na PNG fajlove iz public/ikoniceSidebar
  const getIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'komandnaTabla': '/ikoniceSidebar/komandnaTabla.png',
      'kategorije': '/ikoniceSidebar/category.png',
      'predmeti': '/ikoniceSidebar/predmeti.png',
      'ugrozena-lica': '/ikoniceSidebar/ugrozenaLica.png',
    };

    const iconPath = iconMap[name];
    
    if (iconPath) {
      return (
        <Image
          src={iconPath}
          alt={alt}
          width={20}
          height={20}
          className={className}
        />
      );
    }

    // Fallback za nepoznate ikone
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
      </svg>
    );
  };

  return getIcon(iconName);
}
