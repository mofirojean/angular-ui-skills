export interface NotificationCategory {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = [
  { id: 'replies', label: 'Assistant replies', description: 'When a streaming response finishes in a tab you have minimised.' },
  { id: 'shares', label: 'Shared conversations', description: 'When someone opens a conversation you shared with them.' },
  { id: 'projects', label: 'Project updates', description: 'New files added by collaborators, instruction changes.' },
  { id: 'product', label: 'Product updates', description: 'New models, features, and changelog highlights.' },
  { id: 'billing', label: 'Billing', description: 'Receipts, plan changes, and renewals.' },
];

export const NOTIFICATION_CHANNELS: readonly { id: string; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobile' },
];

export interface ApiKeyRow {
  readonly id: string;
  readonly name: string;
  readonly prefix: string;
  readonly created: string;
  readonly lastUsed: string;
}

export const API_KEYS: readonly ApiKeyRow[] = [
  { id: 'k-001', name: 'Personal laptop', prefix: 'sk-apex-prod-2y9k', created: 'Jan 14, 2026', lastUsed: '2 hours ago' },
  { id: 'k-002', name: 'CI / GitHub Actions', prefix: 'sk-apex-prod-9f4w', created: 'Jan 02, 2026', lastUsed: '4 minutes ago' },
  { id: 'k-003', name: 'Old script - rotate', prefix: 'sk-apex-prod-7q2b', created: 'Nov 28, 2025', lastUsed: '3 weeks ago' },
];
