'use client';

import React, { useState, useMemo } from 'react';
import { Table, Column, StatusBadge, Badge, Button, Input, Select, Modal, ModalFooter, Card } from '@/components/ui';
import { CardForm } from '@/components/forms/CardForm';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Card as CardType } from '@/types';
import { formatExpiryDate, isExpired, isExpiringSoon } from '@/lib/utils/dates';
import { maskCardNumber } from '@/lib/utils/helpers';
import { Edit, Trash2, Search, Plus, Download, CreditCard } from 'lucide-react';
import { exportCards } from '@/lib/utils/csv';

export function CardsList() {
  const { cards, identities, deleteCard } = useDataStore();
  const { addAction } = useUndoStore();
  const { user, canEdit, canDelete } = useAuthStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | undefined>();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; card?: CardType }>({
    isOpen: false,
  });

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const identity = identities.find((i) => i.id === card.identity_id);
      const matchesSearch =
        !searchQuery ||
        card.card_holder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.last_four.includes(searchQuery) ||
        identity?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || card.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cards, identities, searchQuery, statusFilter]);

  const handleDelete = () => {
    if (!deleteModal.card) return;

    const card = deleteModal.card;
    deleteCard(card.id);

    addAction({
      user_id: user?.id || '',
      action: 'delete',
      entity_type: 'card',
      entity_id: card.id,
      entity_name: `****${card.last_four}`,
      previous_data: card as unknown as Record<string, unknown>,
    });

    addToast('success', 'Card deleted successfully');
    setDeleteModal({ isOpen: false });
  };

  const handleExport = () => {
    exportCards(filteredCards);
    addToast('success', 'Export started');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCard(undefined);
  };

  const getIdentityName = (identityId: string) => {
    const identity = identities.find((i) => i.id === identityId);
    return identity?.name || 'Unknown';
  };

  const getExpiryStatus = (month: number, year: number) => {
    if (isExpired(month, year)) return 'expired';
    if (isExpiringSoon(month, year)) return 'expiring';
    return 'valid';
  };

  const columns: Column<CardType>[] = [
    {
      key: 'card_holder',
      label: 'Card',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-700">
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-100">{maskCardNumber(row.last_four)}</p>
            <p className="text-sm text-gray-500">{row.card_holder}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'card_type',
      label: 'Type',
      sortable: true,
      render: (_, row) => (
        <Badge variant="info" size="sm">
          {row.card_type}
        </Badge>
      ),
    },
    {
      key: 'identity_id',
      label: 'Identity',
      render: (_, row) => getIdentityName(row.identity_id),
    },
    {
      key: 'expiry',
      label: 'Expiry',
      render: (_, row) => {
        const status = getExpiryStatus(row.expiry_month, row.expiry_year);
        return (
          <span
            className={`${
              status === 'expired'
                ? 'text-red-400'
                : status === 'expiring'
                  ? 'text-amber-400'
                  : 'text-gray-300'
            }`}
          >
            {formatExpiryDate(row.expiry_month, row.expiry_year)}
          </span>
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
      key: 'actions',
      label: '',
      className: 'w-20',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {canEdit() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingCard(row);
                setShowForm(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({ isOpen: true, card: row });
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
      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              {editingCard ? 'Edit Card' : 'Add New Card'}
            </h3>
          </div>
          <CardForm
            card={editingCard}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingCard(undefined);
            }}
          />
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search cards..."
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
              { value: 'Expired', label: 'Expired' },
              { value: 'Blocked', label: 'Blocked' },
            ]}
            className="w-40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          {canEdit() && !showForm && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingCard(undefined);
                setShowForm(true);
              }}
            >
              Add Card
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <Table
          data={filteredCards}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyMessage="No cards found"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Delete Card"
        size="sm"
      >
        <p className="text-gray-300">
          Are you sure you want to delete card ending in{' '}
          <strong>{deleteModal.card?.last_four}</strong>?
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
