"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface Predmet {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  odgovornaOsoba: string;
  prioritet: string;
  rokZaZavrsetak: string;
  kategorijaId: number;
  kategorijaNaziv?: string;
  datumKreiranja?: string;
  kategorija?: {
    kategorijaId: number;
    naziv: string;
  };
}

interface PredmetDetaljiModalProps {
  isOpen: boolean;
  onClose: () => void;
  predmet: Predmet | null;
  kategorijaNaziv: string;
}

export default function PredmetDetaljiModal({
  isOpen,
  onClose,
  predmet,
  kategorijaNaziv
}: PredmetDetaljiModalProps) {
  const router = useRouter();
  if (!isOpen || !predmet) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'активан': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
      case 'затворен': return { bg: '#f8fafc', text: '#475569', border: '#64748b' };
      case 'на_чекању': return { bg: '#fffbeb', text: '#92400e', border: '#f59e0b' };
      case 'у_обради': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const getPrioritetColor = (prioritet: string) => {
    switch (prioritet) {
      case 'низак': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981' };
      case 'средњи': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6' };
      case 'висок': return { bg: '#fff7ed', text: '#c2410c', border: '#f97316' };
      case 'критичан': return { bg: '#fef2f2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const statusColors = getStatusColor(predmet.status);
  const prioritetColors = getPrioritetColor(predmet.prioritet);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3B82F6] text-white p-4 rounded-t-2xl -m-6 mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Детаљи предмета
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Основне информације</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">ID предмета</label>
                <p className="text-lg font-semibold text-gray-900">#{predmet.predmetId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Назив предмета</label>
                <p className="text-lg font-semibold text-gray-900">{predmet.nazivPredmeta}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Датум креирања</label>
                <p className="text-lg text-gray-900">
                  {predmet.datumKreiranja ? new Date(predmet.datumKreiranja).toLocaleDateString('sr-RS') : 'Непознато'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Одговорна особа</label>
                <p className="text-lg text-gray-900">{predmet.odgovornaOsoba}</p>
              </div>
            </div>
          </div>

          {/* Status & Priority Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Статус и приоритет</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Статус</label>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.border}`,
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minWidth: '80px',
                    height: '32px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    verticalAlign: 'middle'
                  }}
                >
                  {predmet.status}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Приоритет</label>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: prioritetColors.bg,
                    color: prioritetColors.text,
                    border: `1px solid ${prioritetColors.border}`,
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minWidth: '80px',
                    height: '32px',
                    lineHeight: '16px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    verticalAlign: 'middle'
                  }}
                >
                  {predmet.prioritet}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Додатне информације</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Категорија</label>
                <p className="text-lg text-gray-900">{kategorijaNaziv}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Рок за завршетак</label>
                <p className="text-lg text-gray-900">
                  {predmet.rokZaZavrsetak ? new Date(predmet.rokZaZavrsetak).toLocaleDateString('sr-RS') : 'Непознато'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Акције</h4>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => router.push(`/euk/predmeti/${predmet.predmetId}`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium cursor-pointer"
              >
                Отвори детаљну страницу
              </button>
              <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors duration-200 font-medium cursor-pointer">
                Уреди предмет
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium cursor-pointer">
                Промени статус
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium cursor-pointer">
                Додај коментар
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium cursor-pointer"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
