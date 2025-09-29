'use client';

import React from 'react';
import { useGlobalLicense } from '../../contexts/GlobalLicenseContext';

const GlobalLicenseExpiredPage: React.FC = () => {
  const { globalLicenseInfo, getGlobalLicenseStatusMessage, getFormattedGlobalLicenseEndDate } = useGlobalLicense();

  const contactAdmin = () => {
    const subject = encodeURIComponent('Захтев за продужење глобалне лиценце');
    const body = encodeURIComponent(
      `Поштовани,\n\nМолим Вас да продужите глобалну лиценцу за ЕУК Платформу.\n\nХвала унапред.`
    );
    window.open(`mailto:admin@euk.rs?subject=${subject}&body=${body}`, '_blank');
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-4 text-center">
        {/* Ikona */}
        <div className="text-8xl mb-6">⚠️</div>
        
        {/* Naslov */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Глобална лиценца је истекла
        </h1>
        
        {/* Poruka */}
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          Глобална лиценца за ЕУК систем је истекла. Молимо контактирајте администратора за продужење лиценце.
        </p>

        {/* Detalji o licenci */}
        {globalLicenseInfo && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Детаљи о лиценци:</h3>
            <div className="space-y-2 text-left">
              <p className="text-gray-700">
                <span className="font-medium">Статус:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  globalLicenseInfo.hasValidLicense 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {globalLicenseInfo.hasValidLicense ? 'Важећа' : 'Истекла'}
                </span>
              </p>
              {globalLicenseInfo.endDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Датум истека:</span> {getFormattedGlobalLicenseEndDate()}
                </p>
              )}
              {globalLicenseInfo.daysUntilExpiry > 0 && (
                <p className="text-gray-700">
                  <span className="font-medium">Дана до истека:</span> {globalLicenseInfo.daysUntilExpiry}
                </p>
              )}
              <p className="text-gray-700">
                <span className="font-medium">Порука:</span> {getGlobalLicenseStatusMessage()}
              </p>
            </div>
          </div>
        )}

        {/* Akcije */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={contactAdmin}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            📧 Контактирај администратора
          </button>
          
          <button
            onClick={refreshPage}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            🔄 Освежи страницу
          </button>
        </div>

        {/* Dodatne informacije */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Ако мислите да је ово грешка, молимо контактирајте администратора система.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLicenseExpiredPage;
