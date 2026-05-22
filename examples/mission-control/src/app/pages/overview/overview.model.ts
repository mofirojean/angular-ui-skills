export type SortKey = 'startedAt' | 'agent' | 'duration' | 'cost';
export type SortDirection = 'asc' | 'desc';
export type RunStatus = 'success' | 'failed' | 'running';
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly direction: 'up' | 'down';
  readonly icon: string;
  readonly series: readonly number[];
}

export interface Run {
  readonly id: string;
  readonly agent: string;
  readonly status: RunStatus;
  readonly startedAt: string;
  readonly startedMinutes: number;
  readonly duration: string;
  readonly durationSeconds: number;
  readonly triggeredBy: Actor;
  readonly cost: number;
}

export interface Actor {
  readonly name: string;
  readonly initials: string;
}

export interface TrendPoint {
  readonly day: string;
  readonly count: number;
}

export interface StatusSlice {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly cssVar: string;
}

export interface DonutSegment extends StatusSlice {
  readonly dashArray: string;
  readonly dashOffset: string;
  readonly percent: string;
}

export interface ActivityEntry {
  readonly id: string;
  readonly who: Actor;
  readonly what: string;
  readonly when: string;
}

export interface VisibleRange {
  readonly start: number;
  readonly end: number;
  readonly total: number;
}

export interface AgentUsage {
  readonly name: string;
  readonly runs: number;
  readonly successRate: number;
  readonly trend: 'up' | 'down' | 'flat';
}

export interface BarSegment extends AgentUsage {
  readonly widthPercent: string;
}

export const PAGE_SIZE = 5;
export const DONUT_RADIUS = 40;
export const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
