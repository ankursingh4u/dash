'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { UndoHistory } from '@/components/features/UndoHistory';

export default function UndoHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Undo History"
        description="View and revert recent actions"
      />
      <UndoHistory />
    </div>
  );
}
