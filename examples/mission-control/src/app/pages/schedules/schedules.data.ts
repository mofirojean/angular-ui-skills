import { AgentRef, Schedule } from './schedules.model';

const AGENTS_REF = {
  emailTriage: { id: 'ag-101', name: 'Email Triage', icon: 'lucideMail' },
  pdfExtractor: { id: 'ag-102', name: 'PDF Extractor', icon: 'lucideFileText' },
  leadScorer: { id: 'ag-103', name: 'Lead Scorer', icon: 'lucideTarget' },
  dataSync: { id: 'ag-104', name: 'Data Sync', icon: 'lucideDatabase' },
  slackDigest: { id: 'ag-105', name: 'Slack Digest', icon: 'lucideMessageSquare' },
  invoiceParser: { id: 'ag-106', name: 'Invoice Parser', icon: 'lucideReceipt' },
  crmEnricher: { id: 'ag-107', name: 'CRM Enricher', icon: 'lucideUsers' },
  calendarBot: { id: 'ag-108', name: 'Calendar Bot', icon: 'lucideCalendar' },
  customerSentiment: { id: 'ag-109', name: 'Customer Sentiment', icon: 'lucideHeart' },
  stripeReconciler: { id: 'ag-119', name: 'Stripe Reconciler', icon: 'lucideCircleDollarSign' },
  dailyStandup: { id: 'ag-120', name: 'Daily Standup Compiler', icon: 'lucideClipboardList' },
} as const satisfies Record<string, AgentRef>;

export const SCHEDULES: readonly Schedule[] = [
  { id: 'sch-1', name: 'Inbox triage', agent: AGENTS_REF.emailTriage, cron: '*/15 * * * *', humanReadable: 'Every 15 minutes', frequency: 'hourly', nextRun: 'in 8m', nextRunMinutes: 8, lastRun: '7m ago', status: 'active', successRate: 98, runsThisWeek: 672 },
  { id: 'sch-2', name: 'Hourly lead scoring', agent: AGENTS_REF.leadScorer, cron: '0 * * * *', humanReadable: 'Every hour on the hour', frequency: 'hourly', nextRun: 'in 23m', nextRunMinutes: 23, lastRun: '37m ago', status: 'active', successRate: 97, runsThisWeek: 168 },
  { id: 'sch-3', name: 'Morning standup digest', agent: AGENTS_REF.dailyStandup, cron: '0 9 * * 1-5', humanReadable: 'Weekdays at 09:00', frequency: 'daily', nextRun: 'tomorrow 09:00', nextRunMinutes: 600, lastRun: 'today 09:00', status: 'active', successRate: 100, runsThisWeek: 5 },
  { id: 'sch-4', name: 'Daily Slack digest', agent: AGENTS_REF.slackDigest, cron: '0 17 * * *', humanReadable: 'Daily at 17:00', frequency: 'daily', nextRun: 'today 17:00', nextRunMinutes: 240, lastRun: 'yesterday 17:00', status: 'active', successRate: 100, runsThisWeek: 7 },
  { id: 'sch-5', name: 'Nightly data sync', agent: AGENTS_REF.dataSync, cron: '0 2 * * *', humanReadable: 'Daily at 02:00', frequency: 'daily', nextRun: 'tomorrow 02:00', nextRunMinutes: 800, lastRun: 'today 02:00', status: 'active', successRate: 95, runsThisWeek: 7 },
  { id: 'sch-6', name: 'CRM weekly enrichment', agent: AGENTS_REF.crmEnricher, cron: '0 6 * * 1', humanReadable: 'Mondays at 06:00', frequency: 'weekly', nextRun: 'Mon 06:00', nextRunMinutes: 4320, lastRun: '6d ago', status: 'active', successRate: 92, runsThisWeek: 1 },
  { id: 'sch-7', name: 'PDF batch processor', agent: AGENTS_REF.pdfExtractor, cron: '*/30 9-18 * * 1-5', humanReadable: 'Every 30 min, business hours', frequency: 'custom', nextRun: 'in 18m', nextRunMinutes: 18, lastRun: '12m ago', status: 'active', successRate: 89, runsThisWeek: 102 },
  { id: 'sch-8', name: 'Monthly billing reconciliation', agent: AGENTS_REF.stripeReconciler, cron: '0 8 1 * *', humanReadable: '1st of each month at 08:00', frequency: 'monthly', nextRun: 'Jun 01 08:00', nextRunMinutes: 11520, lastRun: '14d ago', status: 'active', successRate: 99, runsThisWeek: 0 },
  { id: 'sch-9', name: 'Sentiment weekly report', agent: AGENTS_REF.customerSentiment, cron: '0 8 * * 1', humanReadable: 'Mondays at 08:00', frequency: 'weekly', nextRun: 'Mon 08:00', nextRunMinutes: 4440, lastRun: '6d ago', status: 'paused', successRate: 94, runsThisWeek: 0 },
  { id: 'sch-10', name: 'Calendar sync', agent: AGENTS_REF.calendarBot, cron: '0 */2 * * *', humanReadable: 'Every 2 hours', frequency: 'hourly', nextRun: 'in 47m', nextRunMinutes: 47, lastRun: '1h 13m ago', status: 'paused', successRate: 100, runsThisWeek: 84 },
  { id: 'sch-11', name: 'Invoice batch', agent: AGENTS_REF.invoiceParser, cron: '0 18 * * 5', humanReadable: 'Fridays at 18:00', frequency: 'weekly', nextRun: 'Fri 18:00', nextRunMinutes: 2640, lastRun: '3d ago', status: 'active', successRate: 88, runsThisWeek: 1 },
  { id: 'sch-12', name: 'Lead scorer recompute', agent: AGENTS_REF.leadScorer, cron: '0 22 * * *', humanReadable: 'Daily at 22:00', frequency: 'daily', nextRun: 'today 22:00', nextRunMinutes: 540, lastRun: 'yesterday 22:00', status: 'active', successRate: 98, runsThisWeek: 7 },
];

const today = new Date();
const yearOfToday = today.getFullYear();
const monthOfToday = today.getMonth();
const daysInMonth = new Date(yearOfToday, monthOfToday + 1, 0).getDate();

export const SCHEDULED_DAYS: Date[] = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  .filter((d) => {
    const day = new Date(yearOfToday, monthOfToday, d);
    const dow = day.getDay();
    return dow !== 0 && dow !== 6;
  })
  .map((d) => new Date(yearOfToday, monthOfToday, d));

export const AGENT_OPTIONS: readonly AgentRef[] = Object.values(AGENTS_REF);
