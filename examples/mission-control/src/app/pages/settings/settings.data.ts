import { Integration, InvoiceEntry, NotificationGroup, TeamMember } from './settings.model';

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { id: 'u-mj', name: 'Mofiro Jean', email: 'mofiro@example.com', initials: 'MJ', role: 'owner', lastActive: 'now', joined: 'Jan 12' },
  { id: 'u-sc', name: 'Sarah Chen', email: 'sarah@example.com', initials: 'SC', role: 'admin', lastActive: '2m ago', joined: 'Feb 04' },
  { id: 'u-ml', name: 'Marcus Lee', email: 'marcus@example.com', initials: 'ML', role: 'admin', lastActive: '12m ago', joined: 'Feb 21' },
  { id: 'u-ap', name: 'Ayana Patel', email: 'ayana@example.com', initials: 'AP', role: 'editor', lastActive: '1h ago', joined: 'Mar 02' },
  { id: 'u-lt', name: 'Leo Tanaka', email: 'leo@example.com', initials: 'LT', role: 'editor', lastActive: '4h ago', joined: 'Mar 14' },
  { id: 'u-nm', name: 'Nia Martin', email: 'nia@example.com', initials: 'NM', role: 'viewer', lastActive: '2d ago', joined: 'Apr 08' },
  { id: 'u-ok', name: 'Otis Kim', email: 'otis@example.com', initials: 'OK', role: 'viewer', lastActive: '7d ago', joined: 'Apr 19' },
];

export const INTEGRATIONS: readonly Integration[] = [
  { id: 'int-slack', name: 'Slack', description: 'Post run summaries and alerts to your channels.', icon: 'lucideMessageSquare', connected: true, category: 'communication', accountLabel: 'acme.slack.com' },
  { id: 'int-github', name: 'GitHub', description: 'Trigger agents from PR comments and issue events.', icon: 'lucideGithub', connected: true, category: 'developer', accountLabel: 'mofirojean/angular-ui-skills' },
  { id: 'int-linear', name: 'Linear', description: 'Create issues from failed runs automatically.', icon: 'lucideZap', connected: true, category: 'productivity', accountLabel: 'Acme · ENG' },
  { id: 'int-notion', name: 'Notion', description: 'Push standup digests and meeting notes to a database.', icon: 'lucideBookOpen', connected: false, category: 'productivity' },
  { id: 'int-stripe', name: 'Stripe', description: 'Reconcile payouts and run finance agents.', icon: 'lucideCircleDollarSign', connected: true, category: 'finance', accountLabel: 'acct_1Nh***' },
  { id: 'int-s3', name: 'AWS S3', description: 'Read and write artifacts from S3 buckets.', icon: 'lucideDatabase', connected: false, category: 'storage' },
  { id: 'int-postgres', name: 'Postgres', description: 'Direct database access for sync and lookup agents.', icon: 'lucideDatabase', connected: true, category: 'storage', accountLabel: 'prod-leads-db' },
  { id: 'int-zoom', name: 'Zoom', description: 'Capture transcripts from recorded meetings.', icon: 'lucideMessageCircle', connected: false, category: 'communication' },
];

export const INVOICE_HISTORY: readonly InvoiceEntry[] = [
  { id: 'inv-2026-05', date: 'May 01, 2026', description: 'Pro plan · monthly', amount: 49.00, status: 'paid' },
  { id: 'inv-2026-04', date: 'Apr 01, 2026', description: 'Pro plan · monthly', amount: 49.00, status: 'paid' },
  { id: 'inv-2026-03', date: 'Mar 01, 2026', description: 'Pro plan · monthly', amount: 49.00, status: 'paid' },
  { id: 'inv-2026-02', date: 'Feb 01, 2026', description: 'Pro plan · monthly + overage', amount: 67.40, status: 'paid' },
  { id: 'inv-2026-01', date: 'Jan 01, 2026', description: 'Pro plan · monthly', amount: 49.00, status: 'paid' },
  { id: 'inv-2025-12', date: 'Dec 01, 2025', description: 'Free trial → Pro upgrade', amount: 24.50, status: 'paid' },
];

export const NOTIFICATION_GROUPS: readonly NotificationGroup[] = [
  { id: 'n-failures', label: 'Run failures', description: 'When any agent run fails or retries exhaust.', icon: 'lucideCircleX' },
  { id: 'n-digest', label: 'Daily digest', description: 'A summary of yesterday\'s runs, sent at 09:00.', icon: 'lucideMail' },
  { id: 'n-quota', label: 'Quota warnings', description: 'Heads-up at 80% of monthly run quota.', icon: 'lucideTriangleAlert' },
  { id: 'n-activity', label: 'Team activity', description: 'Agents created, deleted, or permissions changed.', icon: 'lucideUsers' },
  { id: 'n-product', label: 'Product updates', description: 'New features, changelog, occasional tips.', icon: 'lucideSparkles' },
];

export const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'es-ES', label: 'Español' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
] as const;

export const TIMEZONES = [
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (UTC+3)' },
] as const;
