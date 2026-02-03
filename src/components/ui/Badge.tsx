'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-600 text-gray-200',
  success: 'bg-green-600/20 text-green-400 border border-green-600/30',
  warning: 'bg-amber-600/20 text-amber-400 border border-amber-600/30',
  danger: 'bg-red-600/20 text-red-400 border border-red-600/30',
  info: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const statusVariants: Record<string, BadgeProps['variant']> = {
    Active: 'success',
    Inactive: 'default',
    Burned: 'danger',
    'Pending Docs': 'warning',
    Pending: 'warning',
    Completed: 'success',
    Refunded: 'danger',
    Cancelled: 'default',
    Expired: 'danger',
    Blocked: 'danger',
    Suspended: 'danger',
  };

  return <Badge variant={statusVariants[status] || 'default'}>{status}</Badge>;
}
