'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { IdentitiesList } from '@/components/features/IdentitiesList';

export default function IdentitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Identities"
        description="Manage your identity profiles"
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Identities' },
        ]}
      />
      <IdentitiesList />
    </div>
  );
}
