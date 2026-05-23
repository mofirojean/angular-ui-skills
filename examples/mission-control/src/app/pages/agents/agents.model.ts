export type AgentStatus = 'active' | 'draft' | 'disabled' | 'archived';
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type SortKey = 'name' | 'lastRun' | 'runsToday' | 'successRate' | 'created';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = 'all' | AgentStatus;

export interface Actor {
  readonly name: string;
  readonly initials: string;
}

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly owner: Actor;
  readonly status: AgentStatus;
  readonly category: string;
  readonly lastRun: string;
  readonly lastRunMinutes: number;
  readonly created: string;
  readonly createdDays: number;
  readonly successRate: number;
  readonly runsToday: number;
  readonly tags: readonly string[];
  readonly runsTrend: readonly number[];
  readonly costToday: number;
}

export interface AgentKpi {
  readonly label: string;
  readonly value: string;
  readonly icon: string;
  readonly tone: 'neutral' | 'positive' | 'warning' | 'destructive';
  readonly hint: string;
}

export interface OwnerOption {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export const AGENTS_PAGE_SIZE = 8;
