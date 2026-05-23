import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCalendarImports } from '@spartan-ng/helm/calendar';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { AgentRef, Frequency, Schedule, ScheduleStatus, Weekday } from './schedules.model';
import { AGENT_OPTIONS, SCHEDULED_DAYS, SCHEDULES } from './schedules.data';

@Component({
  selector: 'app-schedules',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCalendarImports,
    HlmCardImports,
    HlmDialogImports,
    HlmDropdownMenuImports,
    HlmFieldImports,
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

  protected readonly selectedDate = signal<Date>(new Date());
  protected readonly highlightedDays = SCHEDULED_DAYS;

  // KPIs --------------------------------------------------------------------

  protected readonly kpis = computed(() => {
    const all = this.schedules();
    const active = all.filter((s) => s.status === 'active').length;
    const paused = all.filter((s) => s.status === 'paused').length;
    const nextRun = [...all]
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRunMinutes - b.nextRunMinutes)[0];
    const totalThisWeek = all.reduce((sum, s) => sum + s.runsThisWeek, 0);

    return [
      { label: 'Active schedules', value: `${active}`, icon: 'lucideCircleCheck', tone: 'positive' as const },
      { label: 'Paused', value: `${paused}`, icon: 'lucidePause', tone: paused === 0 ? ('neutral' as const) : ('warning' as const) },
      { label: 'Next run', value: nextRun?.nextRun ?? '—', icon: 'lucideClock', tone: 'neutral' as const },
      { label: 'Runs this week', value: totalThisWeek.toLocaleString(), icon: 'lucidePlay', tone: 'neutral' as const },
    ];
  });

  // Upcoming list (sorted by next run) --------------------------------------

  protected selectedScheduleForMenu: Schedule | null = null;

  protected readonly upcomingSchedules = computed<readonly Schedule[]>(() =>
    [...this.schedules()]
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRunMinutes - b.nextRunMinutes)
      .slice(0, 8),
  );

  protected readonly pausedSchedules = computed<readonly Schedule[]>(() =>
    this.schedules().filter((s) => s.status === 'paused'),
  );

  // New schedule dialog -----------------------------------------------------

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

  // Actions ------------------------------------------------------------------

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
    toast.error(`Deleted schedule "${s.name}"`, { description: 'Mock — no real data was changed' });
  }

  // Visuals -----------------------------------------------------------------

  protected frequencyIcon(freq: Frequency): string {
    switch (freq) {
      case 'hourly':
        return 'lucideClock';
      case 'daily':
        return 'lucideCalendar';
      case 'weekly':
        return 'lucideCalendar';
      case 'monthly':
        return 'lucideCalendar';
      case 'custom':
        return 'lucideTerminal';
    }
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }
}
