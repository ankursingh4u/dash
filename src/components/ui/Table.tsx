'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  isLoading = false,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortConfig.key];
      const bValue = (b as Record<string, unknown>)[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-700/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3 text-left text-sm font-medium text-gray-400
                  ${column.sortable ? 'cursor-pointer select-none hover:text-gray-200' : ''}
                  ${column.className || ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && sortConfig?.key === column.key && (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={`
                border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-gray-300 ${column.className || ''}`}
                >
                  {column.render
                    ? column.render((row as Record<string, unknown>)[column.key], row, index)
                    : String((row as Record<string, unknown>)[column.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
