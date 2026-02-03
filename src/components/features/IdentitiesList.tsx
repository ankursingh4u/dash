'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, Column, StatusBadge, Button, Input, Select, Modal, ModalFooter } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Identity } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { Edit, Trash2, Search, Plus, Download } from 'lucide-react';
import { exportIdentities } from '@/lib/utils/csv';

export function IdentitiesList() {
  const { identities, deleteIdentity } = useDataStore();
  const { addAction } = useUndoStore();
  const { user, canEdit, canDelete } = useAuthStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; identity?: Identity }>({
    isOpen: false,
  });

  const filteredIdentities = useMemo(() => {
    return identities.filter((identity) => {
      const matchesSearch =
        !searchQuery ||
        identity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        identity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        identity.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || identity.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [identities, searchQuery, statusFilter]);

  const handleDelete = () => {
    if (!deleteModal.identity) return;

    const identity = deleteModal.identity;
    deleteIdentity(identity.id);

    addAction({
      user_id: user?.id || '',
      action: 'delete',
      entity_type: 'identity',
      entity_id: identity.id,
      entity_name: identity.name,
      previous_data: identity as unknown as Record<string, unknown>,
    });

    addToast('success', 'Identity deleted successfully');
    setDeleteModal({ isOpen: false });
  };

  const handleExport = () => {
    exportIdentities(filteredIdentities);
    addToast('success', 'Export started');
  };

  const columns: Column<Identity>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-100">{row.name}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => String(value || '-'),
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
            <Link href={`/master-data/identities/${row.id}`}>
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
                setDeleteModal({ isOpen: true, identity: row });
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
              placeholder="Search identities..."
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
              { value: 'Burned', label: 'Burned' },
              { value: 'Pending Docs', label: 'Pending Docs' },
            ]}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          {canEdit() && (
            <Link href="/master-data/identities/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Add Identity</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <Table
          data={filteredIdentities}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyMessage="No identities found"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Delete Identity"
        size="sm"
      >
        <p className="text-gray-300">
          Are you sure you want to delete <strong>{deleteModal.identity?.name}</strong>?
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
