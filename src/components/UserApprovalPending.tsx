'use client';

import React from 'react';

interface UserApprovalPendingProps {
  onClose: () => void;
  username?: string;
}

const UserApprovalPending: React.FC<UserApprovalPendingProps> = ({ onClose, username }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-3">
          Налог чека одобрење
        </h2>

        {/* Message */}
        <div className="text-gray-600 text-center mb-6 space-y-2">
          <p>
            {username ? (
              <>Здраво <strong>{username}</strong>!</>
            ) : (
              'Здраво!'
            )}
          </p>
          <p>
            Ваш налог је успешно креиран, али још увек чека одобрење од стране администратора.
          </p>
          <p className="text-sm text-gray-500">
            Бићете обавештени путем е-маила када ваш налог буде одобрен.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Шта даље?
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Сачекајте да администратор одобри ваш налог</li>
                  <li>Проверите е-маил за обавештење о одобрењу</li>
                  <li>Покушајте поново да се пријавите када будете одобрени</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            Разумем
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            За питања контактирајте администратора система
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalPending;