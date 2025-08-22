'use client';

import React, { useState } from 'react';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = "w-6 h-6" }: NotificationBellProps) {
  const [hasNotifications, setHasNotifications] = useState(false);

  return (
    <div className="relative">
      <button
        className="relative p-2 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full transition-colors"
        onClick={() => setHasNotifications(false)}
      >
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25v1.5h16.5v-1.5L19.5 13.5V9.75a6 6 0 00-6-6h-3z"
          />
        </svg>
        {hasNotifications && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>
    </div>
  );
}
