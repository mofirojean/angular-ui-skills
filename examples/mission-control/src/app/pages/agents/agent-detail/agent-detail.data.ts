import { AuditEntry, DataSource, LogEntry, PermissionEntry, RunHistoryEntry } from './agent-detail.model';

export const SAMPLE_LOGS: readonly LogEntry[] = [
  { id: 'l-1', timestamp: '12:34:18', level: 'info', message: 'Run r-1437 started', payload: { runId: 'r-1437', triggeredBy: 'webhook', payloadSize: 4096 } },
  { id: 'l-2', timestamp: '12:34:18', level: 'debug', message: 'Loaded prompt template v3', payload: { version: 3, tokens: 1284 } },
  { id: 'l-3', timestamp: '12:34:19', level: 'info', message: 'OpenAI call #1 initiated', payload: { model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 800 } },
  { id: 'l-4', timestamp: '12:34:21', level: 'success', message: 'OpenAI call #1 completed', payload: { latencyMs: 1820, usage: { promptTokens: 1284, completionTokens: 412, totalTokens: 1696 } } },
  { id: 'l-5', timestamp: '12:34:21', level: 'info', message: 'Parsing structured output' },
  { id: 'l-6', timestamp: '12:34:22', level: 'warn', message: 'Field "priority" not in expected enum, coercing to default', payload: { fieldName: 'priority', expected: ['low', 'med', 'high'], received: 'urgent', coercedTo: 'high' } },
  { id: 'l-7', timestamp: '12:34:22', level: 'info', message: 'Writing result to Postgres', payload: { table: 'public.leads', rowId: 'lead_8842' } },
  { id: 'l-8', timestamp: '12:34:23', level: 'success', message: 'Run r-1437 completed', payload: { runId: 'r-1437', durationMs: 4983, status: 'success', cost: 0.08 } },
];

export const SAMPLE_RUNS: readonly RunHistoryEntry[] = [
  { id: 'r-1437', startedAt: '12:34', duration: '0:54', status: 'success', cost: 0.18, trigger: 'webhook' },
  { id: 'r-1418', startedAt: '11:14', duration: '0:54', status: 'success', cost: 0.11, trigger: 'manual' },
  { id: 'r-1410', startedAt: '08:30', duration: '0:36', status: 'success', cost: 0.06, trigger: 'schedule' },
  { id: 'r-1402', startedAt: '06:00', duration: '1:02', status: 'success', cost: 0.21, trigger: 'schedule' },
  { id: 'r-1395', startedAt: '03:42', duration: '0:09', status: 'failed', cost: 0.02, trigger: 'schedule' },
  { id: 'r-1388', startedAt: 'Y 23:11', duration: '0:48', status: 'success', cost: 0.13, trigger: 'webhook' },
  { id: 'r-1379', startedAt: 'Y 20:34', duration: '1:16', status: 'success', cost: 0.24, trigger: 'manual' },
];

export const SAMPLE_PERMISSIONS: readonly PermissionEntry[] = [
  { label: 'Read agent config', description: 'View prompts, schedule, and routing rules', granted: true },
  { label: 'Write agent config', description: 'Change prompts, schedule, and routing rules', granted: true },
  { label: 'Run agent manually', description: 'Trigger ad-hoc runs from the UI', granted: true },
  { label: 'Delete agent', description: 'Remove the agent and its run history', granted: false },
  { label: 'Read run logs', description: 'View full run output and intermediate steps', granted: true },
  { label: 'Manage API keys', description: 'Rotate or revoke this agent\'s API keys', granted: false },
];

export const SAMPLE_DATA_SOURCES: readonly DataSource[] = [
  { id: 'ds-pg-leads', label: 'leads_db (Postgres)', type: 'postgres', enabled: true },
  { id: 'ds-pg-orders', label: 'orders_db (Postgres)', type: 'postgres', enabled: false },
  { id: 'ds-rest-hubspot', label: 'HubSpot REST', type: 'rest', enabled: true },
  { id: 'ds-wh-stripe', label: 'Stripe webhook', type: 'webhook', enabled: false },
  { id: 'ds-s3-archive', label: 's3://archive', type: 'storage', enabled: true },
];

export const SAMPLE_AUDIT: readonly AuditEntry[] = [
  { id: 'au-1', who: 'Sarah Chen', action: 'Granted "Write agent config"', when: '2h ago' },
  { id: 'au-2', who: 'Mofiro Jean', action: 'Revoked "Delete agent"', when: '1d ago' },
  { id: 'au-3', who: 'System', action: 'Rotated API key', when: '3d ago' },
  { id: 'au-4', who: 'Marcus Lee', action: 'Enabled HubSpot REST data source', when: '5d ago' },
];

export const TRIGGER_PATTERNS = [
  'On webhook',
  'On schedule (daily 09:00)',
  'On schedule (hourly)',
  'Manual only',
  'On Slack message',
] as const;