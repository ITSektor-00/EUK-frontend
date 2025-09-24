"use client";
import React, { useState, useMemo } from 'react';
import { Chip } from '@mui/material';

import { UgrozenoLiceT1 } from './types';

interface UgrozenaLicaStatistikaProps {
  ugrozenaLica: UgrozenoLiceT1[];
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'deadline' | 'creation' | 'activity';
  osnov: string;
  ugrozenoLiceId: number;
}

export default function UgrozenaLicaStatistika({ ugrozenaLica }: UgrozenaLicaStatistikaProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate statistics
  const ukupno = ugrozenaLica.length;
  
  const poOsnovu = ugrozenaLica.reduce((acc, u) => {
    const osnov = u.osnovSticanjaStatusa || 'Непознато';
    acc[osnov] = (acc[osnov] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poGradovima = ugrozenaLica.reduce((acc, u) => {
    const grad = u.gradOpstina || 'Непознато';
    acc[grad] = (acc[grad] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poMestima = ugrozenaLica.reduce((acc, u) => {
    const mesto = u.mesto || 'Непознато';
    acc[mesto] = (acc[mesto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average values
  const avgBrojClanova = useMemo(() => {
    const validValues = ugrozenaLica.filter(u => u.brojClanovaDomacinstva && u.brojClanovaDomacinstva > 0);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, u) => acc + (u.brojClanovaDomacinstva || 0), 0);
    return Math.round(sum / validValues.length * 100) / 100;
  }, [ugrozenaLica]);

  // Parse potrosnjaIPovrsinaCombined field
  const parsePotrosnjaIPovrsina = (combined: string) => {
    if (!combined) return { potrosnja: 0, povrsina: 0 };
    
    // Format: "Потрошња у kWh/2500.50/загревана површина у m2/75.5"
    const parts = combined.split('/');
    if (parts.length >= 4) {
      const potrosnja = parseFloat(parts[1]) || 0;
      const povrsina = parseFloat(parts[3]) || 0;
      return { potrosnja, povrsina };
    }
    return { potrosnja: 0, povrsina: 0 };
  };

  const avgPotrosnja = useMemo(() => {
    const validValues = ugrozenaLica.filter(u => u.potrosnjaIPovrsinaCombined);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, u) => {
      const { potrosnja } = parsePotrosnjaIPovrsina(u.potrosnjaIPovrsinaCombined || '');
      return acc + potrosnja;
    }, 0);
    return Math.round(sum / validValues.length * 100) / 100;
  }, [ugrozenaLica]);

  const avgPovrsina = useMemo(() => {
    const validValues = ugrozenaLica.filter(u => u.potrosnjaIPovrsinaCombined);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, u) => {
      const { povrsina } = parsePotrosnjaIPovrsina(u.potrosnjaIPovrsinaCombined || '');
      return acc + povrsina;
    }, 0);
    return Math.round(sum / validValues.length * 100) / 100;
  }, [ugrozenaLica]);

  const avgUmanjenje = useMemo(() => {
    const validValues = ugrozenaLica.filter(u => u.iznosUmanjenjaSaPdv && u.iznosUmanjenjaSaPdv > 0);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, u) => acc + (u.iznosUmanjenjaSaPdv || 0), 0);
    return Math.round(sum / validValues.length * 100) / 100;
  }, [ugrozenaLica]);

  // Total statistics
  const totalUmanjenje = useMemo(() => {
    return ugrozenaLica.reduce((acc, u) => acc + (u.iznosUmanjenjaSaPdv || 0), 0);
  }, [ugrozenaLica]);

  const totalPotrosnja = useMemo(() => {
    return ugrozenaLica.reduce((acc, u) => {
      const { potrosnja } = parsePotrosnjaIPovrsina(u.potrosnjaIPovrsinaCombined || '');
      return acc + potrosnja;
    }, 0);
  }, [ugrozenaLica]);

  const totalPovrsina = useMemo(() => {
    return ugrozenaLica.reduce((acc, u) => {
      const { povrsina } = parsePotrosnjaIPovrsina(u.potrosnjaIPovrsinaCombined || '');
      return acc + povrsina;
    }, 0);
  }, [ugrozenaLica]);

  // Statistics by year
  const poGodinama = useMemo(() => {
    return ugrozenaLica.reduce((acc, u) => {
      if (u.datumIzdavanjaRacuna) {
        const year = new Date(u.datumIzdavanjaRacuna).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
      }
    return acc;
  }, {} as Record<number, number>);
  }, [ugrozenaLica]);

  // Calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    ugrozenaLica.forEach(u => {
      if (u.datumIzdavanjaRacuna) {
        events.push({
          id: u.ugrozenoLiceId || Math.random(),
          title: `${u.ime} ${u.prezime}`,
          date: new Date(u.datumIzdavanjaRacuna),
          type: 'deadline',
          osnov: u.osnovSticanjaStatusa || 'Непознато',
          ugrozenoLiceId: u.ugrozenoLiceId || 0
        });
      }
    });
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [ugrozenaLica]);

  // Get events for selected month
  const monthEvents = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    return calendarEvents.filter(event => {
      const eventDate = event.date;
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }, [calendarEvents, selectedMonth]);

  // Get events for selected date
  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    return calendarEvents.filter(event => {
      const eventDate = event.date;
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [calendarEvents, selectedDate]);

  const getOsnovColor = (osnov: string) => {
    switch (osnov) {
      case 'MP': return 'success';
      case 'NSP': return 'info';
      case 'DD': return 'warning';
      case 'UDTNP': return 'error';
      default: return 'default';
    }
  };

  const getOsnovLabel = (osnov: string) => {
    switch (osnov) {
      case 'MP': return 'MP';
      case 'NSP': return 'NSP';
      case 'DD': return 'DD';
      case 'UDTNP': return 'UDTNP';
      default: return osnov;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Укупно угрожених лица</p>
              <p className="text-3xl font-bold text-gray-900">{ukupno}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просечан број чланова</p>
              <p className="text-3xl font-bold text-gray-900">{avgBrojClanova}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Укупна потрошња</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(totalPotrosnja)} kWh</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Укупно умањење</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalUmanjenje)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Po osnovu sticanja statusa */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">По основу стицања статуса</h3>
          <div className="space-y-3">
            {Object.entries(poOsnovu).map(([osnov, count]) => (
              <div key={osnov} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chip 
                    label={getOsnovLabel(osnov)} 
                    color={getOsnovColor(osnov) as any}
                    size="small"
                  />
                  <span className="text-sm text-gray-600">{osnov}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Po gradovima */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">По градовима/општинама</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(poGradovima)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([grad, count]) => (
                <div key={grad} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{grad}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Po mestima */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">По местима</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(poMestima)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([mesto, count]) => (
                <div key={mesto} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{mesto}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Po godinama */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">По годинама</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(poGodinama)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([godina, count]) => (
                <div key={godina} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{godina}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average values */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Просечне вредности</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Просечна загревана површина</span>
              <span className="text-sm font-semibold text-gray-900">{avgPovrsina} м²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Просечна потрошња</span>
              <span className="text-sm font-semibold text-gray-900">{avgPotrosnja} kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Просечан број чланова</span>
              <span className="text-sm font-semibold text-gray-900">{avgBrojClanova}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Просечно умањење</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(avgUmanjenje)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Statistics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Укупне статистике</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Укупна потрошња</p>
                <p className="text-2xl font-bold text-blue-900">{Math.round(totalPotrosnja)} kWh</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Укупна површина</p>
                <p className="text-2xl font-bold text-green-900">{Math.round(totalPovrsina)} м²</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Укупно умањење</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalUmanjenje)}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Просечна ефикасност</p>
                <p className="text-2xl font-bold text-orange-900">
                  {totalPovrsina > 0 ? Math.round(totalPotrosnja / totalPovrsina * 100) / 100 : 0} kWh/м²
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Календар догађаја</h3>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-lg font-medium text-gray-900">
            {selectedMonth.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}
          </h4>
          
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Events for selected month */}
          <div className="space-y-3">
          {monthEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Нема догађаја за овај месец</p>
          ) : (
            monthEvents.map(event => (
              <div 
                key={event.id} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedDate(event.date)}
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-600">
                    {event.date.toLocaleDateString('sr-RS')} - {getOsnovLabel(event.osnov)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected date events */}
        {selectedDate && dayEvents.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h5 className="text-md font-medium text-gray-900 mb-3">
              Догађаји за {selectedDate.toLocaleDateString('sr-RS')}
            </h5>
            <div className="space-y-2">
              {dayEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <Chip 
                    label={getOsnovLabel(event.osnov)} 
                    color={getOsnovColor(event.osnov) as any}
                    size="small"
                  />
                  <span className="text-sm text-gray-900">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}