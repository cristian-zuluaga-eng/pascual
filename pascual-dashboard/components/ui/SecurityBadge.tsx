"use client";

import { useState, useEffect } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

type SecurityLevel = 'optimal' | 'good' | 'warning' | 'critical';

interface SecurityBadgeProps {
  initialLevel?: SecurityLevel;
  className?: string;
}

export default function SecurityBadge({ initialLevel = 'optimal', className = '' }: SecurityBadgeProps) {
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(initialLevel);

  // In a real app, this would be updated via API or websocket
  useEffect(() => {
    // Mock security level updates for demo purposes
    const timer = setTimeout(() => {
      setSecurityLevel(initialLevel);
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialLevel]);

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'optimal':
        return 'bg-teal-900/40 text-teal-400 border-teal-600';
      case 'good':
        return 'bg-blue-900/40 text-blue-400 border-blue-600';
      case 'warning':
        return 'bg-amber-900/40 text-amber-400 border-amber-600';
      case 'critical':
        return 'bg-red-900/40 text-red-400 border-red-600';
      default:
        return 'bg-teal-900/40 text-teal-400 border-teal-600';
    }
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${getSecurityColor()} ${className}`}>
      <ShieldCheckIcon className="h-4 w-4" />
      <span className="text-sm font-medium uppercase">
        Security
      </span>
      <span className="text-sm font-bold">
        {securityLevel.charAt(0).toUpperCase() + securityLevel.slice(1)}
      </span>
    </div>
  );
}