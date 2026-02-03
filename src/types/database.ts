// Database types matching Supabase schema

export type UserRole = 'system_admin' | 'admin' | 'user';
export type IdentityStatus = 'Active' | 'Burned' | 'Pending Docs';
export type CardStatus = 'Active' | 'Expired' | 'Blocked';
export type AccountStatus = 'Active' | 'Suspended' | 'Pending';
export type OrderStatus = 'Pending' | 'Completed' | 'Refunded' | 'Cancelled';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type Gender = 'Male' | 'Female' | 'Other';
export type IDType = 'Passport' | 'Driving License' | 'National ID' | 'Other';

export interface Identity {
  id: string;
  // Personal Details
  name: string;
  gender?: Gender;
  date_of_birth?: string;
  phone?: string;
  email: string;
  // Location
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  // Tech & Docs
  id_type?: IDType;
  id_expiry?: string;
  proxy_ip?: string;
  browser_profile?: string;
  // Other
  status: IdentityStatus;
  documents?: DocumentFile[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface Website {
  id: string;
  // Basic Info
  name: string;
  url: string;
  website_type?: string;
  hosting_provider?: string;
  // Used On (Checkouts)
  platform_ids: string[];
  // Credentials
  cpanel_url?: string;
  cpanel_username?: string;
  cpanel_password?: string;
  webmail_email?: string;
  webmail_password?: string;
  // Other
  identity_id?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website_url: string;
  description?: string;
  created_at: string;
}

export interface WebsitePlatform {
  id: string;
  website_id: string;
  platform_id: string;
  created_at: string;
}

export interface Card {
  id: string;
  identity_id: string;
  card_type: 'Credit' | 'Debit' | 'Prepaid' | 'Virtual';
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  card_holder: string;
  billing_address?: string;
  status: CardStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Advertiser {
  id: string;
  platform_id: string;
  name: string;
  contact_email?: string;
  contact_name?: string;
  commission_rate?: number;
  payment_terms?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PlatformAccount {
  id: string;
  platform_id: string;
  identity_id?: string;
  account_name: string;
  account_email: string;
  encrypted_password?: string;
  affiliate_id?: string;
  status: AccountStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Order {
  id: string;
  platform_id: string;
  account_id?: string;
  advertiser_id?: string;
  order_number: string;
  product_name?: string;
  amount: number;
  currency: string;
  commission?: number;
  status: OrderStatus;
  order_date: string;
  refund_reminder_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UndoHistoryItem {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  entity_type: 'identity' | 'website' | 'card' | 'advertiser' | 'account' | 'order';
  entity_id: string;
  entity_name: string;
  previous_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  created_at: string;
  reverted_at?: string;
}
