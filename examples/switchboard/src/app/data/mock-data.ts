export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved';
export type AnnouncementCategory = 'product' | 'process' | 'incident' | 'team';

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly online: boolean;
  readonly loadPct: number;
  readonly resolvedThisWeek: number;
  readonly avgResponseMinutes: number;
}

export interface Ticket {
  readonly id: string;
  readonly subject: string;
  readonly customer: string;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  readonly assigneeId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly slaDueAt: Date;
  readonly tags: readonly string[];
}

export interface Announcement {
  readonly id: string;
  readonly title: string;
  readonly category: AnnouncementCategory;
  readonly body: string;
  readonly publishedAt: Date;
}

export interface DailyVolume {
  readonly day: string;
  readonly opened: number;
  readonly resolved: number;
}

const NOW = new Date();
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);
const hoursAgo = (h: number) => minutesAgo(h * 60);
const hoursAhead = (h: number) => new Date(NOW.getTime() + h * 60 * 60_000);

export const AGENTS: readonly Agent[] = [
  { id: 'a-001', name: 'Kasun Perera', initials: 'KP', role: 'Senior Agent', online: true, loadPct: 78, resolvedThisWeek: 42, avgResponseMinutes: 6 },
  { id: 'a-002', name: 'Maya Chen', initials: 'MC', role: 'Senior Agent', online: true, loadPct: 64, resolvedThisWeek: 38, avgResponseMinutes: 9 },
  { id: 'a-003', name: 'Joren Bell', initials: 'JB', role: 'Agent', online: true, loadPct: 41, resolvedThisWeek: 27, avgResponseMinutes: 11 },
  { id: 'a-004', name: 'Aisha Karim', initials: 'AK', role: 'Agent', online: true, loadPct: 55, resolvedThisWeek: 31, avgResponseMinutes: 8 },
  { id: 'a-005', name: 'Diego Salas', initials: 'DS', role: 'Agent', online: false, loadPct: 0, resolvedThisWeek: 22, avgResponseMinutes: 12 },
  { id: 'a-006', name: 'Priya Rao', initials: 'PR', role: 'Tier 2', online: true, loadPct: 88, resolvedThisWeek: 19, avgResponseMinutes: 18 },
  { id: 'a-007', name: 'Tomas Holm', initials: 'TH', role: 'Tier 2', online: false, loadPct: 0, resolvedThisWeek: 24, avgResponseMinutes: 21 },
  { id: 'a-008', name: 'Lena Voss', initials: 'LV', role: 'Lead', online: true, loadPct: 32, resolvedThisWeek: 15, avgResponseMinutes: 4 },
];

export const TICKETS: readonly Ticket[] = [
  { id: 'T-2071', subject: 'Invoice export to CSV is empty for May', customer: 'Northwind Logistics', priority: 'high', status: 'open', assigneeId: null, createdAt: minutesAgo(14), updatedAt: minutesAgo(14), slaDueAt: hoursAhead(3), tags: ['billing', 'export'] },
  { id: 'T-2070', subject: 'SSO login redirects in a loop on Edge', customer: 'Hexa Robotics', priority: 'urgent', status: 'in-progress', assigneeId: 'a-001', createdAt: hoursAgo(1), updatedAt: minutesAgo(22), slaDueAt: hoursAhead(1), tags: ['auth', 'sso'] },
  { id: 'T-2069', subject: 'Webhook delivery delayed by ~40 minutes', customer: 'Aperture Labs', priority: 'high', status: 'waiting', assigneeId: 'a-002', createdAt: hoursAgo(3), updatedAt: hoursAgo(1), slaDueAt: hoursAhead(5), tags: ['api', 'webhook'] },
  { id: 'T-2068', subject: 'Onboarding flow stuck on team-invite step', customer: 'Quanta Studios', priority: 'normal', status: 'open', assigneeId: null, createdAt: hoursAgo(2), updatedAt: hoursAgo(2), slaDueAt: hoursAhead(22), tags: ['onboarding'] },
  { id: 'T-2067', subject: 'API rate limit headers are missing on /v2/users', customer: 'Lighthouse Co', priority: 'normal', status: 'in-progress', assigneeId: 'a-003', createdAt: hoursAgo(5), updatedAt: hoursAgo(3), slaDueAt: hoursAhead(19), tags: ['api'] },
  { id: 'T-2066', subject: 'Export to PDF crashes on large reports', customer: 'Northwind Logistics', priority: 'high', status: 'open', assigneeId: null, createdAt: hoursAgo(6), updatedAt: hoursAgo(6), slaDueAt: hoursAhead(18), tags: ['export', 'reports'] },
  { id: 'T-2065', subject: 'Two-factor enrollment QR not scannable', customer: 'Hexa Robotics', priority: 'normal', status: 'resolved', assigneeId: 'a-004', createdAt: hoursAgo(8), updatedAt: hoursAgo(2), slaDueAt: hoursAhead(16), tags: ['auth', '2fa'] },
  { id: 'T-2064', subject: 'Custom domain SSL certificate failed to renew', customer: 'Aperture Labs', priority: 'urgent', status: 'in-progress', assigneeId: 'a-001', createdAt: hoursAgo(12), updatedAt: minutesAgo(45), slaDueAt: hoursAhead(2), tags: ['hosting', 'ssl'] },
  { id: 'T-2063', subject: 'Billing receipt email not sent', customer: 'Quanta Studios', priority: 'low', status: 'waiting', assigneeId: 'a-006', createdAt: hoursAgo(14), updatedAt: hoursAgo(10), slaDueAt: hoursAhead(34), tags: ['billing'] },
  { id: 'T-2062', subject: 'Workspace transfer button is greyed out', customer: 'Lighthouse Co', priority: 'normal', status: 'resolved', assigneeId: 'a-002', createdAt: hoursAgo(20), updatedAt: hoursAgo(5), slaDueAt: hoursAhead(4), tags: ['workspace'] },
];

export const ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'an-1',
    title: 'New macro library for refund flows',
    category: 'product',
    body: 'Pre-built reply templates for the seven most-requested refund scenarios are now in Settings → Automations → Macros.',
    publishedAt: hoursAgo(6),
  },
  {
    id: 'an-2',
    title: 'Tier 2 escalation SLA bumped to 4 hours',
    category: 'process',
    body: 'Effective today, the Tier 2 SLA window is 4h on weekdays and 6h on weekends. Existing tickets keep their original SLA.',
    publishedAt: hoursAgo(22),
  },
  {
    id: 'an-3',
    title: 'Incident, intermittent webhook delays resolved',
    category: 'incident',
    body: 'A queue backlog earlier today caused webhook delivery delays of up to 40 minutes for some customers. Fully drained at 14:20.',
    publishedAt: hoursAgo(34),
  },
  {
    id: 'an-4',
    title: 'Welcome to Lena, our new agent lead',
    category: 'team',
    body: 'Lena Voss joins us as agent lead, focused on quality and coaching across all three tiers.',
    publishedAt: hoursAgo(54),
  },
];

// 14 days of fake volume, recent day last. Numbers drift around a moving baseline so the
// sparkline feels plausible without looking suspiciously smooth.
const VOLUME_SOURCE = [
  [28, 24], [31, 27], [29, 30], [34, 26], [42, 33], [38, 41], [25, 36],
  [22, 28], [33, 24], [40, 31], [44, 38], [37, 42], [30, 39], [33, 35],
];

export const VOLUME: readonly DailyVolume[] = VOLUME_SOURCE.map(([opened, resolved], i) => {
  const d = new Date(NOW.getTime() - (VOLUME_SOURCE.length - 1 - i) * 24 * 60 * 60_000);
  return {
    day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    opened,
    resolved,
  };
});

// --- Helpers consumed by the dashboard ---

export function isToday(d: Date): boolean {
  const a = new Date();
  return d.getFullYear() === a.getFullYear() && d.getMonth() === a.getMonth() && d.getDate() === a.getDate();
}

export function relativeTime(d: Date): string {
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86_400)}d ago`;
}

export function formatSlaRemaining(due: Date): { text: string; breached: boolean } {
  const diffMs = due.getTime() - Date.now();
  const breached = diffMs <= 0;
  const totalMinutes = Math.floor(Math.abs(diffMs) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { text: breached ? `Overdue by ${label}` : `${label} left`, breached };
}
