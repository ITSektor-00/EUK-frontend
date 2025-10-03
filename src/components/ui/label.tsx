import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className = '' }: LabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
    >
      {children}
    </label>
  );
}
