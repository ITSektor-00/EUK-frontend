"use client";
import React, { useState, useMemo } from 'react';
import { Chip } from '@mui/material';

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  rokZaZavrsetak: string;
  kategorijaId: number;
  kategorijaNaziv?: string;
  kategorijaSkracenica?: string;
  datumKreiranja?: string;
  kategorija?: {
    kategorijaId: number;
    naziv: string;
    skracenica: string;
  };
}

interface Kategorija {
  kategorijaId: number;
  naziv: string;
  skracenica: string;
}

interface PredmetiStatistikaProps {
  predmeti: Predmet[];
  kategorije: Kategorija[];
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'deadline' | 'creation' | 'activity';
  priority: string;
  status: string;
  predmetId: number;
}

export default function PredmetiStatistika({ predmeti, kategorije }: PredmetiStatistikaProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate statistics
  const ukupno = predmeti.length;
  
  const poStatusu = predmeti.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poPrioritetu = predmeti.reduce((acc, p) => {
    acc[p.prioritet] = (acc[p.prioritet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const poKategoriji = predmeti.reduce((acc, p) => {
    const kategorija = kategorije.find(k => k.kategorijaId === p.kategorijaId);
    const naziv = kategorija?.naziv || 'Непознато';
    acc[naziv] = (acc[naziv] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate calendar events from predmeti
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    predmeti.forEach(predmet => {
      // Add creation date event
      if (predmet.datumKreiranja) {
        events.push({
          id: predmet.predmetId * 1000 + 1,
          title: `Креиран предмет: ${predmet.nazivPredmeta}`,
          date: new Date(predmet.datumKreiranja),
          type: 'creation',
          priority: predmet.prioritet,
          status: predmet.status,
          predmetId: predmet.predmetId
        });
      }
      
      // Add deadline event
      if (predmet.rokZaZavrsetak) {
        events.push({
          id: predmet.predmetId * 1000 + 2,
          title: `Рок за завршетак: ${predmet.nazivPredmeta}`,
          date: new Date(predmet.rokZaZavrsetak),
          type: 'deadline',
          priority: predmet.prioritet,
          status: predmet.status,
          predmetId: predmet.predmetId
        });
      }
    });
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [predmeti]);

  // Filter events for selected month
  const monthEvents = useMemo(() => {
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    return calendarEvents.filter(event => 
      event.date >= startOfMonth && event.date <= endOfMonth
    );
  }, [calendarEvents, selectedMonth]);

  // Get month navigation - trenutno neiskorišćeno
  // const previousMonth = () => {
  //   setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  // };

  // const nextMonth = () => {
  //   setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  // };

  const goToToday = () => {
    setSelectedMonth(new Date());
    setSelectedDate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'активан': return 'success';
      case 'затворен': return 'default';
      case 'на_чекању': return 'warning';
      case 'у_обради': return 'info';
      default: return 'default';
    }
  };

  const getPrioritetColor = (prioritet: string) => {
    switch (prioritet) {
      case 'критичан': return 'error';
      case 'висок': return 'warning';
      case 'средњи': return 'info';
      case 'низак': return 'success';
      default: return 'default';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-800 border-red-300';
      case 'creation': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'activity': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const aktivniPredmeti = predmeti.filter(p => p.status === 'активан').length;
  const zatvoreniPredmeti = predmeti.filter(p => p.status === 'затворен').length;
  const kriticniPredmeti = predmeti.filter(p => p.prioritet === 'критичан').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Укупно предмета</p>
              <p className="text-2xl font-bold text-gray-900">{ukupno}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активни предмети</p>
              <p className="text-2xl font-bold text-gray-900">{aktivniPredmeti}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Затворени предмети</p>
              <p className="text-2xl font-bold text-gray-900">{zatvoreniPredmeti}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Критични предмети</p>
              <p className="text-2xl font-bold text-gray-900">{kriticniPredmeti}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Linear Calendar - Main Feature */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Линеарни календар активности и рокова</h3>
        </div>
        
        {/* Date Range Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-6">
            {/* Simple Month Selection */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Месец:</label>
              <select
                value={selectedMonth.getMonth()}
                onChange={(e) => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setMonth(parseInt(e.target.value));
                  setSelectedMonth(newMonth);
                  setSelectedDate(null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Јануар</option>
                <option value={1}>Фебруар</option>
                <option value={2}>Март</option>
                <option value={3}>Април</option>
                <option value={4}>Мај</option>
                <option value={5}>Јун</option>
                <option value={6}>Јул</option>
                <option value={7}>Август</option>
                <option value={8}>Септембар</option>
                <option value={9}>Октобар</option>
                <option value={10}>Новембар</option>
                <option value={11}>Децембар</option>
              </select>
            </div>

            {/* Simple Year Selection */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Година:</label>
              <select
                value={selectedMonth.getFullYear()}
                onChange={(e) => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setFullYear(parseInt(e.target.value));
                  setSelectedMonth(newMonth);
                  setSelectedDate(null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Simple Day Selection */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Дан:</label>
              <select
                value={selectedDate ? selectedDate.getDate() : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(selectedMonth);
                    newDate.setDate(parseInt(e.target.value));
                    setSelectedDate(newDate);
                  } else {
                    setSelectedDate(null);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Изабери дан</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Данас
              </button>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                >
                  Очисти дан
                </button>
              )}
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-blue-800">
                Изабрани период: <strong>{selectedMonth.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}</strong>
              </span>
              {selectedDate && (
                <span className="font-medium text-blue-800">
                  | Изабран дан: <strong>{selectedDate.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-700">Рокови за завршетак</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-700">Креирани предмети</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">Активности</span>
          </div>
        </div>

        {/* Linear Calendar Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Events */}
          <div className="space-y-4">
            {monthEvents.length > 0 ? (
              monthEvents.map((event) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  {/* Date marker */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {event.date.getDate()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                            {event.type === 'deadline' ? 'Рок' : event.type === 'creation' ? 'Креирање' : 'Активност'}
                          </span>
                          <Chip 
                            label={event.status} 
                            color={getStatusColor(event.status)} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={event.priority} 
                            color={getPrioritetColor(event.priority)} 
                            size="small" 
                            variant="outlined" 
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {event.date.toLocaleDateString('sr-RS', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      {/* Priority indicator */}
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          event.priority === 'критичан' ? 'bg-red-500' :
                          event.priority === 'висок' ? 'bg-orange-500' :
                          event.priority === 'средњи' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">Нема активности у овом месецу</p>
                <p className="text-sm">Изаберите други месец или додајте нове предмете</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {monthEvents.filter(e => e.type === 'deadline').length}
              </div>
              <div className="text-sm text-red-700">Рокови у месецу</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {monthEvents.filter(e => e.type === 'creation').length}
              </div>
              <div className="text-sm text-blue-700">Нови предмети</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {monthEvents.filter(e => e.priority === 'критичан').length}
              </div>
              <div className="text-sm text-green-700">Критични рокови</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Распоред по статусу</h3>
          <div className="space-y-3">
            {Object.entries(poStatusu).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chip 
                    label={status} 
                    color={getStatusColor(status)} 
                    size="small" 
                    variant="outlined" 
                  />
                  <span className="text-sm text-gray-600">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${(count / ukupno) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {Math.round((count / ukupno) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Распоред по приоритету</h3>
          <div className="space-y-3">
            {Object.entries(poPrioritetu).map(([prioritet, count]) => (
              <div key={prioritet} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chip 
                    label={prioritet} 
                    color={getPrioritetColor(prioritet)} 
                    size="small" 
                    variant="outlined" 
                  />
                  <span className="text-sm text-gray-600">{prioritet}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-orange-500 rounded-full" 
                      style={{ width: `${(count / ukupno) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {Math.round((count / ukupno) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Распоред по категоријама</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(poKategoriji).map(([kategorija, count]) => (
            <div key={kategorija} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{kategorija}</p>
                <p className="text-sm text-gray-600">{count} предмета</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{Math.round((count / ukupno) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Недавни предмети</h3>
        <div className="space-y-3">
          {predmeti.slice(0, 5).map((predmet) => (
            <div key={predmet.predmetId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{predmet.nazivPredmeta}</p>
                  <p className="text-sm text-gray-600">ID: {predmet.predmetId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip 
                  label={predmet.status} 
                  color={getStatusColor(predmet.status)} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={predmet.prioritet} 
                  color={getPrioritetColor(predmet.prioritet)} 
                  size="small" 
                  variant="outlined" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
