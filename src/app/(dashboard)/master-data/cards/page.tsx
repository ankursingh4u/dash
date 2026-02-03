'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CardsList } from '@/components/features/CardsList';

export default function CardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Cards"
        description="Manage your payment cards"
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Cards' },
        ]}
      />
      <CardsList />
    </div>
  );
}
