import { Actor, AgentRef, Run, RunDetail, RunStep } from './runs.model';

const ACTORS = {
  MJ: { name: 'Mofiro Jean', initials: 'MJ' } satisfies Actor,
  SC: { name: 'Sarah Chen', initials: 'SC' } satisfies Actor,
  ML: { name: 'Marcus Lee', initials: 'ML' } satisfies Actor,
  AP: { name: 'Ayana Patel', initials: 'AP' } satisfies Actor,
  LT: { name: 'Leo Tanaka', initials: 'LT' } satisfies Actor,
  WH: { name: 'Webhook', initials: 'WH' } satisfies Actor,
  SCH: { name: 'Schedule', initials: 'SC' } satisfies Actor,
};

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
  bugTriager: { id: 'ag-118', name: 'Bug Triager', icon: 'lucideBug' },
  stripeReconciler: { id: 'ag-119', name: 'Stripe Reconciler', icon: 'lucideCircleDollarSign' },
} as const satisfies Record<string, AgentRef>;

export const RUNS: readonly Run[] = [
  { id: 'r-1437', agent: AGENTS_REF.emailTriage, status: 'running', startedAt: '12:48', startedMinutes: 768, duration: '—', durationSeconds: 0, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.0, tokensIn: 1280, tokensOut: 0, retries: 0 },
  { id: 'r-1436', agent: AGENTS_REF.leadScorer, status: 'running', startedAt: '12:44', startedMinutes: 764, duration: '—', durationSeconds: 0, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.0, tokensIn: 980, tokensOut: 0, retries: 0 },
  { id: 'r-1435', agent: AGENTS_REF.dataSync, status: 'success', startedAt: '12:41', startedMinutes: 761, duration: '0:54', durationSeconds: 54, triggeredBy: ACTORS.AP, trigger: 'manual', cost: 0.09, tokensIn: 0, tokensOut: 0, retries: 0 },
  { id: 'r-1434', agent: AGENTS_REF.pdfExtractor, status: 'success', startedAt: '12:37', startedMinutes: 757, duration: '1:18', durationSeconds: 78, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.14, tokensIn: 4200, tokensOut: 1850, retries: 0 },
  { id: 'r-1433', agent: AGENTS_REF.emailTriage, status: 'success', startedAt: '12:32', startedMinutes: 752, duration: '2:04', durationSeconds: 124, triggeredBy: ACTORS.MJ, trigger: 'manual', cost: 0.22, tokensIn: 3100, tokensOut: 2400, retries: 0 },
  { id: 'r-1432', agent: AGENTS_REF.slackDigest, status: 'success', startedAt: '12:28', startedMinutes: 748, duration: '0:11', durationSeconds: 11, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.02, tokensIn: 800, tokensOut: 320, retries: 0 },
  { id: 'r-1431', agent: AGENTS_REF.invoiceParser, status: 'failed', startedAt: '12:21', startedMinutes: 741, duration: '0:18', durationSeconds: 18, triggeredBy: ACTORS.ML, trigger: 'manual', cost: 0.03, tokensIn: 1500, tokensOut: 0, retries: 2 },
  { id: 'r-1430', agent: AGENTS_REF.crmEnricher, status: 'success', startedAt: '12:14', startedMinutes: 734, duration: '1:47', durationSeconds: 107, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.19, tokensIn: 2400, tokensOut: 1200, retries: 0 },
  { id: 'r-1429', agent: AGENTS_REF.emailTriage, status: 'success', startedAt: '12:08', startedMinutes: 728, duration: '1:32', durationSeconds: 92, triggeredBy: ACTORS.MJ, trigger: 'manual', cost: 0.17, tokensIn: 2800, tokensOut: 1900, retries: 0 },
  { id: 'r-1428', agent: AGENTS_REF.calendarBot, status: 'success', startedAt: '12:01', startedMinutes: 721, duration: '0:09', durationSeconds: 9, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.02, tokensIn: 600, tokensOut: 280, retries: 0 },
  { id: 'r-1427', agent: AGENTS_REF.leadScorer, status: 'success', startedAt: '11:55', startedMinutes: 715, duration: '0:43', durationSeconds: 43, triggeredBy: ACTORS.SC, trigger: 'manual', cost: 0.08, tokensIn: 1400, tokensOut: 800, retries: 0 },
  { id: 'r-1426', agent: AGENTS_REF.dataSync, status: 'failed', startedAt: '11:48', startedMinutes: 708, duration: '0:06', durationSeconds: 6, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.01, tokensIn: 0, tokensOut: 0, retries: 1 },
  { id: 'r-1425', agent: AGENTS_REF.pdfExtractor, status: 'success', startedAt: '11:40', startedMinutes: 700, duration: '0:31', durationSeconds: 31, triggeredBy: ACTORS.LT, trigger: 'manual', cost: 0.06, tokensIn: 1800, tokensOut: 920, retries: 0 },
  { id: 'r-1424', agent: AGENTS_REF.slackDigest, status: 'success', startedAt: '11:33', startedMinutes: 693, duration: '0:14', durationSeconds: 14, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.03, tokensIn: 950, tokensOut: 400, retries: 0 },
  { id: 'r-1423', agent: AGENTS_REF.emailTriage, status: 'failed', startedAt: '11:25', startedMinutes: 685, duration: '0:23', durationSeconds: 23, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.04, tokensIn: 1100, tokensOut: 0, retries: 3 },
  { id: 'r-1422', agent: AGENTS_REF.crmEnricher, status: 'success', startedAt: '11:18', startedMinutes: 678, duration: '1:47', durationSeconds: 107, triggeredBy: ACTORS.MJ, trigger: 'manual', cost: 0.18, tokensIn: 2600, tokensOut: 1300, retries: 0 },
  { id: 'r-1421', agent: AGENTS_REF.leadScorer, status: 'success', startedAt: '11:12', startedMinutes: 672, duration: '0:38', durationSeconds: 38, triggeredBy: ACTORS.AP, trigger: 'manual', cost: 0.07, tokensIn: 1500, tokensOut: 720, retries: 0 },
  { id: 'r-1420', agent: AGENTS_REF.dataSync, status: 'success', startedAt: '11:05', startedMinutes: 665, duration: '0:38', durationSeconds: 38, triggeredBy: ACTORS.SC, trigger: 'manual', cost: 0.06, tokensIn: 0, tokensOut: 0, retries: 0 },
  { id: 'r-1419', agent: AGENTS_REF.slackDigest, status: 'queued', startedAt: '10:58', startedMinutes: 658, duration: '—', durationSeconds: 0, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.0, tokensIn: 0, tokensOut: 0, retries: 0 },
  { id: 'r-1418', agent: AGENTS_REF.invoiceParser, status: 'success', startedAt: '10:50', startedMinutes: 650, duration: '0:54', durationSeconds: 54, triggeredBy: ACTORS.ML, trigger: 'manual', cost: 0.11, tokensIn: 2200, tokensOut: 1100, retries: 0 },
  { id: 'r-1417', agent: AGENTS_REF.pdfExtractor, status: 'success', startedAt: '10:42', startedMinutes: 642, duration: '0:31', durationSeconds: 31, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.05, tokensIn: 1600, tokensOut: 800, retries: 0 },
  { id: 'r-1416', agent: AGENTS_REF.emailTriage, status: 'success', startedAt: '10:33', startedMinutes: 633, duration: '2:18', durationSeconds: 138, triggeredBy: ACTORS.MJ, trigger: 'manual', cost: 0.24, tokensIn: 3400, tokensOut: 2600, retries: 0 },
  { id: 'r-1415', agent: AGENTS_REF.bugTriager, status: 'success', startedAt: '10:25', startedMinutes: 625, duration: '0:42', durationSeconds: 42, triggeredBy: ACTORS.LT, trigger: 'webhook', cost: 0.09, tokensIn: 1900, tokensOut: 1100, retries: 0 },
  { id: 'r-1414', agent: AGENTS_REF.dataSync, status: 'failed', startedAt: '10:16', startedMinutes: 616, duration: '0:09', durationSeconds: 9, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.01, tokensIn: 0, tokensOut: 0, retries: 1 },
  { id: 'r-1413', agent: AGENTS_REF.crmEnricher, status: 'success', startedAt: '10:08', startedMinutes: 608, duration: '0:42', durationSeconds: 42, triggeredBy: ACTORS.SC, trigger: 'manual', cost: 0.08, tokensIn: 1700, tokensOut: 900, retries: 0 },
  { id: 'r-1412', agent: AGENTS_REF.calendarBot, status: 'success', startedAt: '10:00', startedMinutes: 600, duration: '0:11', durationSeconds: 11, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.02, tokensIn: 700, tokensOut: 320, retries: 0 },
  { id: 'r-1411', agent: AGENTS_REF.stripeReconciler, status: 'success', startedAt: '09:52', startedMinutes: 592, duration: '1:09', durationSeconds: 69, triggeredBy: ACTORS.AP, trigger: 'manual', cost: 0.13, tokensIn: 2100, tokensOut: 1400, retries: 0 },
  { id: 'r-1410', agent: AGENTS_REF.pdfExtractor, status: 'success', startedAt: '09:44', startedMinutes: 584, duration: '0:36', durationSeconds: 36, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.06, tokensIn: 1700, tokensOut: 850, retries: 0 },
  { id: 'r-1409', agent: AGENTS_REF.emailTriage, status: 'success', startedAt: '09:36', startedMinutes: 576, duration: '1:52', durationSeconds: 112, triggeredBy: ACTORS.MJ, trigger: 'manual', cost: 0.19, tokensIn: 3000, tokensOut: 2100, retries: 0 },
  { id: 'r-1408', agent: AGENTS_REF.customerSentiment, status: 'success', startedAt: '09:28', startedMinutes: 568, duration: '0:48', durationSeconds: 48, triggeredBy: ACTORS.LT, trigger: 'schedule', cost: 0.10, tokensIn: 2000, tokensOut: 1100, retries: 0 },
  { id: 'r-1407', agent: AGENTS_REF.slackDigest, status: 'success', startedAt: '09:20', startedMinutes: 560, duration: '0:13', durationSeconds: 13, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.02, tokensIn: 750, tokensOut: 360, retries: 0 },
  { id: 'r-1406', agent: AGENTS_REF.bugTriager, status: 'failed', startedAt: '09:11', startedMinutes: 551, duration: '0:17', durationSeconds: 17, triggeredBy: ACTORS.WH, trigger: 'webhook', cost: 0.03, tokensIn: 1300, tokensOut: 0, retries: 1 },
  { id: 'r-1405', agent: AGENTS_REF.leadScorer, status: 'success', startedAt: '09:02', startedMinutes: 542, duration: '0:51', durationSeconds: 51, triggeredBy: ACTORS.SC, trigger: 'schedule', cost: 0.10, tokensIn: 1800, tokensOut: 1000, retries: 0 },
  { id: 'r-1404', agent: AGENTS_REF.invoiceParser, status: 'success', startedAt: '08:55', startedMinutes: 535, duration: '1:23', durationSeconds: 83, triggeredBy: ACTORS.ML, trigger: 'webhook', cost: 0.16, tokensIn: 2500, tokensOut: 1400, retries: 0 },
  { id: 'r-1403', agent: AGENTS_REF.dataSync, status: 'success', startedAt: '08:48', startedMinutes: 528, duration: '0:34', durationSeconds: 34, triggeredBy: ACTORS.SCH, trigger: 'schedule', cost: 0.05, tokensIn: 0, tokensOut: 0, retries: 0 },
];

const SAMPLE_STEPS: readonly RunStep[] = [
  { label: 'Validate input', status: 'completed', durationMs: 24 },
  { label: 'Load context (RAG)', status: 'completed', durationMs: 142 },
  { label: 'LLM call #1', status: 'completed', durationMs: 1820 },
  { label: 'Parse structured output', status: 'completed', durationMs: 38 },
  { label: 'Write to Postgres', status: 'completed', durationMs: 96 },
  { label: 'Emit webhook', status: 'completed', durationMs: 211 },
];

const RUNNING_STEPS: readonly RunStep[] = [
  { label: 'Validate input', status: 'completed', durationMs: 24 },
  { label: 'Load context (RAG)', status: 'completed', durationMs: 142 },
  { label: 'LLM call #1', status: 'running', durationMs: 0 },
  { label: 'Parse structured output', status: 'pending', durationMs: 0 },
  { label: 'Write to Postgres', status: 'pending', durationMs: 0 },
];

const FAILED_STEPS: readonly RunStep[] = [
  { label: 'Validate input', status: 'completed', durationMs: 21 },
  { label: 'Load context (RAG)', status: 'completed', durationMs: 138 },
  { label: 'LLM call #1', status: 'failed', durationMs: 4502 },
];

export function getRunDetail(run: Run): RunDetail {
  const isRunning = run.status === 'running' || run.status === 'queued';
  const isFailed = run.status === 'failed';
  const steps = isRunning ? RUNNING_STEPS : isFailed ? FAILED_STEPS : SAMPLE_STEPS;

  const output: Record<string, unknown> = isFailed
    ? { error: 'Upstream timeout after 4.5s', retryable: true }
    : isRunning
      ? { state: 'in_progress', step: 3, total: 6 }
      : {
          summary: 'Processed successfully',
          itemsProcessed: 12,
          confidence: 0.94,
          tags: ['production', 'auto'],
          warnings: [],
        };

  return {
    ...run,
    steps,
    output,
    error: isFailed ? 'OpenAI API call timed out after 4500ms (3 retries)' : undefined,
  };
}