export type RunStatus = 'success' | 'failed' | 'running' | 'queued';
export type RunTrigger = 'webhook' | 'schedule' | 'manual';
export type StatusFilter = 'all' | RunStatus;
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type SortKey = 'startedAt' | 'duration' | 'cost' | 'agent';
export type SortDirection = 'asc' | 'desc';

export interface Actor {
  readonly name: string;
  readonly initials: string;
}

export interface AgentRef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

export interface Run {
  readonly id: string;
  readonly agent: AgentRef;
  readonly status: RunStatus;
  readonly startedAt: string;
  readonly startedMinutes: number;
  readonly duration: string;
  readonly durationSeconds: number;
  readonly triggeredBy: Actor;
  readonly trigger: RunTrigger;
  readonly cost: number;
  readonly tokensIn: number;
  readonly tokensOut: number;
  readonly retries: number;
}

export interface RunStep {
  readonly label: string;
  readonly status: 'completed' | 'running' | 'failed' | 'pending';
  readonly durationMs: number;
}

export interface RunDetail extends Run {
  readonly steps: readonly RunStep[];
  readonly output: Record<string, unknown>;
  readonly error?: string;
}

export const RUNS_PAGE_SIZE = 10;