'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { OverviewStats } from '@/components/features/OverviewStats';
import { Card } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatRelative } from '@/lib/utils/dates';
import Link from 'next/link';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function OverviewPage() {
  const { user } = useAuthStore();
  const { orders, identities } = useDataStore();

  // Get upcoming refund reminders (within 7 days)
  const upcomingReminders = orders
    .filter((o) => {
      if (!o.refund_reminder_date || o.status === 'Refunded') return false;
      const reminderDate = new Date(o.refund_reminder_date);
      const today = new Date();
      const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return reminderDate >= today && reminderDate <= in7Days;
    })
    .sort((a, b) =>
      new Date(a.refund_reminder_date!).getTime() - new Date(b.refund_reminder_date!).getTime()
    )
    .slice(0, 5);

  // Get recently added identities
  const recentIdentities = [...identities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'User'}`}
        description="Here's an overview of your operations"
      />

      {/* Stats Grid */}
      <OverviewStats />

      {/* Quick Actions & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Refund Reminders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Upcoming Refund Reminders
            </h3>
            <Link
              href="/platforms/clickbank"
              className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      Order #{order.order_number}
                    </p>
                    <p className="text-xs text-gray-400">{order.product_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-500">
                      {formatDate(order.refund_reminder_date!)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelative(order.refund_reminder_date!)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming refund reminders</p>
            </div>
          )}
        </Card>

        {/* Recent Identities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Recent Identities
            </h3>
            <Link
              href="/master-data/identities"
              className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentIdentities.length > 0 ? (
            <div className="space-y-3">
              {recentIdentities.map((identity) => (
                <Link
                  key={identity.id}
                  href={`/master-data/identities/${identity.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {identity.name}
                    </p>
                    <p className="text-xs text-gray-400">{identity.country}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        identity.status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {identity.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No identities yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
