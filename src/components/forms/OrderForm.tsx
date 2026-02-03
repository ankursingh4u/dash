'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Order } from '@/types';
import { orderSchema, OrderFormData, validateForm } from '@/lib/utils/validation';

interface OrderFormProps {
  platformId: string;
  order?: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
  { value: 'AUD', label: 'AUD' },
];

export function OrderForm({
  platformId,
  order,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const {
    getAccountsByPlatform,
    getAdvertisersByPlatform,
    addOrder,
    updateOrder,
  } = useDataStore();
  const { addAction } = useUndoStore();

  const accounts = getAccountsByPlatform(platformId);
  const advertisers = getAdvertisersByPlatform(platformId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OrderFormData>({
    platform_id: platformId,
    account_id: order?.account_id || '',
    advertiser_id: order?.advertiser_id || '',
    order_number: order?.order_number || '',
    product_name: order?.product_name || '',
    amount: order?.amount || 0,
    currency: order?.currency || 'USD',
    commission: order?.commission || undefined,
    status: (order?.status as OrderFormData['status']) || 'Pending',
    order_date: order?.order_date
      ? new Date(order.order_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    refund_reminder_date: order?.refund_reminder_date
      ? new Date(order.refund_reminder_date).toISOString().split('T')[0]
      : '',
    notes: order?.notes || '',
  });

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.account_name} (${a.account_email})`,
  }));

  const advertiserOptions = advertisers.map((a) => ({
    value: a.id,
    label: a.name,
  }));

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

    const result = validateForm(orderSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (order) {
        const previousData = { ...order };
        const updated = await updateOrder(order.id, {
          ...result.data,
          order_date: new Date(result.data.order_date).toISOString(),
          refund_reminder_date: result.data.refund_reminder_date
            ? new Date(result.data.refund_reminder_date).toISOString()
            : undefined,
        });

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'order',
            entity_id: order.id,
            entity_name: order.order_number,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Order updated successfully');
          onSuccess?.();
        }
      } else {
        const newOrder = await addOrder({
          ...result.data,
          order_date: new Date(result.data.order_date).toISOString(),
          refund_reminder_date: result.data.refund_reminder_date
            ? new Date(result.data.refund_reminder_date).toISOString()
            : undefined,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'order',
          entity_id: newOrder.id,
          entity_name: newOrder.order_number,
          new_data: newOrder as unknown as Record<string, unknown>,
        });

        addToast('success', 'Order created successfully');
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
          label="Order Number"
          name="order_number"
          value={formData.order_number}
          onChange={handleChange}
          error={errors.order_number}
          required
        />

        <Input
          label="Product Name"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          error={errors.product_name}
        />

        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          required
        />

        <Select
          label="Currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={currencyOptions}
          error={errors.currency}
        />

        <Input
          label="Commission"
          name="commission"
          type="number"
          step="0.01"
          value={formData.commission || ''}
          onChange={handleChange}
          error={errors.commission}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
        />

        <Select
          label="Account"
          name="account_id"
          value={formData.account_id}
          onChange={handleChange}
          options={[{ value: '', label: 'None' }, ...accountOptions]}
          error={errors.account_id}
        />

        <Select
          label="Advertiser"
          name="advertiser_id"
          value={formData.advertiser_id}
          onChange={handleChange}
          options={[{ value: '', label: 'None' }, ...advertiserOptions]}
          error={errors.advertiser_id}
        />

        <Input
          label="Order Date"
          name="order_date"
          type="date"
          value={formData.order_date}
          onChange={handleChange}
          error={errors.order_date}
          required
        />

        <Input
          label="Refund Reminder Date"
          name="refund_reminder_date"
          type="date"
          value={formData.refund_reminder_date}
          onChange={handleChange}
          error={errors.refund_reminder_date}
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
          {order ? 'Update Order' : 'Add Order'}
        </Button>
      </div>
    </form>
  );
}
