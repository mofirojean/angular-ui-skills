import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { format, isToday } from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import type { BookingInstance } from '../../data/types';

interface AgendaDay {
  key: string;
  date: Date;
  isToday: boolean;
  items: BookingInstance[];
}

@Component({
  selector: 'cad-agenda-view',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="agenda">
      @if (groups().length === 0) {
        <div class="empty">
          <span>Nothing scheduled in this range.</span>
        </div>
      }
      @for (group of groups(); track group.key) {
        <div class="day">
          <div class="day-rail" [class.today]="group.isToday">
            <span class="dow">{{ group.date | date: 'EEE' }}</span>
            <span class="dnum">{{ group.date | date: 'd' }}</span>
            <span class="mon">{{ group.date | date: 'MMM' }}</span>
          </div>
          <div class="rows">
            @for (item of group.items; track item.occurrenceId) {
              <button class="row" (click)="selectInstance.emit(item)">
                <span class="time">
                  {{ item.start | date: 'HH:mm' }}–{{ item.end | date: 'HH:mm' }}
                </span>
                <span class="dot" [style.background]="item.color"></span>
                <span class="title">{{ item.title }}</span>
                <span class="res">{{ resourceName(item.resourceId) }}</span>
                @if (item.isRecurring) {
                  <span class="badge">↻</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .agenda {
      height: 100%;
      overflow-y: auto;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 10px;
      background: var(--mat-sys-surface);
    }
    .empty {
      display: grid;
      place-items: center;
      min-height: 240px;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-medium);
    }
    .day {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .day:last-child { border-bottom: none; }
    .day-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 0.35rem;
    }
    .day-rail .dow {
      font: var(--mat-sys-label-small);
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }
    .day-rail .dnum { font: var(--mat-sys-headline-small); }
    .day-rail .mon {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .day-rail.today .dnum { color: var(--mat-sys-primary); }
    .rows { display: flex; flex-direction: column; gap: 0.25rem; }
    .row {
      display: grid;
      grid-template-columns: 96px 10px 1fr auto auto;
      align-items: center;
      gap: 0.6rem;
      padding: 0.5rem 0.6rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
    }
    .row:hover { background: var(--mat-sys-surface-container-low); }
    .time {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .title { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface); }
    .res {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .badge { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class AgendaView {
  private readonly schedule = inject(ScheduleService);

  readonly instances = input.required<BookingInstance[]>();
  readonly selectInstance = output<BookingInstance>();

  protected readonly groups = computed<AgendaDay[]>(() => {
    const map = new Map<string, AgendaDay>();
    for (const i of this.instances()) {
      const key = format(i.start, 'yyyy-MM-dd');
      let group = map.get(key);
      if (!group) {
        group = {
          key,
          date: new Date(i.start.getFullYear(), i.start.getMonth(), i.start.getDate()),
          isToday: isToday(i.start),
          items: [],
        };
        map.set(key, group);
      }
      group.items.push(i);
    }
    const out = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
    for (const g of out) g.items.sort((a, b) => a.start.getTime() - b.start.getTime());
    return out;
  });

  resourceName(id: string): string {
    return this.schedule.resourceById(id)?.name ?? 'Unknown';
  }
}
