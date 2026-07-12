import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import type { BookingInstance } from '../../data/types';

interface DayGroup {
  date: Date;
  label: string;
  instances: BookingInstance[];
}

@Component({
  selector: 'cad-calendar',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header>
        <span class="eyebrow">Schedule kernel · verification</span>
        <h1>Next two weeks</h1>
        <p>
          Temporary Phase 2 surface. Every card below is a concrete instance
          expanded by <code>ScheduleService.instancesFor()</code>, recurring
          series included, per-occurrence exceptions applied. The custom
          calendar grid replaces this next.
        </p>
      </header>

      @if (!schedule.ready()) {
        <p class="muted">Loading schedule…</p>
      } @else {
        <div class="summary">
          <span class="pill">{{ total() }} instances</span>
          <span class="pill">{{ recurringCount() }} recurring</span>
          <span class="pill">{{ exceptionCount() }} exceptions</span>
        </div>
        <div class="grid">
          @for (day of days(); track day.label) {
            <div class="day">
              <div class="day-head">
                <span class="dow">{{ day.label }}</span>
                <span class="count">{{ day.instances.length }}</span>
              </div>
              @for (i of day.instances; track i.occurrenceId) {
                <div class="event" [style.border-left-color]="i.color">
                  <div class="time">
                    {{ i.start | date: 'HH:mm' }}–{{ i.end | date: 'HH:mm' }}
                  </div>
                  <div class="title">{{ i.title }}</div>
                  <div class="meta">
                    <span>{{ resourceName(i.resourceId) }}</span>
                    @if (i.isRecurring) {
                      <span class="badge recur">↻</span>
                    }
                    @if (i.isException) {
                      <span class="badge exc">edited</span>
                    }
                  </div>
                </div>
              } @empty {
                <span class="empty">—</span>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem 2.5rem;
    }
    .eyebrow {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--mat-sys-primary);
    }
    h1 {
      font: var(--mat-sys-headline-medium);
      margin: 0.25rem 0 0;
    }
    p {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      max-width: 70ch;
      margin: 0;
    }
    code {
      font-family: ui-monospace, monospace;
      background: var(--mat-sys-surface-container);
      padding: 0 0.25rem;
      border-radius: 4px;
    }
    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
    .summary {
      display: flex;
      gap: 0.5rem;
    }
    .pill {
      font: var(--mat-sys-label-medium);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface-variant);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .day {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 120px;
    }
    .day-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .dow {
      font: var(--mat-sys-title-small);
    }
    .count {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .event {
      border: 1px solid var(--mat-sys-outline-variant);
      border-left: 3px solid;
      border-radius: 6px;
      padding: 0.4rem 0.5rem;
      background: var(--mat-sys-surface-container-low);
    }
    .time {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .title {
      font: var(--mat-sys-body-small);
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.15rem;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .badge {
      font-size: 0.65rem;
      padding: 0 0.3rem;
      border-radius: 4px;
      line-height: 1.3;
    }
    .badge.recur {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }
    .badge.exc {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .empty {
      color: var(--mat-sys-outline);
      text-align: center;
    }
    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Calendar {
  protected readonly schedule = inject(ScheduleService);

  private readonly window = computed(() => {
    void this.schedule.bookings();
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    return { start, end };
  });

  private readonly instances = computed(() => {
    const { start, end } = this.window();
    return this.schedule.instancesFor(start, addDays(end, 1));
  });

  protected readonly days = computed<DayGroup[]>(() => {
    const { start, end } = this.window();
    const all = this.instances();
    return eachDayOfInterval({ start, end }).map((date) => ({
      date,
      label: format(date, 'EEE d'),
      instances: all.filter((i) => isSameDay(i.start, date)),
    }));
  });

  protected readonly total = computed(() => this.instances().length);
  protected readonly recurringCount = computed(
    () => this.instances().filter((i) => i.isRecurring).length,
  );
  protected readonly exceptionCount = computed(
    () => this.instances().filter((i) => i.isException).length,
  );

  resourceName(id: string): string {
    return this.schedule.resourceById(id)?.name ?? 'Unknown';
  }
}
