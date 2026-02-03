'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`border-b border-gray-700 ${className}`}>
      <nav className="flex gap-1 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
              transition-colors
              ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
}

export function TabPanel({ children, isActive }: TabPanelProps) {
  if (!isActive) return null;
  return <div className="py-4">{children}</div>;
}
