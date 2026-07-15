import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatChipListbox,
  MatChipOption,
  type MatChipListboxChange,
} from '@angular/material/chips';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import {
  CALENDAR_COLORS,
  CALENDAR_LABELS,
  type BookingInstance,
  type CalendarKey,
} from '../../data/types';
import { MonthGrid } from './month-grid';

const ALL_KEYS: CalendarKey[] = ['rooms', 'people', 'equipment', 'external'];

@Component({
  selector: 'cad-calendar',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatCalendar,
    MatChipListbox,
    MatChipOption,
    MonthGrid,
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
          <button mat-icon-button (click)="prev()" aria-label="Previous month">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-icon-button (click)="next()" aria-label="Next month">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <h1 class="range">{{ rangeLabel() }}</h1>
        </div>
        <div class="grid-wrap">
          <cad-month-grid
            [month]="viewDate()"
            [instances]="instances()"
            (selectDay)="onSelectDay($event)"
            (selectInstance)="onSelectInstance($event)"
          />
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
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
    .filters {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filters-label {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }
    .chip-dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 3px;
      margin-right: 0.4rem;
    }
    .main {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
    }
    .range {
      font: var(--mat-sys-title-large);
      margin: 0 0 0 0.5rem;
    }
    .grid-wrap {
      flex: 1;
      min-height: 0;
      padding: 0 1.5rem 1.5rem;
    }
    @media (max-width: 900px) {
      .page {
        grid-template-columns: 1fr;
      }
      .rail {
        display: none;
      }
    }
  `,
})
export class Calendar {
  private readonly schedule = inject(ScheduleService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly allKeys = ALL_KEYS;
  protected readonly colors = CALENDAR_COLORS;
  protected readonly labels = CALENDAR_LABELS;

  protected readonly viewDate = signal(new Date());
  protected readonly active = signal<CalendarKey[]>([...ALL_KEYS]);

  protected readonly miniKey = computed(() => format(this.viewDate(), 'yyyy-MM'));
  protected readonly rangeLabel = computed(() =>
    format(this.viewDate(), 'MMMM yyyy'),
  );

  protected readonly instances = computed<BookingInstance[]>(() => {
    void this.schedule.bookings();
    const m = this.viewDate();
    const start = startOfWeek(startOfMonth(m), { weekStartsOn: 1 });
    const end = addDays(endOfWeek(endOfMonth(m), { weekStartsOn: 1 }), 1);
    const allowed = new Set(this.active());
    return this.schedule
      .instancesFor(start, end)
      .filter((i) => allowed.has(i.calendarKey));
  });

  today(): void {
    this.viewDate.set(new Date());
  }

  prev(): void {
    this.viewDate.update((d) => subMonths(d, 1));
  }

  next(): void {
    this.viewDate.update((d) => addMonths(d, 1));
  }

  onJump(date: Date | null): void {
    if (date) this.viewDate.set(date);
  }

  onFilter(event: MatChipListboxChange): void {
    this.active.set((event.value as CalendarKey[]) ?? []);
  }

  onSelectDay(day: Date): void {
    this.snackBar.open(
      `New booking on ${format(day, 'MMM d')} lands with the wizard slice.`,
      'OK',
      { duration: 2500 },
    );
  }

  onSelectInstance(instance: BookingInstance): void {
    this.snackBar.open(
      `${instance.title} — event peek lands with a later slice.`,
      'OK',
      { duration: 2500 },
    );
  }
}
