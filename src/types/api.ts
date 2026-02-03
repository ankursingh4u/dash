// API request/response types

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  token?: string;
}

export interface CreateIdentityRequest {
  name: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  status?: string;
  notes?: string;
}

export interface UpdateIdentityRequest extends Partial<CreateIdentityRequest> {
  id: string;
}

export interface CreateWebsiteRequest {
  name: string;
  domain: string;
  niche?: string;
  platform_ids?: string[];
  identity_id?: string;
  status?: string;
  notes?: string;
}

export interface UpdateWebsiteRequest extends Partial<CreateWebsiteRequest> {
  id: string;
}

export interface CreateCardRequest {
  identity_id: string;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  card_holder: string;
  billing_address?: string;
  status?: string;
  notes?: string;
}

export interface UpdateCardRequest extends Partial<CreateCardRequest> {
  id: string;
}

export interface CreateAdvertiserRequest {
  platform_id: string;
  name: string;
  contact_email?: string;
  contact_name?: string;
  commission_rate?: number;
  payment_terms?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAdvertiserRequest extends Partial<CreateAdvertiserRequest> {
  id: string;
}

export interface CreateAccountRequest {
  platform_id: string;
  identity_id?: string;
  account_name: string;
  account_email: string;
  password?: string;
  affiliate_id?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  id: string;
}

export interface CreateOrderRequest {
  platform_id: string;
  account_id?: string;
  advertiser_id?: string;
  order_number: string;
  product_name?: string;
  amount: number;
  currency: string;
  commission?: number;
  status?: string;
  order_date: string;
  refund_reminder_date?: string;
  notes?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  id: string;
}

export interface OverviewStats {
  totalIdentities: number;
  activeIdentities: number;
  totalWebsites: number;
  activeWebsites: number;
  totalCards: number;
  activeCards: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  refundReminders: number;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  entity: string;
  filters?: Record<string, unknown>;
}
