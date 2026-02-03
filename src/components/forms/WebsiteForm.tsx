'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useUndoStore } from '@/stores/undoStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Website } from '@/types';
import { websiteSchema, WebsiteFormData, validateForm } from '@/lib/utils/validation';
import { Globe, Lock, CheckSquare, Eye, EyeOff, Plus } from 'lucide-react';

interface WebsiteFormProps {
  website?: Website;
  onSuccess?: () => void;
}

export function WebsiteForm({ website, onSuccess }: WebsiteFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { platforms, addWebsite, updateWebsite } = useDataStore();
  const { addAction } = useUndoStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCpanelPassword, setShowCpanelPassword] = useState(false);
  const [showWebmailPassword, setShowWebmailPassword] = useState(false);
  const [manualPlatform, setManualPlatform] = useState('');

  const [formData, setFormData] = useState<WebsiteFormData>({
    name: website?.name || '',
    url: website?.url || '',
    website_type: website?.website_type || '',
    hosting_provider: website?.hosting_provider || '',
    platform_ids: website?.platform_ids || [],
    cpanel_url: website?.cpanel_url || '',
    cpanel_username: website?.cpanel_username || '',
    cpanel_password: website?.cpanel_password || '',
    webmail_email: website?.webmail_email || '',
    webmail_password: website?.webmail_password || '',
    identity_id: website?.identity_id || '',
    status: (website?.status as 'Active' | 'Inactive') || 'Active',
    notes: website?.notes || '',
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

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platform_ids: prev.platform_ids.includes(platformId)
        ? prev.platform_ids.filter((id) => id !== platformId)
        : [...prev.platform_ids, platformId],
    }));
  };

  const handleAddManualPlatform = () => {
    if (manualPlatform.trim()) {
      // For manual entries, we'll use the platform name as ID temporarily
      setFormData((prev) => ({
        ...prev,
        platform_ids: [...prev.platform_ids, `manual:${manualPlatform.trim()}`],
      }));
      setManualPlatform('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = validateForm(websiteSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (website) {
        const previousData = { ...website };
        const updated = await updateWebsite(website.id, result.data);

        if (updated) {
          addAction({
            user_id: user?.id || '',
            action: 'update',
            entity_type: 'website',
            entity_id: website.id,
            entity_name: website.name,
            previous_data: previousData as unknown as Record<string, unknown>,
            new_data: updated as unknown as Record<string, unknown>,
          });

          addToast('success', 'Website updated successfully');
          onSuccess?.();
          router.push('/master-data/websites');
        }
      } else {
        const newWebsite = await addWebsite({
          ...result.data,
          created_by: user?.id || '',
        });

        addAction({
          user_id: user?.id || '',
          action: 'create',
          entity_type: 'website',
          entity_id: newWebsite.id,
          entity_name: newWebsite.name,
          new_data: newWebsite as unknown as Record<string, unknown>,
        });

        addToast('success', 'Website created successfully');
        onSuccess?.();
        router.push('/master-data/websites');
      }
    } catch {
      addToast('error', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-blue-500">Basic Info</h3>
          </div>
          <div className="space-y-4">
            <Input
              label="Website Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="URL (Link)"
              name="url"
              value={formData.url}
              onChange={handleChange}
              error={errors.url}
              placeholder="https://..."
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Type (e.g. Blog)"
                name="website_type"
                value={formData.website_type}
                onChange={handleChange}
                error={errors.website_type}
              />
              <Input
                label="Hosting Provider"
                name="hosting_provider"
                value={formData.hosting_provider}
                onChange={handleChange}
                error={errors.hosting_provider}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Used On (Checkouts) */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-500">Used On (Checkouts)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.platform_ids.includes(platform.id)}
                  onChange={() => handlePlatformToggle(platform.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-300">{platform.name}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Manual Entry
            </label>
            <div className="flex gap-2">
              <Input
                name="manualPlatform"
                value={manualPlatform}
                onChange={(e) => setManualPlatform(e.target.value)}
                placeholder="Platform Name"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddManualPlatform}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-green-500">Credentials (cPanel & Email)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="cPanel URL"
            name="cpanel_url"
            value={formData.cpanel_url}
            onChange={handleChange}
            error={errors.cpanel_url}
          />
          <Input
            label="cPanel Username"
            name="cpanel_username"
            value={formData.cpanel_username}
            onChange={handleChange}
            error={errors.cpanel_username}
          />
          <div className="relative">
            <Input
              label="cPanel Password"
              name="cpanel_password"
              type={showCpanelPassword ? 'text' : 'password'}
              value={formData.cpanel_password}
              onChange={handleChange}
              error={errors.cpanel_password}
            />
            <button
              type="button"
              onClick={() => setShowCpanelPassword(!showCpanelPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
            >
              {showCpanelPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Webmail Email"
            name="webmail_email"
            type="email"
            value={formData.webmail_email}
            onChange={handleChange}
            error={errors.webmail_email}
          />
          <div className="relative">
            <Input
              label="Webmail Password"
              name="webmail_password"
              type={showWebmailPassword ? 'text' : 'password'}
              value={formData.webmail_password}
              onChange={handleChange}
              error={errors.webmail_password}
            />
            <button
              type="button"
              onClick={() => setShowWebmailPassword(!showWebmailPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
            >
              {showWebmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Traffic sources, specific plugins used, etc..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {website ? 'Update Website' : 'Add Website'}
        </Button>
      </div>
    </form>
  );
}
