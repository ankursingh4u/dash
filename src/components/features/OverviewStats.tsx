'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import {
  Users,
  Globe,
  CreditCard,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${!trend.isPositive ? 'rotate-180' : ''}`}
              />
              <span>{trend.value}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </Card>
  );
}

export function OverviewStats() {
  const { identities, websites, cards, orders } = useDataStore();

  const activeIdentities = identities.filter((i) => i.status === 'Active').length;
  const activeWebsites = websites.filter((w) => w.status === 'Active').length;
  const activeCards = cards.filter((c) => c.status === 'Active').length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

  const totalRevenue = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const totalCommissions = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + (o.commission || 0), 0);

  const refundReminders = orders.filter((o) => {
    if (!o.refund_reminder_date) return false;
    const reminderDate = new Date(o.refund_reminder_date);
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reminderDate <= in7Days && o.status !== 'Refunded';
  }).length;

  const stats = [
    {
      title: 'Total Identities',
      value: identities.length,
      subValue: `${activeIdentities} active`,
      icon: <Users className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-500/20',
    },
    {
      title: 'Websites',
      value: websites.length,
      subValue: `${activeWebsites} active`,
      icon: <Globe className="w-5 h-5 text-green-400" />,
      color: 'bg-green-500/20',
    },
    {
      title: 'Payment Cards',
      value: cards.length,
      subValue: `${activeCards} active`,
      icon: <CreditCard className="w-5 h-5 text-purple-400" />,
      color: 'bg-purple-500/20',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      subValue: `${pendingOrders} pending`,
      icon: <ShoppingCart className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-500/20',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: <DollarSign className="w-5 h-5 text-green-400" />,
      color: 'bg-green-500/20',
    },
    {
      title: 'Total Commissions',
      value: formatCurrency(totalCommissions),
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      color: 'bg-blue-500/20',
    },
    {
      title: 'Refund Reminders',
      value: refundReminders,
      subValue: 'within 7 days',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-500/20',
      isWarning: refundReminders > 0,
    },
    {
      title: 'Burned Identities',
      value: identities.filter((i) => i.status === 'Burned').length,
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      color: 'bg-red-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`relative overflow-hidden ${
            stat.isWarning ? 'border-amber-500/50' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stat.value}</p>
              {stat.subValue && (
                <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
