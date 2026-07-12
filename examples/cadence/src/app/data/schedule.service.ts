import { Injectable, computed, signal } from '@angular/core';
import { format } from 'date-fns';
import { RRule, type Options, type Weekday } from 'rrule';
import { openCadenceDb } from './db';
import { SEED_RESOURCES, buildSeedBookings } from './seed';
import {
  CALENDAR_COLORS,
  type Booking,
  type BookingInstance,
  type RecurrenceRule,
  type Resource,
  type SeriesException,
} from './types';

const FREQ_MAP = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
} as const;

const WEEKDAY_MAP: Record<string, Weekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly _resources = signal<Resource[]>([]);
  private readonly _bookings = signal<Booking[]>([]);
  private readonly _ready = signal(false);

  readonly resources = this._resources.asReadonly();
  readonly bookings = this._bookings.asReadonly();
  readonly ready = this._ready.asReadonly();

  private readonly resourceMap = computed(
    () => new Map(this._resources().map((r) => [r.id, r])),
  );

  constructor() {
    void this.init();
  }

  resourceById(id: string): Resource | undefined {
    return this.resourceMap().get(id);
  }

  instancesFor(
    rangeStart: Date,
    rangeEnd: Date,
    resourceIds?: readonly string[],
  ): BookingInstance[] {
    const filter = resourceIds && resourceIds.length ? new Set(resourceIds) : null;
    const out: BookingInstance[] = [];

    for (const booking of this._bookings()) {
      if (booking.recurrence) {
        this.expandSeries(booking, rangeStart, rangeEnd, out);
      } else {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        if (start < rangeEnd && end > rangeStart) {
          out.push(this.toInstance(booking, start, end, start, false));
        }
      }
    }

    const filtered = filter ? out.filter((i) => filter.has(i.resourceId)) : out;
    filtered.sort((a, b) => a.start.getTime() - b.start.getTime());
    return filtered;
  }

  private expandSeries(
    booking: Booking,
    rangeStart: Date,
    rangeEnd: Date,
    out: BookingInstance[],
  ): void {
    const first = new Date(booking.start);
    const durationMs = new Date(booking.end).getTime() - first.getTime();
    const rule = new RRule(this.toRRuleOptions(booking.recurrence!, first));
    const occurrences = rule.between(
      toFakeUtc(rangeStart),
      toFakeUtc(rangeEnd),
      true,
    );

    for (const raw of occurrences) {
      const occStart = fromFakeUtc(raw);
      const occDate = format(occStart, 'yyyy-MM-dd');
      const exception = this.findException(booking.exceptions, occDate);

      if (exception?.type === 'cancelled') continue;

      let start = occStart;
      let end = new Date(occStart.getTime() + durationMs);
      let title = booking.title;
      let resourceId = booking.resourceId;

      if (exception?.type === 'modified' && exception.override) {
        const o = exception.override;
        if (o.start) start = new Date(o.start);
        if (o.end) end = new Date(o.end);
        if (o.title) title = o.title;
        if (o.resourceId) resourceId = o.resourceId;
      }

      out.push(
        this.toInstance(
          { ...booking, title, resourceId },
          start,
          end,
          occStart,
          true,
          !!exception,
        ),
      );
    }
  }

  private toInstance(
    booking: Booking,
    start: Date,
    end: Date,
    originalStart: Date,
    isRecurring: boolean,
    isException = false,
  ): BookingInstance {
    const occurrenceDate = format(originalStart, 'yyyy-MM-dd');
    const resource = this.resourceById(booking.resourceId);
    return {
      bookingId: booking.id,
      occurrenceId: `${booking.id}#${occurrenceDate}`,
      occurrenceDate,
      title: booking.title,
      resourceId: booking.resourceId,
      calendarKey: booking.calendarKey,
      color: resource?.color ?? CALENDAR_COLORS[booking.calendarKey],
      start,
      end,
      attendees: booking.attendees,
      isRecurring,
      isException,
    };
  }

  private toRRuleOptions(rule: RecurrenceRule, dtstart: Date): Partial<Options> {
    const options: Partial<Options> = {
      freq: FREQ_MAP[rule.freq],
      interval: rule.interval,
      dtstart: toFakeUtc(dtstart),
    };
    if (rule.byWeekday?.length) {
      options.byweekday = rule.byWeekday.map((w) => WEEKDAY_MAP[w]);
    }
    if (rule.byMonthday?.length) {
      options.bymonthday = rule.byMonthday;
    }
    if (rule.count != null) {
      options.count = rule.count;
    }
    if (rule.until) {
      options.until = toFakeUtc(new Date(rule.until));
    }
    return options;
  }

  private findException(
    exceptions: SeriesException[],
    occurrenceDate: string,
  ): SeriesException | undefined {
    return exceptions.find((e) => e.occurrenceDate === occurrenceDate);
  }

  async addBooking(booking: Booking): Promise<void> {
    const db = await openCadenceDb();
    await db.put('bookings', booking);
    this._bookings.update((list) => [...list, booking]);
  }

  async updateBooking(booking: Booking): Promise<void> {
    const next = { ...booking, updatedAt: Date.now() };
    const db = await openCadenceDb();
    await db.put('bookings', next);
    this._bookings.update((list) =>
      list.map((b) => (b.id === next.id ? next : b)),
    );
  }

  async deleteBooking(id: string): Promise<void> {
    const db = await openCadenceDb();
    await db.delete('bookings', id);
    this._bookings.update((list) => list.filter((b) => b.id !== id));
  }

  async addException(
    bookingId: string,
    exception: SeriesException,
  ): Promise<void> {
    const booking = this._bookings().find((b) => b.id === bookingId);
    if (!booking) return;
    const exceptions = [
      ...booking.exceptions.filter(
        (e) => e.occurrenceDate !== exception.occurrenceDate,
      ),
      exception,
    ];
    await this.updateBooking({ ...booking, exceptions });
  }

  private async init(): Promise<void> {
    const db = await openCadenceDb();

    let resources = await db.getAll('resources');
    if (resources.length === 0) {
      const tx = db.transaction('resources', 'readwrite');
      await Promise.all(SEED_RESOURCES.map((r) => tx.store.put(r)));
      await tx.done;
      resources = SEED_RESOURCES;
    }

    let bookings = await db.getAll('bookings');
    if (bookings.length === 0) {
      bookings = buildSeedBookings(new Date());
      const tx = db.transaction('bookings', 'readwrite');
      await Promise.all(bookings.map((b) => tx.store.put(b)));
      await tx.done;
    }

    this._resources.set(resources);
    this._bookings.set(bookings);
    this._ready.set(true);
  }
}

function toFakeUtc(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ),
  );
}

function fromFakeUtc(d: Date): Date {
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
}
