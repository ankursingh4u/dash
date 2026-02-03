import { z } from 'zod';

// Identity validation
export const identitySchema = z.object({
  // Personal Details
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  // Location
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  // Tech & Docs
  id_type: z.enum(['Passport', 'Driving License', 'National ID', 'Other']).optional(),
  id_expiry: z.string().optional(),
  proxy_ip: z.string().optional(),
  browser_profile: z.string().optional(),
  // Other
  status: z.enum(['Active', 'Burned', 'Pending Docs']).default('Active'),
  notes: z.string().optional(),
});

export type IdentityFormData = z.infer<typeof identitySchema>;

// Website validation
export const websiteSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  url: z.string().min(4, 'URL is required'),
  website_type: z.string().optional(),
  hosting_provider: z.string().optional(),
  // Used On (Checkouts)
  platform_ids: z.array(z.string()).default([]),
  // Credentials
  cpanel_url: z.string().optional(),
  cpanel_username: z.string().optional(),
  cpanel_password: z.string().optional(),
  webmail_email: z.string().optional(),
  webmail_password: z.string().optional(),
  // Other
  identity_id: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  notes: z.string().optional(),
});

export type WebsiteFormData = z.infer<typeof websiteSchema>;

// Card validation
export const cardSchema = z.object({
  identity_id: z.string().min(1, 'Identity is required'),
  card_type: z.enum(['Credit', 'Debit', 'Prepaid', 'Virtual']),
  last_four: z
    .string()
    .length(4, 'Last four digits must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Must be 4 digits'),
  expiry_month: z.number().min(1).max(12),
  expiry_year: z.number().min(new Date().getFullYear()),
  card_holder: z.string().min(2, 'Card holder name is required'),
  billing_address: z.string().optional(),
  status: z.enum(['Active', 'Expired', 'Blocked']).default('Active'),
  notes: z.string().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;

// Advertiser validation
export const advertiserSchema = z.object({
  platform_id: z.string().min(1, 'Platform is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_name: z.string().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  payment_terms: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Pending']).default('Active'),
  notes: z.string().optional(),
});

export type AdvertiserFormData = z.infer<typeof advertiserSchema>;

// Platform Account validation
export const accountSchema = z.object({
  platform_id: z.string().min(1, 'Platform is required'),
  identity_id: z.string().optional(),
  account_name: z.string().min(2, 'Account name is required'),
  account_email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  affiliate_id: z.string().optional(),
  status: z.enum(['Active', 'Suspended', 'Pending']).default('Active'),
  notes: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// Order validation
export const orderSchema = z.object({
  platform_id: z.string().min(1, 'Platform is required'),
  account_id: z.string().optional(),
  advertiser_id: z.string().optional(),
  order_number: z.string().min(1, 'Order number is required'),
  product_name: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('USD'),
  commission: z.number().min(0).optional(),
  status: z.enum(['Pending', 'Completed', 'Refunded', 'Cancelled']).default('Pending'),
  order_date: z.string().min(1, 'Order date is required'),
  refund_reminder_date: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Helper function to validate and return errors
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}
