'use client';

import React, { useState } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 border-b border-gray-700 bg-gray-900 flex items-center justify-between px-6">
      {/* Title */}
      <div>
        {title && <h1 className="text-lg font-semibold text-gray-100">{title}</h1>}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-1.5 text-sm bg-gray-800/50"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
