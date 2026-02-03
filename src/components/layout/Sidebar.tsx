'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Database,
  Globe,
  Bot,
  Users,
  CreditCard,
  ChevronDown,
  LogOut,
  History,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    label: 'Overview',
    href: '/overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Learning',
    href: '/learning',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: 'Master Data',
    href: '/master-data/identities',
    icon: <Database className="w-5 h-5" />,
    children: [
      { label: 'Identities', href: '/master-data/identities' },
      { label: 'Websites', href: '/master-data/websites' },
      { label: 'Cards', href: '/master-data/cards' },
    ],
  },
  {
    label: 'Platforms',
    href: '/platforms/clickbank',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    label: 'AI Assistant',
    href: '/ai-assistant',
    icon: <Bot className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const platforms = useDataStore((state) => state.platforms);
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['Master Data']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/platforms/clickbank') {
      return pathname.startsWith('/platforms');
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1a1f2e] border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-amber-500">CodersHive</h1>
        <p className="text-xs text-gray-500 mt-1">Operations Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-colors
                      ${
                        isActive(item.href)
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                pathname === child.href
                                  ? 'text-amber-500 bg-amber-500/10'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                              }
                            `}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : item.label === 'Platforms' ? (
                <div>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-colors
                      ${
                        isActive(item.href)
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                  {isActive(item.href) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {platforms.map((platform) => (
                        <li key={platform.id}>
                          <Link
                            href={`/platforms/${platform.slug}`}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                pathname === `/platforms/${platform.slug}`
                                  ? 'text-amber-500 bg-amber-500/10'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                              }
                            `}
                          >
                            {platform.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Undo History Section */}
        <div className="mt-6 px-3">
          <div className="border-t border-gray-700 pt-4">
            <Link
              href="/undo-history"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <History className="w-5 h-5" />
              Undo History
            </Link>
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'system_admin'
                ? 'System Admin'
                : user?.role === 'admin'
                  ? 'Admin'
                  : 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
