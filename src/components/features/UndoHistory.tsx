'use client';

import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useUndoStore } from '@/stores/undoStore';
import { useDataStore } from '@/stores/dataStore';
import { useToast } from '@/components/ui/Toast';
import { formatRelative } from '@/lib/utils/dates';
import { Undo2, Plus, Edit, Trash2 } from 'lucide-react';

const actionIcons = {
  create: <Plus className="w-4 h-4" />,
  update: <Edit className="w-4 h-4" />,
  delete: <Trash2 className="w-4 h-4" />,
};

const actionColors: Record<string, 'success' | 'info' | 'danger'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
};

export function UndoHistory() {
  const { getHistory, revertAction } = useUndoStore();
  const dataStore = useDataStore();
  const { addToast } = useToast();

  const history = getHistory();

  const handleRevert = (id: string) => {
    const item = revertAction(id);
    if (!item) {
      addToast('error', 'Failed to revert action');
      return;
    }

    // Restore the previous state based on action type
    try {
      if (item.action === 'delete' && item.previous_data) {
        // Recreate deleted item
        switch (item.entity_type) {
          case 'identity':
            dataStore.addIdentity(item.previous_data as Parameters<typeof dataStore.addIdentity>[0]);
            break;
          case 'website':
            dataStore.addWebsite(item.previous_data as Parameters<typeof dataStore.addWebsite>[0]);
            break;
          case 'card':
            dataStore.addCard(item.previous_data as Parameters<typeof dataStore.addCard>[0]);
            break;
          case 'advertiser':
            dataStore.addAdvertiser(item.previous_data as Parameters<typeof dataStore.addAdvertiser>[0]);
            break;
          case 'account':
            dataStore.addAccount(item.previous_data as Parameters<typeof dataStore.addAccount>[0]);
            break;
          case 'order':
            dataStore.addOrder(item.previous_data as Parameters<typeof dataStore.addOrder>[0]);
            break;
        }
      } else if (item.action === 'update' && item.previous_data) {
        // Restore previous values
        switch (item.entity_type) {
          case 'identity':
            dataStore.updateIdentity(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateIdentity>[1]);
            break;
          case 'website':
            dataStore.updateWebsite(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateWebsite>[1]);
            break;
          case 'card':
            dataStore.updateCard(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateCard>[1]);
            break;
          case 'advertiser':
            dataStore.updateAdvertiser(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateAdvertiser>[1]);
            break;
          case 'account':
            dataStore.updateAccount(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateAccount>[1]);
            break;
          case 'order':
            dataStore.updateOrder(item.entity_id, item.previous_data as Parameters<typeof dataStore.updateOrder>[1]);
            break;
        }
      } else if (item.action === 'create') {
        // Delete created item
        switch (item.entity_type) {
          case 'identity':
            dataStore.deleteIdentity(item.entity_id);
            break;
          case 'website':
            dataStore.deleteWebsite(item.entity_id);
            break;
          case 'card':
            dataStore.deleteCard(item.entity_id);
            break;
          case 'advertiser':
            dataStore.deleteAdvertiser(item.entity_id);
            break;
          case 'account':
            dataStore.deleteAccount(item.entity_id);
            break;
          case 'order':
            dataStore.deleteOrder(item.entity_id);
            break;
        }
      }

      addToast('success', 'Action reverted successfully');
    } catch {
      addToast('error', 'Failed to revert action');
    }
  };

  if (history.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Undo2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No actions to undo</p>
          <p className="text-sm text-gray-500 mt-2">
            Actions you perform will appear here and can be reverted
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-lg ${
                item.action === 'create'
                  ? 'bg-green-500/20 text-green-400'
                  : item.action === 'delete'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {actionIcons[item.action]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={actionColors[item.action]} size="sm">
                  {item.action.toUpperCase()}
                </Badge>
                <span className="text-gray-300 capitalize">{item.entity_type}</span>
              </div>
              <p className="text-gray-100 font-medium mt-1">{item.entity_name}</p>
              <p className="text-sm text-gray-500">{formatRelative(item.created_at)}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRevert(item.id)}
            leftIcon={<Undo2 className="w-4 h-4" />}
          >
            Undo
          </Button>
        </Card>
      ))}
    </div>
  );
}
