import { Actor, Agent, OwnerOption } from './agents.model';

const OWNERS = {
  MJ: { name: 'Mofiro Jean', initials: 'MJ' } satisfies Actor,
  SC: { name: 'Sarah Chen', initials: 'SC' } satisfies Actor,
  ML: { name: 'Marcus Lee', initials: 'ML' } satisfies Actor,
  AP: { name: 'Ayana Patel', initials: 'AP' } satisfies Actor,
  LT: { name: 'Leo Tanaka', initials: 'LT' } satisfies Actor,
  SY: { name: 'System', initials: 'SY' } satisfies Actor,
};

export const OWNER_OPTIONS: readonly OwnerOption[] = [
  { id: 'mj', ...OWNERS.MJ },
  { id: 'sc', ...OWNERS.SC },
  { id: 'ml', ...OWNERS.ML },
  { id: 'ap', ...OWNERS.AP },
  { id: 'lt', ...OWNERS.LT },
  { id: 'sy', ...OWNERS.SY },
];

export const AGENTS: readonly Agent[] = [
  { id: 'ag-101', name: 'Email Triage', description: 'Classifies inbound mail and routes to teams', icon: 'lucideMail', owner: OWNERS.MJ, status: 'active', category: 'Email', lastRun: '2m ago', lastRunMinutes: 2, created: 'Mar 14', createdDays: 69, successRate: 96, runsToday: 142, tags: ['production', 'high-volume'], runsTrend: [120, 135, 128, 141, 138, 145, 142], costToday: 14.20 },
  { id: 'ag-102', name: 'PDF Extractor', description: 'Extracts structured data from PDF invoices and receipts', icon: 'lucideFileText', owner: OWNERS.SC, status: 'active', category: 'Documents', lastRun: '8m ago', lastRunMinutes: 8, created: 'Mar 02', createdDays: 81, successRate: 89, runsToday: 118, tags: ['production'], runsTrend: [108, 112, 105, 120, 115, 122, 118], costToday: 21.30 },
  { id: 'ag-103', name: 'Lead Scorer', description: 'Ranks inbound leads using historical conversion data', icon: 'lucideTarget', owner: OWNERS.AP, status: 'active', category: 'Sales', lastRun: '12m ago', lastRunMinutes: 12, created: 'Feb 24', createdDays: 88, successRate: 98, runsToday: 94, tags: ['production', 'critical'], runsTrend: [82, 88, 84, 92, 89, 96, 94], costToday: 9.40 },
  { id: 'ag-104', name: 'Data Sync', description: 'Bidirectional sync between Postgres and the warehouse', icon: 'lucideDatabase', owner: OWNERS.LT, status: 'active', category: 'Data', lastRun: '17m ago', lastRunMinutes: 17, created: 'Jan 30', createdDays: 112, successRate: 95, runsToday: 78, tags: ['production'], runsTrend: [70, 72, 68, 80, 75, 82, 78], costToday: 5.85 },
  { id: 'ag-105', name: 'Slack Digest', description: 'Daily summary of unread channels with action items', icon: 'lucideMessageSquare', owner: OWNERS.MJ, status: 'active', category: 'Productivity', lastRun: '22m ago', lastRunMinutes: 22, created: 'Mar 18', createdDays: 65, successRate: 100, runsToday: 64, tags: ['production'], runsTrend: [58, 60, 62, 66, 64, 68, 64], costToday: 1.28 },
  { id: 'ag-106', name: 'Invoice Parser', description: 'Pulls line items + totals from supplier invoices', icon: 'lucideReceipt', owner: OWNERS.ML, status: 'active', category: 'Documents', lastRun: '31m ago', lastRunMinutes: 31, created: 'Feb 08', createdDays: 104, successRate: 88, runsToday: 52, tags: ['production'], runsTrend: [48, 50, 45, 55, 50, 58, 52], costToday: 5.72 },
  { id: 'ag-107', name: 'CRM Enricher', description: 'Augments contact records with external profile data', icon: 'lucideUsers', owner: OWNERS.SC, status: 'active', category: 'Sales', lastRun: '44m ago', lastRunMinutes: 44, created: 'Mar 09', createdDays: 74, successRate: 92, runsToday: 41, tags: ['production'], runsTrend: [36, 38, 35, 42, 40, 44, 41], costToday: 7.38 },
  { id: 'ag-108', name: 'Calendar Bot', description: 'Suggests optimal meeting times across timezones', icon: 'lucideCalendar', owner: OWNERS.AP, status: 'active', category: 'Productivity', lastRun: '58m ago', lastRunMinutes: 58, created: 'Mar 22', createdDays: 61, successRate: 100, runsToday: 28, tags: ['beta'], runsTrend: [22, 24, 26, 30, 28, 32, 28], costToday: 0.56 },
  { id: 'ag-109', name: 'Customer Sentiment', description: 'Analyzes support tickets for satisfaction signals', icon: 'lucideHeart', owner: OWNERS.LT, status: 'active', category: 'Analytics', lastRun: '1h ago', lastRunMinutes: 60, created: 'Mar 28', createdDays: 55, successRate: 94, runsToday: 33, tags: ['production'], runsTrend: [28, 30, 29, 35, 32, 36, 33], costToday: 4.95 },
  { id: 'ag-110', name: 'Doc Summarizer', description: 'Condenses long-form documents into bullet briefs', icon: 'lucideBookOpen', owner: OWNERS.MJ, status: 'active', category: 'Documents', lastRun: '2h ago', lastRunMinutes: 120, created: 'Apr 02', createdDays: 50, successRate: 91, runsToday: 19, tags: ['production'], runsTrend: [16, 18, 15, 22, 20, 24, 19], costToday: 3.42 },
  { id: 'ag-111', name: 'Lead Router v2', description: 'New ML-based lead routing - currently iterating', icon: 'lucideTarget', owner: OWNERS.AP, status: 'draft', category: 'Sales', lastRun: '-', lastRunMinutes: 999999, created: 'Apr 14', createdDays: 38, successRate: 0, runsToday: 0, tags: ['experimental'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-112', name: 'Meeting Notes AI', description: 'Generates structured notes from Zoom transcripts', icon: 'lucidePenTool', owner: OWNERS.SC, status: 'draft', category: 'Productivity', lastRun: '-', lastRunMinutes: 999999, created: 'Apr 18', createdDays: 34, successRate: 0, runsToday: 0, tags: ['wip'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-113', name: 'Contract Reviewer', description: 'Flags risky clauses in incoming legal contracts', icon: 'lucideShield', owner: OWNERS.ML, status: 'draft', category: 'Legal', lastRun: '-', lastRunMinutes: 999999, created: 'Apr 22', createdDays: 30, successRate: 0, runsToday: 0, tags: ['wip', 'legal'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-114', name: 'Webhook Demo', description: 'Internal sample for new webhook integration tests', icon: 'lucideWebhook', owner: OWNERS.SY, status: 'disabled', category: 'Internal', lastRun: '4d ago', lastRunMinutes: 5760, created: 'Jan 12', createdDays: 130, successRate: 100, runsToday: 0, tags: ['internal'], runsTrend: [4, 3, 2, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-115', name: 'Old Email Sorter', description: 'Legacy email classifier - superseded by Email Triage', icon: 'lucideMail', owner: OWNERS.MJ, status: 'archived', category: 'Email', lastRun: '12d ago', lastRunMinutes: 17280, created: 'Nov 05', createdDays: 198, successRate: 78, runsToday: 0, tags: ['legacy'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-116', name: 'Twitter Listener', description: 'Listens to keywords on X/Twitter and pushes to Slack', icon: 'lucideAtSign', owner: OWNERS.LT, status: 'archived', category: 'Integration', lastRun: '38d ago', lastRunMinutes: 54720, created: 'Sep 20', createdDays: 244, successRate: 85, runsToday: 0, tags: ['legacy'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-117', name: 'Receipt OCR', description: 'OCR-based receipt parser - replaced by PDF Extractor', icon: 'lucideReceipt', owner: OWNERS.ML, status: 'archived', category: 'Documents', lastRun: '52d ago', lastRunMinutes: 74880, created: 'Aug 11', createdDays: 285, successRate: 71, runsToday: 0, tags: ['legacy'], runsTrend: [0, 0, 0, 0, 0, 0, 0], costToday: 0 },
  { id: 'ag-118', name: 'Bug Triager', description: 'Auto-labels new GitHub issues by component + severity', icon: 'lucideBug', owner: OWNERS.AP, status: 'active', category: 'Engineering', lastRun: '3h ago', lastRunMinutes: 180, created: 'Apr 06', createdDays: 46, successRate: 93, runsToday: 24, tags: ['production'], runsTrend: [20, 22, 19, 26, 24, 28, 24], costToday: 2.40 },
  { id: 'ag-119', name: 'Stripe Reconciler', description: 'Matches Stripe payouts against accounting entries', icon: 'lucideCircleDollarSign', owner: OWNERS.SC, status: 'active', category: 'Finance', lastRun: '5h ago', lastRunMinutes: 300, created: 'Mar 11', createdDays: 72, successRate: 99, runsToday: 12, tags: ['production', 'critical'], runsTrend: [10, 11, 12, 14, 13, 15, 12], costToday: 1.92 },
  { id: 'ag-120', name: 'Daily Standup Compiler', description: 'Builds team standup summaries from yesterday\'s commits', icon: 'lucideClipboardList', owner: OWNERS.MJ, status: 'active', category: 'Productivity', lastRun: '7h ago', lastRunMinutes: 420, created: 'Apr 09', createdDays: 43, successRate: 100, runsToday: 8, tags: ['beta'], runsTrend: [6, 7, 8, 10, 9, 11, 8], costToday: 0.32 },
];
