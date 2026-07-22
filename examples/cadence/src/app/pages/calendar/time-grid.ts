import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { format, getHours, getMinutes, isSameDay, isToday, set } from 'date-fns';
import type { BookingInstance } from '../../data/types';

const HOUR_HEIGHT = 48;
const PX_PER_MIN = HOUR_HEIGHT / 60;
const MIN_HEIGHT = 22;

interface Placed {
  ev: BookingInstance;
  top: number;
  height: number;
  left: number;
  width: number;
}

interface Column {
  date: Date;
  isToday: boolean;
  placed: Placed[];
}

@Component({
  selector: 'cad-time-grid',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tg">
      <div class="tg-head" [style.grid-template-columns]="headCols()">
        <div class="corner"></div>
        @for (col of columns(); track col.date.getTime()) {
          <div class="day-head" [class.today]="col.isToday">
            <span class="dow">{{ col.date | date: 'EEE' }}</span>
            <span class="dnum">{{ col.date | date: 'd' }}</span>
          </div>
        }
      </div>
      <div class="tg-scroll" #scroll>
        <div class="tg-body" [style.grid-template-columns]="headCols()">
          <div class="gutter" [style.height.px]="dayHeight">
            @for (h of hours; track h) {
              <span class="hour" [style.top.px]="h * hourHeight">
                {{ h === 0 ? '' : hourLabel(h) }}
              </span>
            }
          </div>
          @for (col of columns(); track col.date.getTime()) {
            <div
              class="day-col"
              [style.height.px]="dayHeight"
              (click)="onSlot(col.date, $event)"
            >
              @if (col.isToday) {
                <div class="now" [style.top.px]="nowTop()"></div>
              }
              @for (p of col.placed; track p.ev.occurrenceId) {
                <button
                  class="ev"
                  [style.top.px]="p.top"
                  [style.height.px]="p.height"
                  [style.left.%]="p.left"
                  [style.width.%]="p.width"
                  [style.--chip]="p.ev.color"
                  (click)="onEvent(p.ev, $event)"
                >
                  <span class="ev-time">{{ p.ev.start | date: 'HH:mm' }}</span>
                  <span class="ev-title">{{ p.ev.title }}</span>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .tg {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 10px;
      overflow: hidden;
      background: var(--mat-sys-surface);
    }
    .tg-head {
      display: grid;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .corner { border-right: 1px solid var(--mat-sys-outline-variant); }
    .day-head {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      border-right: 1px solid var(--mat-sys-outline-variant);
    }
    .day-head:last-child { border-right: none; }
    .day-head .dow {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .day-head .dnum { font: var(--mat-sys-title-medium); }
    .day-head.today .dnum { color: var(--mat-sys-primary); }
    .tg-scroll { flex: 1; overflow-y: auto; min-height: 0; }
    .tg-body { display: grid; }
    .gutter { position: relative; border-right: 1px solid var(--mat-sys-outline-variant); }
    .hour {
      position: absolute;
      right: 0.4rem;
      transform: translateY(-50%);
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .day-col {
      position: relative;
      border-right: 1px solid var(--mat-sys-outline-variant);
      background: repeating-linear-gradient(
        var(--mat-sys-surface) 0,
        var(--mat-sys-surface) 47px,
        var(--mat-sys-outline-variant) 47px,
        var(--mat-sys-outline-variant) 48px
      );
    }
    .day-col:last-child { border-right: none; }
    .now {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--mat-sys-error);
      z-index: 2;
    }
    .now::before {
      content: '';
      position: absolute;
      left: -1px;
      top: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--mat-sys-error);
    }
    .ev {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 1px;
      padding: 2px 5px;
      border: none;
      border-left: 3px solid var(--chip);
      border-radius: 4px;
      background: color-mix(in srgb, var(--chip) 16%, var(--mat-sys-surface));
      cursor: pointer;
      overflow: hidden;
      text-align: left;
      z-index: 1;
    }
    .ev:hover { background: color-mix(in srgb, var(--chip) 26%, var(--mat-sys-surface)); }
    .ev-time {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
    .ev-title {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class TimeGrid implements AfterViewInit {
  readonly days = input.required<Date[]>();
  readonly instances = input.required<BookingInstance[]>();
  readonly scrollToHour = input(7);
  readonly selectSlot = output<Date>();
  readonly selectInstance = output<BookingInstance>();

  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);
  protected readonly hourHeight = HOUR_HEIGHT;
  protected readonly dayHeight = HOUR_HEIGHT * 24;

  private readonly scroll = viewChild<ElementRef<HTMLElement>>('scroll');

  protected readonly headCols = computed(
    () => `56px repeat(${this.days().length}, 1fr)`,
  );

  protected readonly columns = computed<Column[]>(() =>
    this.days().map((date) => ({
      date,
      isToday: isToday(date),
      placed: layoutDay(
        this.instances().filter((i) => isSameDay(i.start, date)),
      ),
    })),
  );

  protected readonly nowTop = computed(() => {
    const now = new Date();
    return (getHours(now) * 60 + getMinutes(now)) * PX_PER_MIN;
  });

  ngAfterViewInit(): void {
    const el = this.scroll()?.nativeElement;
    if (el) el.scrollTop = this.scrollToHour() * HOUR_HEIGHT;
  }

  hourLabel(h: number): string {
    return format(set(new Date(), { hours: h, minutes: 0 }), 'HH:mm');
  }

  onEvent(ev: BookingInstance, event: Event): void {
    event.stopPropagation();
    this.selectInstance.emit(ev);
  }

  onSlot(date: Date, event: MouseEvent): void {
    const col = event.currentTarget as HTMLElement;
    const y = event.clientY - col.getBoundingClientRect().top;
    const minutes = Math.max(0, Math.round(y / PX_PER_MIN / 15) * 15);
    this.selectSlot.emit(
      set(date, { hours: 0, minutes, seconds: 0, milliseconds: 0 }),
    );
  }
}

function layoutDay(events: BookingInstance[]): Placed[] {
  const sorted = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime(),
  );
  const placed: Placed[] = [];
  let cluster: BookingInstance[] = [];
  let clusterEnd = 0;

  const flush = () => {
    if (!cluster.length) return;
    const lanes: number[] = [];
    const laneOf = new Map<BookingInstance, number>();
    for (const ev of cluster) {
      let lane = lanes.findIndex((end) => end <= ev.start.getTime());
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(0);
      }
      lanes[lane] = ev.end.getTime();
      laneOf.set(ev, lane);
    }
    const count = lanes.length;
    for (const ev of cluster) {
      const lane = laneOf.get(ev)!;
      const startMin = getHours(ev.start) * 60 + getMinutes(ev.start);
      const endMin = getHours(ev.end) * 60 + getMinutes(ev.end);
      placed.push({
        ev,
        top: startMin * PX_PER_MIN,
        height: Math.max((endMin - startMin) * PX_PER_MIN, MIN_HEIGHT),
        left: (lane / count) * 100,
        width: (1 / count) * 100,
      });
    }
    cluster = [];
    clusterEnd = 0;
  };

  for (const ev of sorted) {
    if (cluster.length && ev.start.getTime() >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.end.getTime());
  }
  flush();
  return placed;
}
