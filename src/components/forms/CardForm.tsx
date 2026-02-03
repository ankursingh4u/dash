'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/types';
import { cardSchema, CardFormData, validateForm } from '@/lib/utils/validation';
import { CreditCard, User, MapPin, FileText } from 'lucide-react';

interface CardFormProps {
  card?: Card;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const cardTypeOptions = [
  { value: 'Credit', label: 'Credit Card' },
  { value: 'Debit', label: 'Debit Card' },
  { value: 'Prepaid', label: 'Prepaid Card' },
  { value: 'Virtual', label: 'Virtual Card' },
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Blocked', label: 'Blocked' },
];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1).padStart(2, '0'),
}));

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

export function CardForm({ card, onSuccess, onCancel }: CardFormProps) {
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { identities, addCard, updateCard } = useDataStore();
  const { addAction } = useUndoStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CardFormData>({
    identity_id: card?.identity_id || '',
    card_type: (card?.card_type as CardFormData['card_type']) || 'Credit',
    last_four: card?.last_four || '',
    expiry_month: card?.expiry_month || 1,
    expiry_year: card?.expiry_year || currentYear,
    card_holder: card?.card_holder || '',
    billing_address: card?.billing_address || '',
    status: (card?.status as CardFormData['status']) || 'Active',
    notes: card?.notes || '',
  });

  const identityOptions = identities.map((i) => ({
    value: i.id,
    label: `${i.name} (${i.email})`,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateForm(cardSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (card) {
        const previousData = { ...card };
        const updated = await updateCard(card.id, result.data);

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'card',
            entity_id: card.id,
            entity_name: `****${card.last_four}`,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Card updated successfully');
          onSuccess?.();
        }
      } else {
        const newCard = await addCard({
          ...result.data,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'card',
          entity_id: newCard.id,
          entity_name: `****${newCard.last_four}`,
          new_data: newCard as unknown as Record<string, unknown>,
        });

        addToast('success', 'Card created successfully');
        onSuccess?.();
      }
    } catch {
      addToast('error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Details Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-purple-500">Card Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Card Type"
            name="card_type"
            value={formData.card_type}
            onChange={handleChange}
            options={cardTypeOptions}
            error={errors.card_type}
          />
          <Input
            label="Last 4 Digits"
            name="last_four"
            value={formData.last_four}
            onChange={handleChange}
            error={errors.last_four}
            maxLength={4}
            placeholder="1234"
            required
          />
          <Select
            label="Expiry Month"
            name="expiry_month"
            value={String(formData.expiry_month)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiry_month: Number(e.target.value),
              }))
            }
            options={monthOptions}
            error={errors.expiry_month}
          />
          <Select
            label="Expiry Year"
            name="expiry_year"
            value={String(formData.expiry_year)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiry_year: Number(e.target.value),
              }))
            }
            options={yearOptions}
            error={errors.expiry_year}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Card Holder Name"
            name="card_holder"
            value={formData.card_holder}
            onChange={handleChange}
            error={errors.card_holder}
            placeholder="JOHN DOE"
            required
          />
        </div>
      </div>

      {/* Identity & Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-blue-500">Linked Identity</h3>
          </div>
          <Select
            label="Identity"
            name="identity_id"
            value={formData.identity_id}
            onChange={handleChange}
            options={identityOptions}
            error={errors.identity_id}
            placeholder="Select identity"
            required
          />
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-500">Status</h3>
          </div>
          <Select
            label="Card Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
          />
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-green-500">Billing Address</h3>
        </div>
        <Input
          label="Full Billing Address"
          name="billing_address"
          value={formData.billing_address}
          onChange={handleChange}
          error={errors.billing_address}
          placeholder="123 Main St, City, State, ZIP, Country"
        />
      </div>

      {/* Notes Section */}
      <div>
        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Additional notes about this card..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {card ? 'Update Card' : 'Add Card'}
        </Button>
      </div>
    </form>
  );
}
