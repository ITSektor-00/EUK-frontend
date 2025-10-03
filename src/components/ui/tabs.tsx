import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function Tabs({ children, value, onValueChange, className = '' }: TabsProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className = '' }: TabsTriggerProps) {
  return (
    <button
      className={`px-4 py-2 border-b-2 border-transparent hover:text-gray-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = '' }: TabsContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
