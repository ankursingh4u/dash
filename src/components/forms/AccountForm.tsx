'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { PlatformAccount } from '@/types';
import { accountSchema, AccountFormData, validateForm } from '@/lib/utils/validation';

interface AccountFormProps {
  platformId: string;
  account?: PlatformAccount;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Pending', label: 'Pending' },
];

export function AccountForm({
  platformId,
  account,
  onSuccess,
  onCancel,
}: AccountFormProps) {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { identities, addAccount, updateAccount } = useDataStore();
  const { addAction } = useUndoStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AccountFormData>({
    platform_id: platformId,
    identity_id: account?.identity_id || '',
    account_name: account?.account_name || '',
    account_email: account?.account_email || '',
    password: '',
    affiliate_id: account?.affiliate_id || '',
    status: (account?.status as AccountFormData['status']) || 'Active',
    notes: account?.notes || '',
  });

  const identityOptions = identities.map((i) => ({
    value: i.id,
    label: `${i.name} (${i.email})`,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateForm(accountSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Remove password if empty (don't update password)
      const dataToSave = { ...result.data };
      if (!dataToSave.password) {
        delete dataToSave.password;
      }

      if (account) {
        const previousData = { ...account };
        const updated = updateAccount(account.id, {
          ...dataToSave,
          // If password was provided, store it encrypted (mock: store as-is)
          encrypted_password: dataToSave.password || account.encrypted_password,
        });

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'account',
            entity_id: account.id,
            entity_name: account.account_name,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Account updated successfully');
          onSuccess?.();
        }
      } else {
        const newAccount = addAccount({
          ...dataToSave,
          encrypted_password: dataToSave.password,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'account',
          entity_id: newAccount.id,
          entity_name: newAccount.account_name,
          new_data: newAccount as unknown as Record<string, unknown>,
        });

        addToast('success', 'Account created successfully');
        onSuccess?.();
      }
    } catch {
      addToast('error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Account Name"
          name="account_name"
          value={formData.account_name}
          onChange={handleChange}
          error={errors.account_name}
          required
        />

        <Input
          label="Account Email"
          name="account_email"
          type="email"
          value={formData.account_email}
          onChange={handleChange}
          error={errors.account_email}
          required
        />

        <PasswordInput
          label={account ? 'New Password (leave empty to keep current)' : 'Password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="Affiliate ID"
          name="affiliate_id"
          value={formData.affiliate_id}
          onChange={handleChange}
          error={errors.affiliate_id}
        />

        <Select
          label="Identity"
          name="identity_id"
          value={formData.identity_id}
          onChange={handleChange}
          options={[{ value: '', label: 'None' }, ...identityOptions]}
          error={errors.identity_id}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            error={errors.notes}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {account ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
}
