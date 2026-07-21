import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import {
  MatChipListbox,
  MatChipOption,
  type MatChipListboxChange,
} from '@angular/material/chips';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import {
  CALENDAR_COLORS,
  CALENDAR_LABELS,
  type BookingInstance,
  type CalendarKey,
} from '../../data/types';
import { AgendaView } from './agenda-view';
import { BookingWizard } from './booking-wizard';
import { EventDetail } from './event-detail';
import { MonthGrid } from './month-grid';
import { TimeGrid } from './time-grid';

const ALL_KEYS: CalendarKey[] = ['rooms', 'people', 'equipment', 'external'];
type View = 'month' | 'week' | 'day' | 'agenda';

@Component({
  selector: 'cad-calendar',
  imports: [
    MatButton,
    MatIconButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIcon,
    MatCalendar,
    MatChipListbox,
    MatChipOption,
    AgendaView,
    MonthGrid,
    TimeGrid,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <aside class="rail">
        @for (key of [miniKey()]; track key) {
          <mat-calendar
            class="mini"
            [startAt]="viewDate()"
            [selected]="viewDate()"
            (selectedChange)="onJump($event)"
          />
        }
        <div class="filters">
          <span class="filters-label">Calendars</span>
          <mat-chip-listbox
            [multiple]="true"
            [value]="active()"
            (change)="onFilter($event)"
            aria-label="Filter calendars"
          >
            @for (key of allKeys; track key) {
              <mat-chip-option [value]="key" [selected]="active().includes(key)">
                <span class="chip-dot" [style.background]="colors[key]"></span>
                {{ labels[key] }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        </div>
      </aside>

      <div class="main">
        <div class="toolbar">
          <button mat-stroked-button (click)="today()">Today</button>
          <button mat-icon-button (click)="prev()" aria-label="Previous">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button (click)="next()" aria-label="Next">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <h1 class="range">{{ rangeLabel() }}</h1>
          <span class="grow"></span>
          <mat-button-toggle-group
            [value]="view()"
            (change)="view.set($event.value)"
            hideSingleSelectionIndicator
            aria-label="Calendar view"
          >
            <mat-button-toggle value="month">Month</mat-button-toggle>
            <mat-button-toggle value="week">Week</mat-button-toggle>
            <mat-button-toggle value="day">Day</mat-button-toggle>
            <mat-button-toggle value="agenda">Agenda</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
        <div class="grid-wrap">
          @switch (view()) {
            @case ('month') {
              <cad-month-grid
                [month]="viewDate()"
                [instances]="instances()"
                (selectDay)="onSelectDay($event)"
                (selectInstance)="onSelectInstance($event)"
              />
            }
            @case ('agenda') {
              <cad-agenda-view
                [instances]="instances()"
                (selectInstance)="onSelectInstance($event)"
              />
            }
            @default {
              <cad-time-grid
                [days]="timeGridDays()"
                [instances]="instances()"
                (selectSlot)="onSelectSlot($event)"
                (selectInstance)="onSelectInstance($event)"
              />
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .page {
      display: grid;
      grid-template-columns: 256px 1fr;
      height: 100%;
      min-height: 0;
    }
    .rail {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border-right: 1px solid var(--mat-sys-outline-variant);
      overflow-y: auto;
    }
    .mini {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 10px;
      padding: 0.25rem;
    }
    .filters { display: flex; flex-direction: column; gap: 0.5rem; }
    .filters-label {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }
    .chip-dot {
      display: inline-block;
      width: 9px; height: 9px;
      border-radius: 3px;
      margin-right: 0.4rem;
    }
    .main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
    }
    .range { font: var(--mat-sys-title-large); margin: 0 0 0 0.5rem; }
    .grow { flex: 1; }
    .grid-wrap { flex: 1; min-height: 0; padding: 0 1.5rem 1.5rem; }
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .rail { display: none; }
    }
  `,
})
export class Calendar {
  private readonly schedule = inject(ScheduleService);
  private readonly dialog = inject(MatDialog);

  protected readonly allKeys = ALL_KEYS;
  protected readonly colors = CALENDAR_COLORS;
  protected readonly labels = CALENDAR_LABELS;

  protected readonly viewDate = signal(new Date());
  protected readonly view = signal<View>('month');
  protected readonly active = signal<CalendarKey[]>([...ALL_KEYS]);

  protected readonly miniKey = computed(() => format(this.viewDate(), 'yyyy-MM'));

  private readonly range = computed(() => {
    const d = this.viewDate();
    switch (this.view()) {
      case 'week':
        return {
          start: startOfWeek(d, { weekStartsOn: 1 }),
          end: endOfWeek(d, { weekStartsOn: 1 }),
        };
      case 'day':
        return { start: startOfDay(d), end: startOfDay(d) };
      default:
        return {
          start: startOfWeek(startOfMonth(d), { weekStartsOn: 1 }),
          end: endOfWeek(endOfMonth(d), { weekStartsOn: 1 }),
        };
    }
  });

  protected readonly rangeLabel = computed(() => {
    const d = this.viewDate();
    switch (this.view()) {
      case 'day':
        return format(d, 'EEEE, MMM d');
      case 'week': {
        const { start, end } = this.range();
        const left = format(start, 'MMM d');
        const right = isSameMonth(start, end)
          ? format(end, 'd, yyyy')
          : format(end, 'MMM d, yyyy');
        return `${left} – ${right}`;
      }
      default:
        return format(d, 'MMMM yyyy');
    }
  });

  protected readonly timeGridDays = computed<Date[]>(() => {
    if (this.view() === 'day') return [startOfDay(this.viewDate())];
    const { start, end } = this.range();
    return eachDayOfInterval({ start, end });
  });

  protected readonly instances = computed<BookingInstance[]>(() => {
    void this.schedule.bookings();
    const { start, end } = this.range();
    const allowed = new Set(this.active());
    return this.schedule
      .instancesFor(start, addDays(end, 1))
      .filter((i) => allowed.has(i.calendarKey));
  });

  today(): void {
    this.viewDate.set(new Date());
  }

  prev(): void {
    this.viewDate.update((d) => this.shift(d, -1));
  }

  next(): void {
    this.viewDate.update((d) => this.shift(d, 1));
  }

  private shift(d: Date, dir: number): Date {
    switch (this.view()) {
      case 'week':
        return dir > 0 ? addDays(d, 7) : subDays(d, 7);
      case 'day':
        return dir > 0 ? addDays(d, 1) : subDays(d, 1);
      default:
        return dir > 0 ? addMonths(d, 1) : subMonths(d, 1);
    }
  }

  onJump(date: Date | null): void {
    if (date) this.viewDate.set(date);
  }

  onFilter(event: MatChipListboxChange): void {
    this.active.set((event.value as CalendarKey[]) ?? []);
  }

  onSelectDay(day: Date): void {
    this.openWizard(day);
  }

  onSelectSlot(slot: Date): void {
    this.openWizard(slot);
  }

  private openWizard(start: Date): void {
    this.dialog.open(BookingWizard, {
      data: { start },
      width: '580px',
      maxWidth: '95vw',
      autoFocus: 'dialog',
    });
  }

  onSelectInstance(instance: BookingInstance): void {
    this.dialog.open(EventDetail, {
      data: {
        instance,
        resourceName: this.schedule.resourceById(instance.resourceId)?.name ?? 'Unknown',
      },
      autoFocus: 'dialog',
    });
  }
}
