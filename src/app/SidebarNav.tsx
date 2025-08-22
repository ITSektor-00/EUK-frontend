"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import DynamicIcon from './components/DynamicIcon';

interface NavLink {
  href: string
  label: string
  icon?: React.ReactElement
}

// Definišemo samo ЕУК СИСТЕМ секцију
const allSections = [
  {
    title: 'ЕУК СИСТЕМ',
    links: [
      { href: '/euk/kategorije', label: 'Категорије', icon: <DynamicIcon iconName="kategorije" alt="Категорије" /> },
      { href: '/euk/predmeti', label: 'Предмети', icon: <DynamicIcon iconName="predmeti" alt="Предмети" /> },
      { href: '/euk/ugrozena-lica', label: 'Угрожена лица', icon: <DynamicIcon iconName="ugrozena-lica" alt="Угрожена лица" /> },
    ] as NavLink[],
  },
];

interface SidebarNavProps {
  sidebarOpen?: boolean;
  onToggle?: () => void;
}

export default function SidebarNav({ sidebarOpen = true, onToggle }: SidebarNavProps) {
  const pathname = usePathname()

  // Pojednostavljen sidebar - prikaži sve sekcije
  const sections = allSections;

  // Pojednostavljen UI dizajn
  return (
    <nav className="flex flex-col items-center py-1 gap-0.5 h-full w-full" style={{ position: 'relative', height: '100%' }}>
      
      {/* Burger meni na vrhu sidebara */}
      <div className="w-full flex justify-center mb-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col w-full flex-1">
        <div className="relative">
          <SidebarItem
            href="/dashboard"
            icon={<DynamicIcon iconName="komandnaTabla" alt="Командна табла" />}
            label="Командна табла"
            active={pathname === '/dashboard'}
            sidebarOpen={sidebarOpen}
          />
        </div>
        {sections.map((section, idx) => (
          <div key={section.title} className="flex flex-col w-full mt-1.5">
            {!sidebarOpen && idx !== 0 && (
              <div className="w-7 h-0.5 bg-[var(--border-color)] mx-auto my-1 rounded-full opacity-70" />
            )}
            {sidebarOpen && (
              <div className="text-[16px] text-[var(--text-secondary)] font-bold px-4 mb-2 mt-4 tracking-widest uppercase">
                {section.title}
              </div>
            )}
            <div className="flex flex-col gap-0.5 w-full">
              {section.links.map((link: NavLink) => (
                <div key={link.href} className="relative">
                  <SidebarItem
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={pathname === link.href}
                    sidebarOpen={sidebarOpen}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

// Pojednostavljena SidebarItem komponenta
function SidebarItem({ href, icon, label, active, sidebarOpen }: { 
  href: string, 
  icon?: React.ReactElement, 
  label: string, 
  active: boolean, 
  sidebarOpen: boolean
}) {
  if (!sidebarOpen) {
    return (
      <div className="relative flex items-center justify-center w-full group">
        <Link
          href={href}
          scroll={false}
          className={`flex items-center justify-center w-full h-12 my-0.5 rounded-lg transition-colors duration-100
            ${active ? 'bg-gray-200 text-black font-bold border border-gray-400' : 'text-[var(--text-primary)]'}
            hover:bg-[var(--border-color)] focus:outline-none
          `}
          tabIndex={0}
        >
          <span className={`w-6 h-6 flex items-center justify-center ${active ? 'font-bold' : ''}`}>{icon}</span>
        </Link>
        
        {/* Custom tooltip za zatvoreni sidebar */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          {/* Tooltip arrow */}
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
        </div>
      </div>
    )
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={`flex items-center w-full px-4 py-2 transition-all duration-200 group relative overflow-hidden
        ${active ? 'sidebar-active-link' : 'text-[var(--text-primary)] font-normal'}
        ${!active && 'hover:bg-[var(--sidebar-bg)]'}
        ${sidebarOpen ? 'pl-4 pr-2' : 'justify-center'}
        ${active && !sidebarOpen ? 'justify-center' : ''}
        focus:outline-none
      `}
      title={label}
      style={{fontSize: 16, minHeight: 40, maxWidth: sidebarOpen ? 220 : 48, overflow: 'hidden'}}
    >
      <span className={`w-5 h-5 flex items-center justify-center z-10 ${active ? 'font-bold' : ''}`}>{icon}</span>
      {sidebarOpen && (
        <span className={`truncate z-10 ${active ? 'font-bold' : 'font-normal'} hover:underline`} style={{maxWidth: 120, marginLeft: 8}}>{label}</span>
      )}
    </Link>
  )
} 