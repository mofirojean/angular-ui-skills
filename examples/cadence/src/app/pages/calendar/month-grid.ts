import { DatePipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import type { BookingInstance } from '../../data/types';

const MAX_CHIPS = 3;

@Component({
  selector: 'cad-month-grid',
  imports: [DatePipe, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="month">
      <div class="dow-row">
        @for (d of weekdayLabels(); track d) {
          <span class="dow">{{ d }}</span>
        }
      </div>
      <div class="weeks">
        @for (week of weeks(); track week[0].getTime()) {
          <div class="week">
            @for (day of week; track day.getTime()) {
              <div
                class="cell"
                [class.other-month]="!inMonth(day)"
                [class.today]="isToday(day)"
                (click)="selectDay.emit(day)"
              >
                <div class="cell-head">
                  <span class="num">{{ day | date: 'd' }}</span>
                </div>
                <div class="chips">
                  @for (ev of visibleFor(day); track ev.occurrenceId) {
                    <button
                      class="chip"
                      [style.--chip]="ev.color"
                      (click)="onChip(ev, $event)"
                    >
                      <span class="dot"></span>
                      <span class="chip-time">{{ ev.start | date: 'HH:mm' }}</span>
                      <span class="chip-title">{{ ev.title }}</span>
                    </button>
                  }
                  @if (overflowFor(day); as extra) {
                    <button
                      class="more"
                      cdkOverlayOrigin
                      #origin="cdkOverlayOrigin"
                      (click)="openMore(day, origin, $event)"
                    >
                      +{{ extra }} more
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="moreOrigin()!"
      [cdkConnectedOverlayOpen]="!!moreDay()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="closeMore()"
      (detach)="closeMore()"
    >
      @if (moreDay(); as day) {
        <div class="more-popover">
          <div class="more-head">{{ day | date: 'EEEE, MMM d' }}</div>
          @for (ev of eventsFor(day); track ev.occurrenceId) {
            <button class="more-row" (click)="onChip(ev, $event); closeMore()">
              <span class="dot" [style.--chip]="ev.color"></span>
              <span class="more-time">{{ ev.start | date: 'HH:mm' }}</span>
              <span class="more-title">{{ ev.title }}</span>
              <span class="more-res">{{ resourceName(ev.resourceId) }}</span>
            </button>
          }
        </div>
      }
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .month {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 10px;
      overflow: hidden;
      background: var(--mat-sys-surface);
    }
    .dow-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .dow {
      padding: 0.5rem 0.75rem;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      text-align: left;
    }
    .weeks {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
    .week {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      flex: 1;
      min-height: 0;
    }
    .cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.3rem;
      border-right: 1px solid var(--mat-sys-outline-variant);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      min-height: 0;
      overflow: hidden;
      cursor: pointer;
    }
    .week:last-child .cell {
      border-bottom: none;
    }
    .cell:nth-child(7n) {
      border-right: none;
    }
    .cell:hover {
      background: var(--mat-sys-surface-container-low);
    }
    .cell.other-month {
      background: var(--mat-sys-surface-container-lowest);
    }
    .cell.other-month .num {
      color: var(--mat-sys-outline);
    }
    .cell-head {
      display: flex;
      justify-content: flex-start;
    }
    .num {
      display: grid;
      place-items: center;
      min-width: 1.5rem;
      height: 1.5rem;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface);
      border-radius: 50%;
    }
    .today .num {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
    .chips {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .chip {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 1px 0.35rem;
      border: none;
      border-radius: 4px;
      background: color-mix(in srgb, var(--chip) 14%, transparent);
      cursor: pointer;
      text-align: left;
      overflow: hidden;
    }
    .chip:hover {
      background: color-mix(in srgb, var(--chip) 24%, transparent);
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 2px;
      flex-shrink: 0;
      background: var(--chip);
    }
    .chip-time {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    .chip-title {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .more {
      align-self: flex-start;
      border: none;
      background: transparent;
      padding: 0 0.35rem;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      cursor: pointer;
    }
    .more:hover {
      color: var(--mat-sys-primary);
    }
    .more-popover {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 240px;
      max-width: 320px;
      padding: 0.6rem;
      border-radius: 10px;
      background: var(--mat-sys-surface-container-high);
      box-shadow: var(--mat-sys-level3);
    }
    .more-head {
      font: var(--mat-sys-title-small);
      color: var(--mat-sys-on-surface);
      padding: 0.15rem 0.5rem 0.4rem;
    }
    .more-row {
      display: grid;
      grid-template-columns: auto auto 1fr;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.5rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
    }
    .more-row:hover {
      background: var(--mat-sys-surface-container-highest);
    }
    .more-time {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .more-title {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface);
    }
    .more-res {
      grid-column: 3;
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      text-align: right;
    }
  `,
})
export class MonthGrid {
  private readonly schedule = inject(ScheduleService);

  readonly month = input.required<Date>();
  readonly instances = input.required<BookingInstance[]>();
  readonly weekStartsOn = input<0 | 1>(1);
  readonly selectDay = output<Date>();
  readonly selectInstance = output<BookingInstance>();

  protected readonly isToday = isToday;

  protected readonly weekdayLabels = computed(() =>
    (this.weeks()[0] ?? []).map((d) => format(d, 'EEE')),
  );

  protected readonly moreDay = signal<Date | null>(null);
  protected readonly moreOrigin = signal<CdkOverlayOrigin | null>(null);

  private readonly byDay = computed(() => {
    const map = new Map<string, BookingInstance[]>();
    for (const i of this.instances()) {
      const key = format(i.start, 'yyyy-MM-dd');
      (map.get(key) ?? map.set(key, []).get(key)!).push(i);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start.getTime() - b.start.getTime());
    }
    return map;
  });

  protected readonly weeks = computed<Date[][]>(() => {
    const m = this.month();
    const wso = this.weekStartsOn();
    const start = startOfWeek(startOfMonth(m), { weekStartsOn: wso });
    const end = endOfWeek(endOfMonth(m), { weekStartsOn: wso });
    const days = eachDayOfInterval({ start, end });
    const out: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      out.push(days.slice(i, i + 7));
    }
    return out;
  });

  inMonth(day: Date): boolean {
    return isSameMonth(day, this.month());
  }

  eventsFor(day: Date): BookingInstance[] {
    return this.byDay().get(format(day, 'yyyy-MM-dd')) ?? [];
  }

  visibleFor(day: Date): BookingInstance[] {
    return this.eventsFor(day).slice(0, MAX_CHIPS);
  }

  overflowFor(day: Date): number {
    return Math.max(0, this.eventsFor(day).length - MAX_CHIPS);
  }

  resourceName(id: string): string {
    return this.schedule.resourceById(id)?.name ?? 'Unknown';
  }

  onChip(instance: BookingInstance, event: Event): void {
    event.stopPropagation();
    this.selectInstance.emit(instance);
  }

  openMore(day: Date, origin: CdkOverlayOrigin, event: Event): void {
    event.stopPropagation();
    this.moreOrigin.set(origin);
    this.moreDay.set(day);
  }

  closeMore(): void {
    this.moreDay.set(null);
  }
}
