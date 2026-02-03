import Papa from 'papaparse';
import { Identity, Website, Card, Advertiser, PlatformAccount, Order } from '@/types';

type ExportableEntity = Identity | Website | Card | Advertiser | PlatformAccount | Order;

interface ExportConfig {
  filename: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: { key: string; label: string; transform?: (value: any, row: any) => string }[];
}

// Field configurations for each entity type
const identityConfig: ExportConfig = {
  filename: 'identities',
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'country', label: 'Country' },
    { key: 'address', label: 'Address' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
  ],
};

const websiteConfig: ExportConfig = {
  filename: 'websites',
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'url', label: 'URL' },
    { key: 'website_type', label: 'Type' },
    { key: 'hosting_provider', label: 'Hosting Provider' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
  ],
};

const cardConfig: ExportConfig = {
  filename: 'cards',
  fields: [
    { key: 'card_holder', label: 'Card Holder' },
    { key: 'card_type', label: 'Card Type' },
    { key: 'last_four', label: 'Last Four' },
    {
      key: 'expiry',
      label: 'Expiry',
      transform: (_, row) =>
        `${String(row.expiry_month).padStart(2, '0')}/${row.expiry_year}`,
    },
    { key: 'billing_address', label: 'Billing Address' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
  ],
};

const advertiserConfig: ExportConfig = {
  filename: 'advertisers',
  fields: [
    { key: 'name', label: 'Name' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'contact_name', label: 'Contact Name' },
    {
      key: 'commission_rate',
      label: 'Commission Rate',
      transform: (value) => (value ? `${value}%` : ''),
    },
    { key: 'payment_terms', label: 'Payment Terms' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
  ],
};

const accountConfig: ExportConfig = {
  filename: 'accounts',
  fields: [
    { key: 'account_name', label: 'Account Name' },
    { key: 'account_email', label: 'Account Email' },
    { key: 'affiliate_id', label: 'Affiliate ID' },
    { key: 'status', label: 'Status' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
    // Note: Never export passwords
  ],
};

const orderConfig: ExportConfig = {
  filename: 'orders',
  fields: [
    { key: 'order_number', label: 'Order Number' },
    { key: 'product_name', label: 'Product Name' },
    {
      key: 'amount',
      label: 'Amount',
      transform: (value, row) => `${row.currency} ${value}`,
    },
    { key: 'commission', label: 'Commission' },
    { key: 'status', label: 'Status' },
    { key: 'order_date', label: 'Order Date' },
    { key: 'refund_reminder_date', label: 'Refund Reminder' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Created At' },
  ],
};

function transformData(
  data: ExportableEntity[],
  config: ExportConfig
): Record<string, string>[] {
  return data.map((item) => {
    const row: Record<string, string> = {};
    config.fields.forEach(({ key, label, transform }) => {
      const value = (item as unknown as Record<string, unknown>)[key];
      row[label] = transform ? transform(value, item) : String(value ?? '');
    });
    return row;
  });
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportIdentities(data: Identity[]): void {
  const transformed = transformData(data, identityConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, identityConfig.filename);
}

export function exportWebsites(data: Website[]): void {
  const transformed = transformData(data, websiteConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, websiteConfig.filename);
}

export function exportCards(data: Card[]): void {
  const transformed = transformData(data, cardConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, cardConfig.filename);
}

export function exportAdvertisers(data: Advertiser[]): void {
  const transformed = transformData(data, advertiserConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, advertiserConfig.filename);
}

export function exportAccounts(data: PlatformAccount[]): void {
  const transformed = transformData(data, accountConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, accountConfig.filename);
}

export function exportOrders(data: Order[]): void {
  const transformed = transformData(data, orderConfig);
  const csv = Papa.unparse(transformed);
  downloadCSV(csv, orderConfig.filename);
}

// Combined master data export
export function exportMasterData(
  identities: Identity[],
  websites: Website[],
  cards: Card[]
): void {
  // Export each as separate CSV
  if (identities.length > 0) exportIdentities(identities);
  if (websites.length > 0) exportWebsites(websites);
  if (cards.length > 0) exportCards(cards);
}

// Platform data export
export function exportPlatformData(
  platformSlug: string,
  advertisers: Advertiser[],
  accounts: PlatformAccount[],
  orders: Order[]
): void {
  if (advertisers.length > 0) {
    const transformed = transformData(advertisers, advertiserConfig);
    const csv = Papa.unparse(transformed);
    downloadCSV(csv, `${platformSlug}_advertisers`);
  }

  if (accounts.length > 0) {
    const transformed = transformData(accounts, accountConfig);
    const csv = Papa.unparse(transformed);
    downloadCSV(csv, `${platformSlug}_accounts`);
  }

  if (orders.length > 0) {
    const transformed = transformData(orders, orderConfig);
    const csv = Papa.unparse(transformed);
    downloadCSV(csv, `${platformSlug}_orders`);
  }
}
