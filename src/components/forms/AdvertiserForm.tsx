'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Advertiser } from '@/types';
import { advertiserSchema, AdvertiserFormData, validateForm } from '@/lib/utils/validation';

interface AdvertiserFormProps {
  platformId: string;
  advertiser?: Advertiser;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Pending', label: 'Pending' },
];

export function AdvertiserForm({
  platformId,
  advertiser,
  onSuccess,
  onCancel,
}: AdvertiserFormProps) {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { addAdvertiser, updateAdvertiser } = useDataStore();
  const { addAction } = useUndoStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AdvertiserFormData>({
    platform_id: platformId,
    name: advertiser?.name || '',
    contact_email: advertiser?.contact_email || '',
    contact_name: advertiser?.contact_name || '',
    commission_rate: advertiser?.commission_rate || undefined,
    payment_terms: advertiser?.payment_terms || '',
    status: (advertiser?.status as AdvertiserFormData['status']) || 'Active',
    notes: advertiser?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' && value ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateForm(advertiserSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (advertiser) {
        const previousData = { ...advertiser };
        const updated = await updateAdvertiser(advertiser.id, result.data);

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'advertiser',
            entity_id: advertiser.id,
            entity_name: advertiser.name,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Advertiser updated successfully');
          onSuccess?.();
        }
      } else {
        const newAdvertiser = await addAdvertiser({
          ...result.data,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'advertiser',
          entity_id: newAdvertiser.id,
          entity_name: newAdvertiser.name,
          new_data: newAdvertiser as unknown as Record<string, unknown>,
        });

        addToast('success', 'Advertiser created successfully');
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
          label="Advertiser Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Contact Name"
          name="contact_name"
          value={formData.contact_name}
          onChange={handleChange}
          error={errors.contact_name}
        />

        <Input
          label="Contact Email"
          name="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={handleChange}
          error={errors.contact_email}
        />

        <Input
          label="Commission Rate (%)"
          name="commission_rate"
          type="number"
          value={formData.commission_rate || ''}
          onChange={handleChange}
          error={errors.commission_rate}
          min={0}
          max={100}
        />

        <Input
          label="Payment Terms"
          name="payment_terms"
          value={formData.payment_terms}
          onChange={handleChange}
          error={errors.payment_terms}
          placeholder="e.g., Net 30, Weekly"
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
          {advertiser ? 'Update Advertiser' : 'Add Advertiser'}
        </Button>
      </div>
    </form>
  );
}
