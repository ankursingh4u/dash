'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`pr-10 ${className}`}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute right-3 top-[calc(50%+0.25rem)] transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
