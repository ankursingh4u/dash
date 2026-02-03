'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { WebsitesList } from '@/components/features/WebsitesList';

export default function WebsitesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Websites"
        description="Manage your website portfolio"
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Websites' },
        ]}
      />
      <WebsitesList />
    </div>
  );
}
