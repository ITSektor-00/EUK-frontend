import React from 'react';

interface ValidationIndicatorProps {
  isValid: boolean;
  isChecking: boolean;
  message: string;
  showMessage?: boolean;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  isValid,
  isChecking,
  message,
  showMessage = false
}) => {
  if (isChecking) {
    return (
      <div className="flex items-center space-x-1">
        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {showMessage && <span className="text-xs text-blue-600">Proveravam...</span>}
      </div>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1">
      {isValid ? (
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {showMessage && (
        <span className={`text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  );
}; 