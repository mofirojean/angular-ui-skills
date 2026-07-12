export type ResourceType = 'room' | 'person' | 'equipment';

export type CalendarKey = 'rooms' | 'people' | 'equipment' | 'external';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  calendarKey: CalendarKey;
  color: string;
  capacity: number | null;
  floor: string | null;
  equipment: string[];
}

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RecurrenceRule {
  freq: Frequency;
  interval: number;
  byWeekday?: Weekday[];
  byMonthday?: number[];
  count?: number | null;
  until?: string | null;
}

export type ExceptionType = 'cancelled' | 'modified';

export interface SeriesException {
  occurrenceDate: string;
  type: ExceptionType;
  override?: {
    title?: string;
    start?: string;
    end?: string;
    resourceId?: string;
  };
}

export interface Booking {
  id: string;
  title: string;
  resourceId: string;
  calendarKey: CalendarKey;
  start: string;
  end: string;
  recurrence: RecurrenceRule | null;
  exceptions: SeriesException[];
  attendees: string[];
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface BookingInstance {
  bookingId: string;
  occurrenceId: string;
  occurrenceDate: string;
  title: string;
  resourceId: string;
  calendarKey: CalendarKey;
  color: string;
  start: Date;
  end: Date;
  attendees: string[];
  isRecurring: boolean;
  isException: boolean;
}

export interface AppSettings {
  workingHoursStart: number;
  workingHoursEnd: number;
  weekStartsOn: 0 | 1;
  defaultDurationMinutes: number;
  snapMinutes: 15 | 30 | 60;
}

export const DEFAULT_SETTINGS: AppSettings = {
  workingHoursStart: 8,
  workingHoursEnd: 19,
  weekStartsOn: 1,
  defaultDurationMinutes: 60,
  snapMinutes: 30,
};

export const CALENDAR_COLORS: Record<CalendarKey, string> = {
  rooms: '#0f766e',
  people: '#b45309',
  equipment: '#6d28d9',
  external: '#be123c',
};

export const CALENDAR_LABELS: Record<CalendarKey, string> = {
  rooms: 'Meeting rooms',
  people: 'People',
  equipment: 'Equipment',
  external: 'External holds',
};
