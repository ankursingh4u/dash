'use client';

import { useParams, notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlatformDetail } from '@/components/features/PlatformDetail';
import { useDataStore } from '@/stores/dataStore';
import { Skeleton } from '@/components/ui';

export default function PlatformPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { getPlatformBySlug, platforms } = useDataStore();
  const platform = getPlatformBySlug(slug);

  if (!platform) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Platform Not Found"
          breadcrumbs={[
            { label: 'Platforms', href: '/platforms/clickbank' },
            { label: 'Not Found' },
          ]}
        />
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
          <p className="text-gray-400 mb-4">
            The platform "{slug}" could not be found.
          </p>
          <div className="text-sm text-gray-500">
            Available platforms:{' '}
            {platforms.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ', '}
                <a href={`/platforms/${p.slug}`} className="text-amber-500 hover:underline">
                  {p.name}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={platform.name}
        description={platform.description || `Manage your ${platform.name} account`}
        breadcrumbs={[
          { label: 'Platforms', href: `/platforms/${platforms[0]?.slug || 'clickbank'}` },
          { label: platform.name },
        ]}
      />
      <PlatformDetail platform={platform} />
    </div>
  );
}
