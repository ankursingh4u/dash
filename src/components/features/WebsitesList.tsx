'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, Column, StatusBadge, Badge, Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Website } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { Edit, Trash2, Search, Plus, Download, ExternalLink } from 'lucide-react';
import { exportWebsites } from '@/lib/utils/csv';

export function WebsitesList() {
  const { websites, platforms, identities, deleteWebsite } = useDataStore();
  const { addAction } = useUndoStore();
  const { user, canEdit, canDelete } = useAuthStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; website?: Website }>({
    isOpen: false,
  });

  const filteredWebsites = useMemo(() => {
    return websites.filter((website) => {
      const matchesSearch =
        !searchQuery ||
        website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.url?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || website.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [websites, searchQuery, statusFilter]);

  const handleDelete = () => {
    if (!deleteModal.website) return;

    const website = deleteModal.website;
    deleteWebsite(website.id);

    addAction({
      user_id: user?.id || '',
      action: 'delete',
      entity_type: 'website',
      entity_id: website.id,
      entity_name: website.name,
      previous_data: website as unknown as Record<string, unknown>,
    });

    addToast('success', 'Website deleted successfully');
    setDeleteModal({ isOpen: false });
  };

  const handleExport = () => {
    exportWebsites(filteredWebsites);
    addToast('success', 'Export started');
  };

  const getIdentityName = (identityId?: string) => {
    if (!identityId) return '-';
    const identity = identities.find((i) => i.id === identityId);
    return identity?.name || '-';
  };

  const getPlatformNames = (platformIds: string[]) => {
    return platformIds
      .map((id) => platforms.find((p) => p.id === id)?.name)
      .filter(Boolean);
  };

  const columns: Column<Website>[] = [
    {
      key: 'name',
      label: 'Website',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-100">{row.name}</p>
          {row.url && (
            <a
              href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {row.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'website_type',
      label: 'Type',
      sortable: true,
      render: (_, row) => row.website_type || '-',
    },
    {
      key: 'identity_id',
      label: 'Identity',
      render: (_, row) => getIdentityName(row.identity_id),
    },
    {
      key: 'platform_ids',
      label: 'Platforms',
      render: (_, row) => {
        const platformNames = getPlatformNames(row.platform_ids);
        return (
          <div className="flex flex-wrap gap-1">
            {platformNames.length > 0 ? (
              platformNames.map((name) => (
                <Badge key={name} variant="info" size="sm">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (_, row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-20',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {canEdit() && (
            <Link href={`/master-data/websites/${row.id}`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({ isOpen: true, website: row });
              }}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          {canEdit() && (
            <Link href="/master-data/websites/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Add Website</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <Table
          data={filteredWebsites}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyMessage="No websites found"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Delete Website"
        size="sm"
      >
        <p className="text-gray-300">
          Are you sure you want to delete <strong>{deleteModal.website?.name}</strong>?
          This action can be undone from the undo history.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteModal({ isOpen: false })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
