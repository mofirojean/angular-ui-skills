export type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ScheduleStatus = 'active' | 'paused';

export interface AgentRef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

export interface Schedule {
  readonly id: string;
  readonly name: string;
  readonly agent: AgentRef;
  readonly cron: string;
  readonly humanReadable: string;
  readonly frequency: Frequency;
  readonly nextRun: string;
  readonly nextRunMinutes: number;
  readonly lastRun: string;
  readonly status: ScheduleStatus;
  readonly successRate: number;
  readonly runsThisWeek: number;
}