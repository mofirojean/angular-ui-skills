import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { addDays, format } from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import {
  CALENDAR_LABELS,
  type BookingInstance,
  type CalendarKey,
} from '../../data/types';

const CALENDAR_KEYS: CalendarKey[] = ['rooms', 'people', 'equipment', 'external'];

const COLUMNS = ['title', 'resource', 'when', 'repeats', 'status', 'actions'];

@Component({
  selector: 'cad-bookings',
  imports: [
    MatIconButton,
    MatChipsModule,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatIcon,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSelect,
    MatOption,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="head">
        <h1 class="title">Bookings</h1>
        <p class="subtitle">
          Every upcoming hold across your calendars for the next 60 days.
        </p>
      </header>

      <div class="filters">
        <mat-form-field appearance="outline" class="search">
          <mat-label>Search</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            type="text"
            placeholder="Title or resource"
            [value]="query()"
            (input)="onQuery($event)"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="pick">
          <mat-label>Resource</mat-label>
          <mat-select
            [value]="resourceId()"
            (selectionChange)="resourceId.set($event.value)"
          >
            <mat-option value="all">All resources</mat-option>
            @for (r of schedule.resources(); track r.id) {
              <mat-option [value]="r.id">{{ r.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="pick">
          <mat-label>Calendar</mat-label>
          <mat-select
            [value]="calendarKey()"
            (selectionChange)="calendarKey.set($event.value)"
          >
            <mat-option value="all">All calendars</mat-option>
            @for (key of calendarKeys; track key) {
              <mat-option [value]="key">{{ labels[key] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (!schedule.ready()) {
        <p class="loading">Loading bookings…</p>
      } @else if (filtered().length === 0) {
        <div class="empty">
          <mat-icon aria-hidden="true">event_busy</mat-icon>
          <p class="empty-title">No bookings match</p>
          <p class="empty-sub">Try clearing the search or a filter.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered()" class="table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let row">
                <div class="title-cell">
                  <span class="dot" [style.background]="row.color"></span>
                  <span class="cell-strong">{{ row.title }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="resource">
              <th mat-header-cell *matHeaderCellDef>Resource</th>
              <td mat-cell *matCellDef="let row">
                {{ resourceName(row.resourceId) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="when">
              <th mat-header-cell *matHeaderCellDef>When</th>
              <td mat-cell *matCellDef="let row">
                {{ formatWhen(row.start) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="repeats">
              <th mat-header-cell *matHeaderCellDef>Repeats</th>
              <td mat-cell *matCellDef="let row">
                @if (row.isRecurring) {
                  <span class="chips">
                    <mat-chip class="chip chip-repeat" [disableRipple]="true">
                      <mat-icon matChipAvatar>autorenew</mat-icon>
                      Repeats
                    </mat-chip>
                    @if (row.isException) {
                      <mat-chip class="chip chip-edited" [disableRipple]="true">
                        Edited
                      </mat-chip>
                    }
                  </span>
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="chip chip-status" [disableRipple]="true">
                  Confirmed
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef aria-label="Actions"></th>
              <td mat-cell *matCellDef="let row">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="rowMenu"
                  aria-label="Booking actions"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #rowMenu="matMenu">
                  <button mat-menu-item (click)="onEdit()">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="onCancel()">
                    <mat-icon>cancel</mat-icon>
                    <span>Cancel</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        <p class="count">
          {{ filtered().length }} of {{ master().length }} bookings
        </p>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 1120px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .head {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .title {
      font: var(--mat-sys-title-large);
      margin: 0;
      color: var(--mat-sys-on-surface);
    }
    .subtitle {
      font: var(--mat-sys-body-medium);
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }
    .search {
      flex: 1 1 280px;
      min-width: 220px;
    }
    .pick {
      flex: 0 1 200px;
      min-width: 160px;
    }
    .filters mat-icon[matPrefix] {
      margin: 0 0.5rem 0 0.25rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .table-wrap {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      overflow: auto;
      background: var(--mat-sys-surface);
    }
    .table {
      width: 100%;
      background: transparent;
    }
    th.mat-mdc-header-cell {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-container);
    }
    td.mat-mdc-cell {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
      border-bottom-color: var(--mat-sys-outline-variant);
    }
    tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: var(--mat-sys-surface-container-low);
    }
    tr.mat-mdc-row:last-child td.mat-mdc-cell {
      border-bottom: none;
    }
    .title-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .cell-strong {
      font-weight: 500;
    }
    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
    .chips {
      display: inline-flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .chip {
      --mdc-chip-container-height: 24px;
      font: var(--mat-sys-label-small);
    }
    .chip mat-icon[matChipAvatar] {
      font-size: 15px;
      width: 15px;
      height: 15px;
      color: var(--mat-sys-primary);
    }
    .chip-repeat {
      --mdc-chip-label-text-color: var(--mat-sys-primary);
      --mdc-chip-flat-outline-color: var(--mat-sys-outline-variant);
    }
    .chip-edited {
      --mdc-chip-label-text-color: var(--mat-sys-on-surface-variant);
      --mdc-chip-flat-outline-color: var(--mat-sys-outline-variant);
    }
    .chip-status {
      --mdc-chip-flat-container-color: var(--mat-sys-secondary-container);
      --mdc-chip-label-text-color: var(--mat-sys-on-secondary-container);
      --mdc-chip-flat-outline-color: transparent;
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 4rem 1rem;
      text-align: center;
      border: 1px dashed var(--mat-sys-outline-variant);
      border-radius: 12px;
      color: var(--mat-sys-on-surface-variant);
    }
    .empty mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.7;
    }
    .empty-title {
      font: var(--mat-sys-title-medium);
      margin: 0;
      color: var(--mat-sys-on-surface);
    }
    .empty-sub {
      font: var(--mat-sys-body-medium);
      margin: 0;
    }
    .loading {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      padding: 2rem 0;
    }
    .count {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
    }
  `,
})
export class Bookings {
  protected readonly schedule = inject(ScheduleService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = COLUMNS;
  protected readonly calendarKeys = CALENDAR_KEYS;
  protected readonly labels = CALENDAR_LABELS;

  protected readonly query = signal('');
  protected readonly resourceId = signal<string>('all');
  protected readonly calendarKey = signal<CalendarKey | 'all'>('all');

  protected readonly master = computed<BookingInstance[]>(() => {
    void this.schedule.bookings();
    const now = new Date();
    return this.schedule
      .instancesFor(now, addDays(now, 60))
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  protected readonly filtered = computed<BookingInstance[]>(() => {
    const q = this.query().trim().toLowerCase();
    const resId = this.resourceId();
    const cal = this.calendarKey();
    return this.master().filter((i) => {
      if (resId !== 'all' && i.resourceId !== resId) return false;
      if (cal !== 'all' && i.calendarKey !== cal) return false;
      if (q) {
        const name = this.resourceName(i.resourceId).toLowerCase();
        if (!i.title.toLowerCase().includes(q) && !name.includes(q)) {
          return false;
        }
      }
      return true;
    });
  });

  protected resourceName(id: string): string {
    return this.schedule.resourceById(id)?.name ?? 'Unassigned';
  }

  protected formatWhen(start: Date): string {
    return format(start, 'EEE d MMM, HH:mm');
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onEdit(): void {
    this.snackBar.open('Editing opens the booking wizard.', 'OK', {
      duration: 3000,
    });
  }

  onCancel(): void {
    this.snackBar.open('Booking cancelled', 'Undo', { duration: 4000 });
  }
}
