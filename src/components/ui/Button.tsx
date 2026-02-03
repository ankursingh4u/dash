'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 border-transparent',
  outline: 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
