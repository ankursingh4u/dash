'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { IdentityForm } from '@/components/forms/IdentityForm';
import { useDataStore } from '@/stores/dataStore';

export default function EditIdentityPage() {
  const params = useParams();
  const id = params.id as string;

  const { getIdentity } = useDataStore();
  const identity = getIdentity(id);

  if (!identity) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Identity"
          breadcrumbs={[
            { label: 'Master Data', href: '/master-data/identities' },
            { label: 'Identities', href: '/master-data/identities' },
            { label: 'Edit' },
          ]}
        />
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <p className="text-gray-400">Identity not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Identity"
        description={`Editing ${identity.name}`}
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Identities', href: '/master-data/identities' },
          { label: identity.name },
        ]}
      />
      <IdentityForm identity={identity} />
    </div>
  );
}
