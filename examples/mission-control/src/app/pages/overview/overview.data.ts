import { ActivityEntry, AgentUsage, Kpi, Run, StatusSlice, TrendPoint } from './overview.model';

export const KPIS: readonly Kpi[] = [
  {
    label: 'Runs today',
    value: '247',
    delta: '+18% vs yesterday',
    direction: 'up',
    icon: 'lucidePlay',
    series: [98, 112, 87, 134, 145, 76, 127, 198, 215, 247],
  },
  {
    label: 'Success rate',
    value: '94.6%',
    delta: '+0.4% vs last 7d',
    direction: 'up',
    icon: 'lucideCircleCheck',
    series: [91.2, 92.1, 89.8, 93.4, 94.2, 93.5, 93.9, 94.1, 94.4, 94.6],
  },
  {
    label: 'Cost this month',
    value: '$284.50',
    delta: '-8% vs forecast',
    direction: 'down',
    icon: 'lucideCircleDollarSign',
    series: [320, 308, 298, 294, 290, 286, 285, 284, 283, 284.5],
  },
  {
    label: 'Active agents',
    value: '18',
    delta: '+2 this week',
    direction: 'up',
    icon: 'lucideBot',
    series: [14, 14, 15, 15, 16, 16, 17, 17, 18, 18],
  },
];

export const RUNS_TREND: readonly TrendPoint[] = [
  { day: 'Mon', count: 198 },
  { day: 'Tue', count: 225 },
  { day: 'Wed', count: 174 },
  { day: 'Thu', count: 268 },
  { day: 'Fri', count: 291 },
  { day: 'Sat', count: 152 },
  { day: 'Sun', count: 247 },
];

export const STATUS_BREAKDOWN: readonly StatusSlice[] = [
  { label: 'Success', value: 198, color: 'oklch(0.696 0.17 162)', cssVar: 'success' },
  { label: 'Running', value: 36, color: 'oklch(0.794 0.16 86)', cssVar: 'running' },
  { label: 'Failed', value: 13, color: 'var(--destructive)', cssVar: 'failed' },
];

export const AGENT_USAGE: readonly AgentUsage[] = [
  { name: 'Email Triage', runs: 142, successRate: 96, trend: 'up' },
  { name: 'PDF Extractor', runs: 118, successRate: 89, trend: 'up' },
  { name: 'Lead Scorer', runs: 94, successRate: 98, trend: 'flat' },
  { name: 'Data Sync', runs: 78, successRate: 95, trend: 'up' },
  { name: 'Slack Digest', runs: 64, successRate: 100, trend: 'flat' },
  { name: 'Invoice Parser', runs: 52, successRate: 88, trend: 'down' },
  { name: 'CRM Enricher', runs: 41, successRate: 92, trend: 'up' },
  { name: 'Calendar Bot', runs: 28, successRate: 100, trend: 'flat' },
];

const ACTORS = {
  SARAH: { name: 'Sarah Chen', initials: 'SC' },
  MJ: { name: 'Mofiro Jean', initials: 'MJ' },
  MARCUS: { name: 'Marcus Lee', initials: 'ML' },
  SYS: { name: 'System', initials: 'SY' },
  WEBHOOK: { name: 'Webhook', initials: 'WH' },
  SCHEDULE: { name: 'Schedule', initials: 'SC' },
  AYANA: { name: 'Ayana Patel', initials: 'AP' },
  LEO: { name: 'Leo Tanaka', initials: 'LT' },
} as const;

export const RECENT_RUNS: readonly Run[] = [
  { id: 'r-1437', agent: 'Email Triage', status: 'running', startedAt: '12:48', startedMinutes: 768, duration: '—', durationSeconds: 0, triggeredBy: ACTORS.WEBHOOK, cost: 0.0 },
  { id: 'r-1436', agent: 'Lead Scorer', status: 'running', startedAt: '12:44', startedMinutes: 764, duration: '—', durationSeconds: 0, triggeredBy: ACTORS.SCHEDULE, cost: 0.0 },
  { id: 'r-1435', agent: 'Data Sync', status: 'success', startedAt: '12:41', startedMinutes: 761, duration: '0:54', durationSeconds: 54, triggeredBy: ACTORS.AYANA, cost: 0.09 },
  { id: 'r-1434', agent: 'PDF Extractor', status: 'success', startedAt: '12:37', startedMinutes: 757, duration: '1:18', durationSeconds: 78, triggeredBy: ACTORS.SCHEDULE, cost: 0.14 },
  { id: 'r-1433', agent: 'Email Triage', status: 'success', startedAt: '12:32', startedMinutes: 752, duration: '2:04', durationSeconds: 124, triggeredBy: ACTORS.MJ, cost: 0.22 },
  { id: 'r-1432', agent: 'Slack Digest', status: 'success', startedAt: '12:28', startedMinutes: 748, duration: '0:11', durationSeconds: 11, triggeredBy: ACTORS.SCHEDULE, cost: 0.02 },
  { id: 'r-1431', agent: 'Invoice Parser', status: 'failed', startedAt: '12:21', startedMinutes: 741, duration: '0:18', durationSeconds: 18, triggeredBy: ACTORS.MARCUS, cost: 0.03 },
  { id: 'r-1430', agent: 'CRM Enricher', status: 'success', startedAt: '12:14', startedMinutes: 734, duration: '1:47', durationSeconds: 107, triggeredBy: ACTORS.WEBHOOK, cost: 0.19 },
  { id: 'r-1429', agent: 'Email Triage', status: 'success', startedAt: '12:08', startedMinutes: 728, duration: '1:32', durationSeconds: 92, triggeredBy: ACTORS.MJ, cost: 0.17 },
  { id: 'r-1428', agent: 'Calendar Bot', status: 'success', startedAt: '12:01', startedMinutes: 721, duration: '0:09', durationSeconds: 9, triggeredBy: ACTORS.SCHEDULE, cost: 0.02 },
  { id: 'r-1427', agent: 'Lead Scorer', status: 'success', startedAt: '11:55', startedMinutes: 715, duration: '0:43', durationSeconds: 43, triggeredBy: ACTORS.SARAH, cost: 0.08 },
  { id: 'r-1426', agent: 'Data Sync', status: 'failed', startedAt: '11:48', startedMinutes: 708, duration: '0:06', durationSeconds: 6, triggeredBy: ACTORS.WEBHOOK, cost: 0.01 },
  { id: 'r-1425', agent: 'PDF Extractor', status: 'success', startedAt: '11:40', startedMinutes: 700, duration: '0:31', durationSeconds: 31, triggeredBy: ACTORS.LEO, cost: 0.06 },
  { id: 'r-1424', agent: 'Slack Digest', status: 'success', startedAt: '11:33', startedMinutes: 693, duration: '0:14', durationSeconds: 14, triggeredBy: ACTORS.SCHEDULE, cost: 0.03 },
  { id: 'r-1423', agent: 'Email Triage', status: 'failed', startedAt: '11:25', startedMinutes: 685, duration: '0:23', durationSeconds: 23, triggeredBy: ACTORS.SCHEDULE, cost: 0.04 },
  { id: 'r-1422', agent: 'CRM Enricher', status: 'success', startedAt: '11:18', startedMinutes: 678, duration: '1:47', durationSeconds: 107, triggeredBy: ACTORS.MJ, cost: 0.18 },
  { id: 'r-1421', agent: 'Lead Scorer', status: 'success', startedAt: '11:12', startedMinutes: 672, duration: '0:38', durationSeconds: 38, triggeredBy: ACTORS.AYANA, cost: 0.07 },
  { id: 'r-1420', agent: 'Data Sync', status: 'success', startedAt: '11:05', startedMinutes: 665, duration: '0:38', durationSeconds: 38, triggeredBy: ACTORS.SARAH, cost: 0.06 },
  { id: 'r-1419', agent: 'Slack Digest', status: 'success', startedAt: '10:58', startedMinutes: 658, duration: '0:12', durationSeconds: 12, triggeredBy: ACTORS.SCHEDULE, cost: 0.02 },
  { id: 'r-1418', agent: 'Invoice Parser', status: 'success', startedAt: '10:50', startedMinutes: 650, duration: '0:54', durationSeconds: 54, triggeredBy: ACTORS.MARCUS, cost: 0.11 },
  { id: 'r-1417', agent: 'PDF Extractor', status: 'success', startedAt: '10:42', startedMinutes: 642, duration: '0:31', durationSeconds: 31, triggeredBy: ACTORS.WEBHOOK, cost: 0.05 },
  { id: 'r-1416', agent: 'Email Triage', status: 'success', startedAt: '10:33', startedMinutes: 633, duration: '2:18', durationSeconds: 138, triggeredBy: ACTORS.MJ, cost: 0.24 },
  { id: 'r-1415', agent: 'Lead Scorer', status: 'success', startedAt: '10:25', startedMinutes: 625, duration: '1:24', durationSeconds: 84, triggeredBy: ACTORS.LEO, cost: 0.14 },
  { id: 'r-1414', agent: 'Data Sync', status: 'failed', startedAt: '10:16', startedMinutes: 616, duration: '0:09', durationSeconds: 9, triggeredBy: ACTORS.SCHEDULE, cost: 0.01 },
  { id: 'r-1413', agent: 'CRM Enricher', status: 'success', startedAt: '10:08', startedMinutes: 608, duration: '0:42', durationSeconds: 42, triggeredBy: ACTORS.SARAH, cost: 0.08 },
  { id: 'r-1412', agent: 'Calendar Bot', status: 'success', startedAt: '10:00', startedMinutes: 600, duration: '0:11', durationSeconds: 11, triggeredBy: ACTORS.SCHEDULE, cost: 0.02 },
  { id: 'r-1411', agent: 'Invoice Parser', status: 'success', startedAt: '09:52', startedMinutes: 592, duration: '1:09', durationSeconds: 69, triggeredBy: ACTORS.AYANA, cost: 0.13 },
  { id: 'r-1410', agent: 'PDF Extractor', status: 'success', startedAt: '09:44', startedMinutes: 584, duration: '0:36', durationSeconds: 36, triggeredBy: ACTORS.WEBHOOK, cost: 0.06 },
  { id: 'r-1409', agent: 'Email Triage', status: 'success', startedAt: '09:36', startedMinutes: 576, duration: '1:52', durationSeconds: 112, triggeredBy: ACTORS.MJ, cost: 0.19 },
  { id: 'r-1408', agent: 'Slack Digest', status: 'success', startedAt: '09:28', startedMinutes: 568, duration: '0:13', durationSeconds: 13, triggeredBy: ACTORS.SCHEDULE, cost: 0.02 },
];

export const ACTIVITY_ENTRIES: readonly ActivityEntry[] = [
  { id: 'a-1', who: ACTORS.SYS, what: 'Email Triage #1437 started', when: 'just now' },
  { id: 'a-2', who: ACTORS.AYANA, what: 'deployed Data Sync v3.4', when: '2m ago' },
  { id: 'a-3', who: ACTORS.SYS, what: 'Invoice Parser #1431 failed', when: '8m ago' },
  { id: 'a-4', who: ACTORS.MJ, what: 'updated Email Triage prompt', when: '12m ago' },
  { id: 'a-5', who: ACTORS.SARAH, what: 'created agent Calendar Bot', when: '34m ago' },
  { id: 'a-6', who: ACTORS.LEO, what: 'reviewed PDF Extractor logs', when: '1h ago' },
  { id: 'a-7', who: ACTORS.SYS, what: 'plan upgraded to Pro', when: '2h ago' },
  { id: 'a-8', who: ACTORS.MARCUS, what: 'invited 2 team members', when: '3h ago' },
  { id: 'a-9', who: ACTORS.SCHEDULE, what: 'enabled daily Slack Digest', when: '5h ago' },
  { id: 'a-10', who: ACTORS.MJ, what: 'archived legacy Webhook Demo', when: '6h ago' },
  { id: 'a-11', who: ACTORS.SARAH, what: 'rotated API key for Data Sync', when: '8h ago' },
  { id: 'a-12', who: ACTORS.SYS, what: 'CRM Enricher #1410 completed', when: '10h ago' },
  { id: 'a-13', who: ACTORS.AYANA, what: 'tagged Lead Scorer as production', when: '12h ago' },
  { id: 'a-14', who: ACTORS.SYS, what: 'monthly billing posted: $284.50', when: '1d ago' },
  { id: 'a-15', who: ACTORS.MJ, what: 'imported 14 leads via Zapier', when: '1d ago' },
];
