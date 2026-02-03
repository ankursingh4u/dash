'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-300 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-400">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
          {description && (
            <p className="text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
