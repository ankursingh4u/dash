'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Identity, IdentityStatus } from '@/types';
import {
  identitySchema,
  IdentityFormData,
  validateForm,
} from '@/lib/utils/validation';
import { User, MapPin, FileText, Upload } from 'lucide-react';

interface IdentityFormProps {
  identity?: Identity;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Burned', label: 'Burned' },
  { value: 'Pending Docs', label: 'Pending Docs' },
];

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const idTypeOptions = [
  { value: 'Passport', label: 'Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'National ID', label: 'National ID' },
  { value: 'Other', label: 'Other' },
];

const countryOptions = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  { value: 'Other', label: 'Other' },
];

export function IdentityForm({ identity, onSuccess }: IdentityFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { addIdentity, updateIdentity } = useDataStore();
  const { addAction } = useUndoStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<IdentityFormData>({
    // Personal Details
    name: identity?.name || '',
    gender: identity?.gender,
    date_of_birth: identity?.date_of_birth || '',
    phone: identity?.phone || '',
    email: identity?.email || '',
    // Location
    street_address: identity?.street_address || '',
    city: identity?.city || '',
    state: identity?.state || '',
    zip_code: identity?.zip_code || '',
    country: identity?.country || '',
    // Tech & Docs
    id_type: identity?.id_type,
    id_expiry: identity?.id_expiry || '',
    proxy_ip: identity?.proxy_ip || '',
    browser_profile: identity?.browser_profile || '',
    // Other
    status: (identity?.status as IdentityStatus) || 'Active',
    notes: identity?.notes || '',
  });

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

    const result = validateForm(identitySchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (identity) {
        const previousData = { ...identity };
        const updated = await updateIdentity(identity.id, result.data);

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'identity',
            entity_id: identity.id,
            entity_name: identity.name,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Identity updated successfully');
          onSuccess?.();
          router.push('/master-data/identities');
        }
      } else {
        const newIdentity = await addIdentity({
          ...result.data,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'identity',
          entity_id: newIdentity.id,
          entity_name: newIdentity.name,
          new_data: newIdentity as unknown as Record<string, unknown>,
        });

        addToast('success', 'Identity created successfully');
        onSuccess?.();
        router.push('/master-data/identities');
      }
    } catch {
      addToast('error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Details Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-500">Personal Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            options={genderOptions}
            placeholder="Male/Female"
          />
          <Input
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            error={errors.date_of_birth}
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-green-500">Location</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Street Address"
            name="street_address"
            value={formData.street_address}
            onChange={handleChange}
            error={errors.street_address}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
            />
            <Input
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
            />
            <Input
              label="Zip/Postal Code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              error={errors.zip_code}
            />
            <Select
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
              error={errors.country}
              placeholder="Select country"
              required
            />
          </div>
        </div>
      </div>

      {/* Tech & Docs Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-blue-500">Tech & Docs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="ID Type"
            name="id_type"
            value={formData.id_type || ''}
            onChange={handleChange}
            options={idTypeOptions}
            placeholder="Passport / DL"
          />
          <Input
            label="ID Expiry"
            name="id_expiry"
            type="date"
            value={formData.id_expiry}
            onChange={handleChange}
            error={errors.id_expiry}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            error={errors.status}
          />
          <Input
            label="Proxy IP"
            name="proxy_ip"
            value={formData.proxy_ip}
            onChange={handleChange}
            error={errors.proxy_ip}
            placeholder="192.168.x.x"
          />
          <Input
            label="Browser Profile"
            name="browser_profile"
            value={formData.browser_profile}
            onChange={handleChange}
            error={errors.browser_profile}
            placeholder="Chrome Profile 1"
          />
        </div>
      </div>

      {/* Notes & Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Textarea
            label="Internal Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            error={errors.notes}
            placeholder="Add any specific details regarding this identity..."
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload ID Proofs
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Click to upload files</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {identity ? 'Update Identity' : 'Create Identity'}
        </Button>
      </div>
    </form>
  );
}
