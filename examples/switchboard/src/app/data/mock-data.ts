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

export type MessageAuthor = 'customer' | { agentId: string };

export interface Message {
  readonly id: string;
  readonly ticketId: string;
  readonly author: MessageAuthor;
  readonly authorName: string;
  readonly initials: string;
  readonly body: string;
  readonly createdAt: Date;
  readonly attachments?: readonly { name: string; size: string }[];
}

export type ActivityKind =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'replied'
  | 'status-change'
  | 'priority-change'
  | 'tag-added'
  | 'sla-warning'
  | 'resolved';

export interface ActivityEvent {
  readonly id: string;
  readonly ticketId: string;
  readonly kind: ActivityKind;
  readonly actor: string;
  readonly description: string;
  readonly createdAt: Date;
}

export interface KbArticle {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly readMinutes: number;
}

const NOW = new Date();
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);
const hoursAgo = (h: number) => minutesAgo(h * 60);
const hoursAhead = (h: number) => new Date(NOW.getTime() + h * 60 * 60_000);

export const AGENTS: readonly Agent[] = [
  { id: 'a-001', name: 'Mofiro Jean', initials: 'MJ', role: 'Senior Agent', online: true, loadPct: 78, resolvedThisWeek: 42, avgResponseMinutes: 6 },
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
  { id: 'T-2061', subject: 'Slack integration disconnects every few hours', customer: 'Aurora Health', priority: 'high', status: 'in-progress', assigneeId: 'a-003', createdAt: hoursAgo(22), updatedAt: hoursAgo(4), slaDueAt: hoursAhead(2), tags: ['integration', 'slack'] },
  { id: 'T-2060', subject: 'Search returns stale results after sync', customer: 'Pulse Media', priority: 'normal', status: 'open', assigneeId: null, createdAt: hoursAgo(26), updatedAt: hoursAgo(26), slaDueAt: hoursAhead(-2), tags: ['search'] },
  { id: 'T-2059', subject: 'Date picker locale ignored on French portal', customer: 'Verdant Foods', priority: 'low', status: 'open', assigneeId: null, createdAt: hoursAgo(28), updatedAt: hoursAgo(28), slaDueAt: hoursAhead(20), tags: ['i18n', 'ui'] },
  { id: 'T-2058', subject: 'Workspace logo upload fails on PNG over 2 MB', customer: 'Hexa Robotics', priority: 'normal', status: 'in-progress', assigneeId: 'a-004', createdAt: hoursAgo(30), updatedAt: hoursAgo(8), slaDueAt: hoursAhead(18), tags: ['upload', 'ui'] },
  { id: 'T-2057', subject: 'Plan downgrade keeps old seat count active', customer: 'Northwind Logistics', priority: 'high', status: 'waiting', assigneeId: 'a-006', createdAt: hoursAgo(32), updatedAt: hoursAgo(12), slaDueAt: hoursAhead(-4), tags: ['billing'] },
  { id: 'T-2056', subject: 'Bulk CSV import skips the header row data', customer: 'Aperture Labs', priority: 'normal', status: 'resolved', assigneeId: 'a-002', createdAt: hoursAgo(36), updatedAt: hoursAgo(12), slaDueAt: hoursAhead(12), tags: ['import', 'csv'] },
  { id: 'T-2055', subject: 'Notification settings reset after each login', customer: 'Pulse Media', priority: 'normal', status: 'open', assigneeId: null, createdAt: hoursAgo(40), updatedAt: hoursAgo(40), slaDueAt: hoursAhead(8), tags: ['settings'] },
  { id: 'T-2054', subject: 'API key revocation propagates after 5 minutes', customer: 'Aurora Health', priority: 'urgent', status: 'in-progress', assigneeId: 'a-001', createdAt: hoursAgo(46), updatedAt: hoursAgo(2), slaDueAt: hoursAhead(3), tags: ['api', 'security'] },
  { id: 'T-2053', subject: 'Email templates render broken in Outlook', customer: 'Verdant Foods', priority: 'low', status: 'open', assigneeId: null, createdAt: hoursAgo(48), updatedAt: hoursAgo(48), slaDueAt: hoursAhead(0), tags: ['email', 'ui'] },
  { id: 'T-2052', subject: 'Audit log filter by user ignores teams', customer: 'Quanta Studios', priority: 'normal', status: 'waiting', assigneeId: 'a-008', createdAt: hoursAgo(54), updatedAt: hoursAgo(18), slaDueAt: hoursAhead(6), tags: ['audit'] },
  { id: 'T-2051', subject: 'Two-factor backup codes do not regenerate', customer: 'Lighthouse Co', priority: 'high', status: 'resolved', assigneeId: 'a-003', createdAt: hoursAgo(60), updatedAt: hoursAgo(20), slaDueAt: hoursAhead(-12), tags: ['auth', '2fa'] },
  { id: 'T-2050', subject: 'PDF receipts missing tax line for EU customers', customer: 'Hexa Robotics', priority: 'high', status: 'in-progress', assigneeId: 'a-006', createdAt: hoursAgo(62), updatedAt: hoursAgo(8), slaDueAt: hoursAhead(6), tags: ['billing', 'eu'] },
  { id: 'T-2049', subject: 'Mobile app crashes when scanning long ticket QR', customer: 'Pulse Media', priority: 'urgent', status: 'open', assigneeId: null, createdAt: hoursAgo(70), updatedAt: hoursAgo(70), slaDueAt: hoursAhead(-3), tags: ['mobile'] },
  { id: 'T-2048', subject: 'Saved table filters are not persisted', customer: 'Quanta Studios', priority: 'normal', status: 'resolved', assigneeId: 'a-002', createdAt: hoursAgo(76), updatedAt: hoursAgo(36), slaDueAt: hoursAhead(0), tags: ['ui'] },
  { id: 'T-2047', subject: 'Workspace admin can not invite past 500 seats', customer: 'Aurora Health', priority: 'high', status: 'waiting', assigneeId: 'a-001', createdAt: hoursAgo(82), updatedAt: hoursAgo(48), slaDueAt: hoursAhead(4), tags: ['workspace', 'limits'] },
  { id: 'T-2046', subject: 'Drag-drop reorder loses position after refresh', customer: 'Verdant Foods', priority: 'low', status: 'open', assigneeId: null, createdAt: hoursAgo(96), updatedAt: hoursAgo(96), slaDueAt: hoursAhead(0), tags: ['ui', 'persistence'] },
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

// --- Conversation messages, generated per ticket ---

const CUSTOMER_LINES = [
  'Hi team, we hit an issue this morning that is blocking a few users on our side. Details below.',
  'Just upgraded our seat count last week, not sure if that is related. Happy to send logs.',
  'We can reproduce it consistently in Chrome on macOS 14.5, fails on the staging URL too.',
  'Any update on this? Several of our customers are waiting on us before they can move on.',
];

const AGENT_LINES = [
  'Thanks for the detailed report. I am digging in now and will follow up within the hour with what I find.',
  'I can reproduce it on our side. Looks related to a deploy that went out late last night, we are rolling back the affected service.',
  'Quick update, the rollback completed at 14:20 UTC. Could you confirm whether the issue still reproduces on your end?',
  'Closing this out for now since we have not seen the error recur in the last two hours. Reopen any time if it comes back.',
];

const AGENT_LOOKUP = new Map(AGENTS.map((a) => [a.id, a]));

function generateMessages(): Message[] {
  const messages: Message[] = [];
  for (const ticket of TICKETS) {
    const baseId = ticket.id;
    const created = ticket.createdAt.getTime();
    const isResolved = ticket.status === 'resolved';
    const agent = ticket.assigneeId ? AGENT_LOOKUP.get(ticket.assigneeId) : undefined;

    messages.push({
      id: `${baseId}-m1`,
      ticketId: ticket.id,
      author: 'customer',
      authorName: ticket.customer,
      initials: ticket.customer.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      body: `${CUSTOMER_LINES[0]} Subject of the report: ${ticket.subject}.`,
      createdAt: ticket.createdAt,
      attachments:
        ticket.tags.includes('export') || ticket.tags.includes('reports')
          ? [{ name: 'export-failure.png', size: '212 KB' }]
          : undefined,
    });

    if (agent) {
      messages.push({
        id: `${baseId}-m2`,
        ticketId: ticket.id,
        author: { agentId: agent.id },
        authorName: agent.name,
        initials: agent.initials,
        body: AGENT_LINES[0],
        createdAt: new Date(created + 12 * 60_000),
      });
    }

    messages.push({
      id: `${baseId}-m3`,
      ticketId: ticket.id,
      author: 'customer',
      authorName: ticket.customer,
      initials: ticket.customer.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      body: CUSTOMER_LINES[2],
      createdAt: new Date(created + 35 * 60_000),
    });

    if (agent) {
      messages.push({
        id: `${baseId}-m4`,
        ticketId: ticket.id,
        author: { agentId: agent.id },
        authorName: agent.name,
        initials: agent.initials,
        body: AGENT_LINES[1],
        createdAt: new Date(created + 60 * 60_000),
      });
    }

    if (isResolved && agent) {
      messages.push({
        id: `${baseId}-m5`,
        ticketId: ticket.id,
        author: { agentId: agent.id },
        authorName: agent.name,
        initials: agent.initials,
        body: AGENT_LINES[3],
        createdAt: ticket.updatedAt,
      });
    }
  }
  return messages;
}

export const MESSAGES: readonly Message[] = generateMessages();

// --- Activity events, generated per ticket ---

function describeAgent(id: string | null | undefined): string {
  if (!id) return 'an agent';
  return AGENT_LOOKUP.get(id)?.name ?? 'an agent';
}

function generateActivity(): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const ticket of TICKETS) {
    const id = ticket.id;
    events.push({
      id: `${id}-a1`,
      ticketId: id,
      kind: 'created',
      actor: ticket.customer,
      description: `Opened by ${ticket.customer}`,
      createdAt: ticket.createdAt,
    });

    if (ticket.assigneeId) {
      events.push({
        id: `${id}-a2`,
        ticketId: id,
        kind: 'assigned',
        actor: 'system',
        description: `Routed to ${describeAgent(ticket.assigneeId)} by auto-routing`,
        createdAt: new Date(ticket.createdAt.getTime() + 4 * 60_000),
      });

      events.push({
        id: `${id}-a3`,
        ticketId: id,
        kind: 'replied',
        actor: describeAgent(ticket.assigneeId),
        description: `${describeAgent(ticket.assigneeId)} replied`,
        createdAt: new Date(ticket.createdAt.getTime() + 12 * 60_000),
      });
    }

    if (ticket.priority === 'urgent' || ticket.priority === 'high') {
      events.push({
        id: `${id}-a4`,
        ticketId: id,
        kind: 'priority-change',
        actor: describeAgent(ticket.assigneeId),
        description: `Priority bumped to ${ticket.priority}`,
        createdAt: new Date(ticket.createdAt.getTime() + 18 * 60_000),
      });
    }

    if (ticket.slaDueAt.getTime() < Date.now() && ticket.status !== 'resolved') {
      events.push({
        id: `${id}-a5`,
        ticketId: id,
        kind: 'sla-warning',
        actor: 'system',
        description: 'SLA window breached',
        createdAt: ticket.slaDueAt,
      });
    }

    if (ticket.status === 'resolved') {
      events.push({
        id: `${id}-a6`,
        ticketId: id,
        kind: 'resolved',
        actor: describeAgent(ticket.assigneeId),
        description: `Marked as resolved by ${describeAgent(ticket.assigneeId)}`,
        createdAt: ticket.updatedAt,
      });
    } else if (ticket.status === 'waiting') {
      events.push({
        id: `${id}-a7`,
        ticketId: id,
        kind: 'status-change',
        actor: describeAgent(ticket.assigneeId),
        description: 'Moved to "Waiting on customer"',
        createdAt: ticket.updatedAt,
      });
    }
  }
  return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const ACTIVITY: readonly ActivityEvent[] = generateActivity();

// --- Knowledge suggestions ---

export const KB_ARTICLES: readonly KbArticle[] = [
  { id: 'kb-1', title: 'Resetting two-factor authentication for an end user', category: 'Authentication', readMinutes: 3 },
  { id: 'kb-2', title: 'Why CSV exports may return empty rows', category: 'Exports', readMinutes: 5 },
  { id: 'kb-3', title: 'Webhook retry policy and replay window', category: 'API & webhooks', readMinutes: 4 },
  { id: 'kb-4', title: 'Renewing a custom domain SSL certificate', category: 'Hosting', readMinutes: 6 },
  { id: 'kb-5', title: 'Tier 2 escalation runbook', category: 'Process', readMinutes: 8 },
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
  return isSameDay(d, a);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
