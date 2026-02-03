'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { WebsiteForm } from '@/components/forms/WebsiteForm';

export default function NewWebsitePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Website"
        description="Add a new website to your portfolio"
        breadcrumbs={[
          { label: 'Master Data', href: '/master-data/identities' },
          { label: 'Websites', href: '/master-data/websites' },
          { label: 'New Website' },
        ]}
      />
      <WebsiteForm />
    </div>
  );
}
