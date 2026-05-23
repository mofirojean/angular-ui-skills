import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { Frequency, Schedule, ScheduleStatus, Weekday } from './schedules.model';
import { AGENT_OPTIONS, SCHEDULES } from './schedules.data';

interface SwimlaneRun {
  readonly hour: number;
  readonly minute: number;
  readonly leftPercent: number;
  readonly label: string;
}

interface SwimlaneRow {
  readonly schedule: Schedule;
  readonly runs: readonly SwimlaneRun[];
  readonly runCount: number;
  readonly intensity: number;
}

interface HeatmapDay {
  readonly date: Date;
  readonly day: number;
  readonly weekday: string;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly scheduleCount: number;
  readonly runCount: number;
  readonly schedules: readonly Schedule[];
  readonly intensity: 0 | 1 | 2 | 3 | 4;
}

function parseCronField(field: string, min: number, max: number): Set<number> {
  const result = new Set<number>();
  if (field === '*') {
    for (let i = min; i <= max; i++) result.add(i);
    return result;
  }
  for (const part of field.split(',')) {
    const stepMatch = /^(\*|\d+-\d+|\d+)\/(\d+)$/.exec(part);
    if (stepMatch) {
      const baseStr = stepMatch[1];
      const step = Number(stepMatch[2]);
      const [a, b] = baseStr === '*'
        ? [min, max]
        : baseStr.includes('-')
          ? (baseStr.split('-').map(Number) as [number, number])
          : [Number(baseStr), max];
      for (let i = a; i <= b; i += step) result.add(i);
      continue;
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) result.add(i);
      continue;
    }
    const n = Number(part);
    if (!Number.isNaN(n)) result.add(n);
  }
  return result;
}

function scheduleRunsOnDate(s: Schedule, date: Date): boolean {
  const parts = s.cron.trim().split(/\s+/);
  if (parts.length < 5) return true;
  const domField = parts[2];
  const dowField = parts[4];

  const dom = date.getDate();
  const dow = date.getDay();

  if (domField !== '*' && !parseCronField(domField, 1, 31).has(dom)) return false;
  if (dowField !== '*' && !parseCronField(dowField, 0, 6).has(dow)) return false;
  return true;
}

function runTimesForDate(s: Schedule, date: Date): readonly { hour: number; minute: number }[] {
  if (!scheduleRunsOnDate(s, date)) return [];
  const parts = s.cron.trim().split(/\s+/);
  if (parts.length < 2) return [];
  const minutes = [...parseCronField(parts[0], 0, 59)].sort((a, b) => a - b);
  const hours = [...parseCronField(parts[1], 0, 23)].sort((a, b) => a - b);
  const out: { hour: number; minute: number }[] = [];
  for (const h of hours) {
    for (const m of minutes) {
      out.push({ hour: h, minute: m });
    }
  }
  return out;
}

@Component({
  selector: 'app-schedules',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmDropdownMenuImports,
    HlmFieldImports,
    HlmHoverCardImports,
    HlmIcon,
    HlmInputImports,
    HlmLabelImports,
    HlmRadioGroupImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSkeletonImports,
    HlmSwitchImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './schedules.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Schedules {
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly skeletonRows = [0, 1, 2, 3, 4];

  protected readonly schedules = signal<readonly Schedule[]>(SCHEDULES);
  protected readonly agentOptions = AGENT_OPTIONS;

  private readonly _today = new Date();
  protected readonly todayLabel = computed(() => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[this._today.getDay()]} · ${months[this._today.getMonth()]} ${this._today.getDate()}`;
  });

  protected readonly nowPercent = computed(() => {
    const minutesSinceMidnight = this._today.getHours() * 60 + this._today.getMinutes();
    return (minutesSinceMidnight / (24 * 60)) * 100;
  });

  protected readonly hourTicks = [0, 3, 6, 9, 12, 15, 18, 21];

  protected readonly swimlaneRows = computed<readonly SwimlaneRow[]>(() => {
    const todayActives = this.schedules().filter(
      (s) => s.status === 'active' && scheduleRunsOnDate(s, this._today),
    );
    const rows: SwimlaneRow[] = todayActives.map((s) => {
      const times = runTimesForDate(s, this._today);
      const runs: SwimlaneRun[] = times.map(({ hour, minute }) => ({
        hour,
        minute,
        leftPercent: ((hour * 60 + minute) / (24 * 60)) * 100,
        label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      }));
      return {
        schedule: s,
        runs,
        runCount: runs.length,
        intensity: Math.min(4, Math.floor(runs.length / 4)),
      };
    });

    rows.sort((a, b) => b.runCount - a.runCount);
    return rows;
  });

  protected readonly todayTotalRuns = computed(() =>
    this.swimlaneRows().reduce((sum, r) => sum + r.runCount, 0),
  );

  protected readonly nextUp = computed<readonly Schedule[]>(() =>
    [...this.schedules()]
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRunMinutes - b.nextRunMinutes)
      .slice(0, 3),
  );

  protected formatCountdown(minutes: number): string {
    if (minutes < 1) return 'imminent';
    if (minutes < 60) return `in ${Math.round(minutes)}m`;
    if (minutes < 60 * 24) {
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
    }
    const d = Math.floor(minutes / (60 * 24));
    return `in ${d}d`;
  }

  protected readonly heatmapDays = computed<readonly HeatmapDay[]>(() => {
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const start = new Date(this._today);
    const out: HeatmapDay[] = [];
    const activeSchedules = this.schedules().filter((s) => s.status === 'active');

    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dow = d.getDay();

      const schedules = activeSchedules.filter((s) => scheduleRunsOnDate(s, d));
      const runCount = schedules.reduce((sum, s) => sum + runTimesForDate(s, d).length, 0);

      let intensity: 0 | 1 | 2 | 3 | 4;
      if (runCount === 0) intensity = 0;
      else if (runCount < 20) intensity = 1;
      else if (runCount < 60) intensity = 2;
      else if (runCount < 100) intensity = 3;
      else intensity = 4;

      out.push({
        date: d,
        day: d.getDate(),
        weekday: weekdays[dow] ?? '?',
        isToday: i === 0,
        isWeekend: dow === 0 || dow === 6,
        scheduleCount: schedules.length,
        runCount,
        schedules,
        intensity,
      });
    }
    return out;
  });

  protected readonly heatmapPeak = computed(() => {
    let max = 0;
    let peakDay: HeatmapDay | null = null;
    for (const d of this.heatmapDays()) {
      if (d.runCount > max) {
        max = d.runCount;
        peakDay = d;
      }
    }
    return peakDay;
  });

  protected heatmapClass(intensity: HeatmapDay['intensity']): string {
    switch (intensity) {
      case 0:
        return 'bg-muted/40';
      case 1:
        return 'bg-primary/20';
      case 2:
        return 'bg-primary/40';
      case 3:
        return 'bg-primary/70';
      case 4:
        return 'bg-primary';
    }
  }

  protected formatHeatmapDate(date: Date): string {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }

  protected readonly kpis = computed(() => {
    const all = this.schedules();
    const active = all.filter((s) => s.status === 'active').length;
    const paused = all.filter((s) => s.status === 'paused').length;
    const nextRun = [...all]
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRunMinutes - b.nextRunMinutes)[0];
    const totalThisWeek = all.reduce((sum, s) => sum + s.runsThisWeek, 0);

    return [
      { label: 'Active', value: `${active}`, icon: 'lucideCircleCheck', tone: 'positive' as const },
      { label: 'Paused', value: `${paused}`, icon: 'lucidePause', tone: paused === 0 ? ('neutral' as const) : ('warning' as const) },
      { label: 'Next run', value: nextRun?.nextRun ?? '—', icon: 'lucideClock', tone: 'neutral' as const },
      { label: 'Runs / week', value: totalThisWeek.toLocaleString(), icon: 'lucidePlay', tone: 'neutral' as const },
    ];
  });

  protected readonly allSchedules = computed<readonly Schedule[]>(() =>
    [...this.schedules()].sort((a, b) => {
      if (a.status === b.status) return a.nextRunMinutes - b.nextRunMinutes;
      return a.status === 'active' ? -1 : 1;
    }),
  );

  protected readonly newScheduleTrigger = viewChild<ElementRef<HTMLButtonElement>>('newScheduleTrigger');

  protected readonly newScheduleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    agentId: ['ag-101', Validators.required],
    frequency: ['daily' as Frequency, Validators.required],
    hour: [9],
    weekday: ['mon' as Weekday],
    cron: ['0 9 * * *'],
    enabled: [true],
    alertOnFailure: [true],
  });

  protected get nameCtrl() {
    return this.newScheduleForm.controls.name;
  }

  protected openNewScheduleDialog(): void {
    this.newScheduleForm.reset({
      name: '',
      agentId: 'ag-101',
      frequency: 'daily',
      hour: 9,
      weekday: 'mon',
      cron: '0 9 * * *',
      enabled: true,
      alertOnFailure: true,
    });
    queueMicrotask(() => this.newScheduleTrigger()?.nativeElement.click());
  }

  protected submitNewSchedule(ctx: { close: () => void }): void {
    if (this.newScheduleForm.invalid) {
      this.newScheduleForm.markAllAsTouched();
      return;
    }
    const v = this.newScheduleForm.getRawValue();
    toast.success(`Schedule "${v.name}" created`, {
      description: `Runs ${v.frequency} starting at ${String(v.hour).padStart(2, '0')}:00`,
    });
    ctx.close();
  }

  protected toggleStatus(id: string): void {
    let nextStatus: ScheduleStatus = 'active';
    this.schedules.update((list) =>
      list.map((s) => {
        if (s.id === id) {
          nextStatus = s.status === 'active' ? 'paused' : 'active';
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    );
    toast.info(`Schedule ${nextStatus === 'active' ? 'resumed' : 'paused'}`);
  }

  protected runNow(s: Schedule): void {
    toast.success(`${s.agent.name} queued for run`);
  }

  protected deleteSchedule(s: Schedule): void {
    toast.error(`Deleted "${s.name}"`, { description: 'Mock — no real data was changed' });
  }

  protected frequencyIcon(freq: Frequency): string {
    switch (freq) {
      case 'hourly':
        return 'lucideClock';
      case 'daily':
        return 'lucideCalendar';
      case 'weekly':
        return 'lucideCalendarDays';
      case 'monthly':
        return 'lucideCalendarDays';
      case 'custom':
        return 'lucideTerminal';
    }
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }
}