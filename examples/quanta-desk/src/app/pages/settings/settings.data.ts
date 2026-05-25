export interface ApiKey {
  id: string;
  name: string;
  key: string;
  env: 'Production' | 'Staging' | 'Sandbox';
  lastUsed: string;
  created: string;
  scope: string;
}

export interface Invoice {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly amount: number;
  readonly status: 'paid' | 'pending' | 'failed';
}

export interface NotificationChannel {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

export const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'es-ES', label: 'Español' },
  { value: 'ja-JP', label: '日本語' },
] as const;

export const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
] as const;

export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  { id: 'trade-fills', label: 'Trade fills', description: 'When an order is filled or partially filled.', icon: 'pi pi-check-circle' },
  { id: 'rejects', label: 'Order rejects', description: 'Order rejected by exchange or risk system.', icon: 'pi pi-times-circle' },
  { id: 'price-alerts', label: 'Price alerts', description: 'Target / stop-loss triggers on watched instruments.', icon: 'pi pi-flag' },
  { id: 'margin', label: 'Margin events', description: 'Margin calls, maintenance breaches, buying-power changes.', icon: 'pi pi-shield' },
  { id: 'news', label: 'Material news', description: 'High-impact headlines for held or watched names.', icon: 'pi pi-megaphone' },
  { id: 'earnings', label: 'Earnings reminders', description: '48 hours before each earnings release.', icon: 'pi pi-calendar' },
];

export const API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production webhook', key: '4f8c-92a3-bf1d-7e2c', env: 'Production', lastUsed: '2 minutes ago', created: 'Jan 12, 2025', scope: 'read:trades, write:orders' },
  { id: 'k2', name: 'Reporting service', key: 'a1b2-c3d4-e5f6-7890', env: 'Production', lastUsed: '1 hour ago', created: 'Mar 04, 2025', scope: 'read:*' },
  { id: 'k3', name: 'Mobile app, staging', key: '11ee-22dd-33cc-44bb', env: 'Staging', lastUsed: '6 hours ago', created: 'Apr 18, 2025', scope: 'read:trades, read:holdings' },
  { id: 'k4', name: 'Local dev', key: 'aaaa-bbbb-cccc-dddd', env: 'Sandbox', lastUsed: '3 days ago', created: 'May 02, 2025', scope: 'read:*, write:*' },
];

export const INVOICES: readonly Invoice[] = [
  { id: 'inv-2025-05', date: 'May 01, 2025', description: 'Pro plan · monthly', amount: 49, status: 'paid' },
  { id: 'inv-2025-04', date: 'Apr 01, 2025', description: 'Pro plan · monthly', amount: 49, status: 'paid' },
  { id: 'inv-2025-03', date: 'Mar 01, 2025', description: 'Pro plan · monthly + overage', amount: 67.4, status: 'paid' },
  { id: 'inv-2025-02', date: 'Feb 01, 2025', description: 'Pro plan · monthly', amount: 49, status: 'paid' },
  { id: 'inv-2025-01', date: 'Jan 01, 2025', description: 'Pro plan · monthly', amount: 49, status: 'paid' },
  { id: 'inv-2024-12', date: 'Dec 01, 2024', description: 'Free trial → Pro upgrade', amount: 24.5, status: 'paid' },
];

export const USAGE = [
  { label: 'API calls', used: 184_320, max: 500_000, unit: '', color: 'var(--p-primary-color)' },
  { label: 'Storage', used: 12.4, max: 50, unit: 'GB', color: '#10b981' },
  { label: 'Webhook events', used: 8_421, max: 25_000, unit: '', color: '#f59e0b' },
  { label: 'Team seats', used: 7, max: 20, unit: '', color: '#ef4444' },
];
