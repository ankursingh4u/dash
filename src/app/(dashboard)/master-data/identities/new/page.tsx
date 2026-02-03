'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { IdentityForm } from '@/components/forms/IdentityForm';

export default function NewIdentityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Identity"
        description="Create a new identity profile"
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Identities', href: '/master-data/identities' },
          { label: 'New Identity' },
        ]}
      />
      <IdentityForm />
    </div>
  );
}
