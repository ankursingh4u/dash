'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { WebsiteForm } from '@/components/forms/WebsiteForm';
import { useDataStore } from '@/stores/dataStore';

export default function EditWebsitePage() {
  const params = useParams();
  const id = params.id as string;

  const { getWebsite } = useDataStore();
  const website = getWebsite(id);

  if (!website) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Website"
          breadcrumbs={[
            { label: 'Master Data', href: '/master-data/identities' },
            { label: 'Websites', href: '/master-data/websites' },
            { label: 'Edit' },
          ]}
        />
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <p className="text-gray-400">Website not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Website"
        description={`Editing ${website.name}`}
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Websites', href: '/master-data/websites' },
          { label: website.name },
        ]}
      />
      <WebsiteForm website={website} />
    </div>
  );
}
