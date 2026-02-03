'use client';

import React, { useState } from 'react';
import { Tabs, TabPanel, Card, Button, Table, Column, StatusBadge, Modal, ModalFooter } from '@/components/ui';
import { AdvertiserForm, AccountForm, OrderForm } from '@/components/forms';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Platform, Advertiser, PlatformAccount, Order } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { formatCurrency, formatPercentage } from '@/lib/utils/helpers';
import { Plus, Edit, Trash2, Download, Users, Key, ShoppingCart } from 'lucide-react';
import { exportPlatformData } from '@/lib/utils/csv';

interface PlatformDetailProps {
  platform: Platform;
}

type ModalType = 'advertiser' | 'account' | 'order' | null;

export function PlatformDetail({ platform }: PlatformDetailProps) {
  const {
    getAdvertisersByPlatform,
    getAccountsByPlatform,
    getOrdersByPlatform,
    identities,
    deleteAdvertiser,
    deleteAccount,
    deleteOrder,
  } = useDataStore();
  const { addAction } = useUndoStore();
  const { user, canEdit, canDelete } = useAuthStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('advertisers');
  const [formModal, setFormModal] = useState<{
    type: ModalType;
    item?: Advertiser | PlatformAccount | Order;
  }>({ type: null });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type?: 'advertiser' | 'account' | 'order';
    item?: Advertiser | PlatformAccount | Order;
  }>({ isOpen: false });

  const advertisers = getAdvertisersByPlatform(platform.id);
  const accounts = getAccountsByPlatform(platform.id);
  const orders = getOrdersByPlatform(platform.id);

  const tabs = [
    { id: 'advertisers', label: 'Advertisers', icon: <Users className="w-4 h-4" /> },
    { id: 'accounts', label: 'Accounts', icon: <Key className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  const handleDelete = () => {
    if (!deleteModal.type || !deleteModal.item) return;

    const { type, item } = deleteModal;

    if (type === 'advertiser') {
      deleteAdvertiser(item.id);
      addAction({
        user_id: user?.id || '',
        action: 'delete',
        entity_type: 'advertiser',
        entity_id: item.id,
        entity_name: (item as Advertiser).name,
        previous_data: item as unknown as Record<string, unknown>,
      });
    } else if (type === 'account') {
      deleteAccount(item.id);
      addAction({
        user_id: user?.id || '',
        action: 'delete',
        entity_type: 'account',
        entity_id: item.id,
        entity_name: (item as PlatformAccount).account_name,
        previous_data: item as unknown as Record<string, unknown>,
      });
    } else if (type === 'order') {
      deleteOrder(item.id);
      addAction({
        user_id: user?.id || '',
        action: 'delete',
        entity_type: 'order',
        entity_id: item.id,
        entity_name: (item as Order).order_number,
        previous_data: item as unknown as Record<string, unknown>,
      });
    }

    addToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    setDeleteModal({ isOpen: false });
  };

  const handleExport = () => {
    exportPlatformData(platform.slug, advertisers, accounts, orders);
    addToast('success', 'Export started');
  };

  const getIdentityName = (identityId?: string) => {
    if (!identityId) return '-';
    const identity = identities.find((i) => i.id === identityId);
    return identity?.name || '-';
  };

  const advertiserColumns: Column<Advertiser>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'contact_email', label: 'Email', render: (v) => String(v || '-') },
    { key: 'contact_name', label: 'Contact', render: (v) => String(v || '-') },
    {
      key: 'commission_rate',
      label: 'Commission',
      render: (_, row) => (row.commission_rate ? formatPercentage(row.commission_rate) : '-'),
    },
    { key: 'payment_terms', label: 'Terms', render: (v) => String(v || '-') },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
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
              onClick={() => setFormModal({ type: 'advertiser', item: row })}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: true, type: 'advertiser', item: row })}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const accountColumns: Column<PlatformAccount>[] = [
    { key: 'account_name', label: 'Account Name', sortable: true },
    { key: 'account_email', label: 'Email' },
    { key: 'affiliate_id', label: 'Affiliate ID', render: (v) => String(v || '-') },
    { key: 'identity_id', label: 'Identity', render: (_, row) => getIdentityName(row.identity_id) },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
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
              onClick={() => setFormModal({ type: 'account', item: row })}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: true, type: 'account', item: row })}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const orderColumns: Column<Order>[] = [
    { key: 'order_number', label: 'Order #', sortable: true },
    { key: 'product_name', label: 'Product', render: (v) => String(v || '-') },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (_, row) => formatCurrency(row.amount, row.currency),
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (_, row) => (row.commission ? formatCurrency(row.commission, row.currency) : '-'),
    },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> },
    { key: 'order_date', label: 'Date', sortable: true, render: (_, row) => formatDate(row.order_date) },
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
              onClick={() => setFormModal({ type: 'order', item: row })}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: true, type: 'order', item: row })}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Info */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{platform.name}</h2>
            {platform.description && (
              <p className="text-gray-400 mt-1">{platform.description}</p>
            )}
            <a
              href={platform.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 text-sm mt-2 inline-block"
            >
              {platform.website_url}
            </a>
          </div>
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export All
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <TabPanel isActive={activeTab === 'advertisers'}>
        <div className="flex justify-end mb-4">
          {canEdit() && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setFormModal({ type: 'advertiser' })}
            >
              Add Advertiser
            </Button>
          )}
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Table
            data={advertisers}
            columns={advertiserColumns}
            keyExtractor={(row) => row.id}
            emptyMessage="No advertisers found"
          />
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'accounts'}>
        <div className="flex justify-end mb-4">
          {canEdit() && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setFormModal({ type: 'account' })}
            >
              Add Account
            </Button>
          )}
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Table
            data={accounts}
            columns={accountColumns}
            keyExtractor={(row) => row.id}
            emptyMessage="No accounts found"
          />
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'orders'}>
        <div className="flex justify-end mb-4">
          {canEdit() && (
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setFormModal({ type: 'order' })}
            >
              Add Order
            </Button>
          )}
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Table
            data={orders}
            columns={orderColumns}
            keyExtractor={(row) => row.id}
            emptyMessage="No orders found"
          />
        </div>
      </TabPanel>

      {/* Form Modals */}
      <Modal
        isOpen={formModal.type === 'advertiser'}
        onClose={() => setFormModal({ type: null })}
        title={formModal.item ? 'Edit Advertiser' : 'Add Advertiser'}
        size="lg"
      >
        <AdvertiserForm
          platformId={platform.id}
          advertiser={formModal.item as Advertiser}
          onSuccess={() => setFormModal({ type: null })}
          onCancel={() => setFormModal({ type: null })}
        />
      </Modal>

      <Modal
        isOpen={formModal.type === 'account'}
        onClose={() => setFormModal({ type: null })}
        title={formModal.item ? 'Edit Account' : 'Add Account'}
        size="lg"
      >
        <AccountForm
          platformId={platform.id}
          account={formModal.item as PlatformAccount}
          onSuccess={() => setFormModal({ type: null })}
          onCancel={() => setFormModal({ type: null })}
        />
      </Modal>

      <Modal
        isOpen={formModal.type === 'order'}
        onClose={() => setFormModal({ type: null })}
        title={formModal.item ? 'Edit Order' : 'Add Order'}
        size="lg"
      >
        <OrderForm
          platformId={platform.id}
          order={formModal.item as Order}
          onSuccess={() => setFormModal({ type: null })}
          onCancel={() => setFormModal({ type: null })}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title={`Delete ${deleteModal.type?.charAt(0).toUpperCase()}${deleteModal.type?.slice(1)}`}
        size="sm"
      >
        <p className="text-gray-300">
          Are you sure you want to delete this {deleteModal.type}?
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
