export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly payload?: Record<string, unknown>;
}

export interface RunHistoryEntry {
  readonly id: string;
  readonly startedAt: string;
  readonly duration: string;
  readonly status: 'success' | 'failed' | 'running';
  readonly cost: number;
  readonly trigger: string;
}

export interface PermissionEntry {
  readonly label: string;
  readonly description: string;
  readonly granted: boolean;
}

export interface DataSource {
  readonly id: string;
  readonly label: string;
  readonly type: 'postgres' | 'rest' | 'webhook' | 'storage';
  readonly enabled: boolean;
}

export interface AuditEntry {
  readonly id: string;
  readonly who: string;
  readonly action: string;
  readonly when: string;
}

export type RetryPolicy = 'never' | 'once' | 'exponential';
export type ScheduleMode = 'manual' | 'cron' | 'webhook';