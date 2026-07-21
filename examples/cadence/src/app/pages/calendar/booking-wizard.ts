import { DatePipe } from '@angular/common';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { merge } from 'rxjs';
import { RRule, type Options, type Weekday as RRuleWeekday } from 'rrule';
import { ScheduleService } from '../../data/schedule.service';
import {
  CALENDAR_LABELS,
  type Booking,
  type BookingInstance,
  type CalendarKey,
  type Frequency,
  type RecurrenceRule,
  type Resource,
  type ResourceType,
  type Weekday,
} from '../../data/types';

export interface BookingWizardData {
  start?: Date;
}

type FreqChoice = 'NONE' | Frequency;
type EndsMode = 'never' | 'count';

interface WeekdayOption {
  value: Weekday;
  label: string;
}

const WEEKDAY_OPTIONS: WeekdayOption[] = [
  { value: 'MO', label: 'Mo' },
  { value: 'TU', label: 'Tu' },
  { value: 'WE', label: 'We' },
  { value: 'TH', label: 'Th' },
  { value: 'FR', label: 'Fr' },
  { value: 'SA', label: 'Sa' },
  { value: 'SU', label: 'Su' },
];

const TYPE_TO_CALENDAR: Record<ResourceType, CalendarKey> = {
  room: 'rooms',
  person: 'people',
  equipment: 'equipment',
};

const FREQ_MAP: Record<Frequency, number> = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
};

const WEEKDAY_MAP: Record<Weekday, RRuleWeekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

const FREQ_NOUN: Record<Frequency, string> = {
  DAILY: 'day',
  WEEKLY: 'week',
  MONTHLY: 'month',
};

@Component({
  selector: 'cad-booking-wizard',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    CdkTextareaAutosize,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatSelectModule,
    MatChipsModule,
    MatButton,
    MatIcon,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard">
      <div class="wizard-head">
        <h2 class="wizard-title">New booking</h2>
        <button mat-button mat-dialog-close aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-stepper linear #stepper>
        <!-- 1. What -->
        <mat-step [stepControl]="whatGroup" label="What">
          <form class="step" [formGroup]="whatGroup">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Team sync" />
              @if (whatGroup.controls.title.hasError('required')) {
                <mat-error>A title is required.</mat-error>
              }
            </mat-form-field>

            <div class="field-label">Booking type</div>
            <mat-button-toggle-group formControlName="type" aria-label="Booking type">
              <mat-button-toggle value="room">
                <mat-icon>meeting_room</mat-icon> Meeting
              </mat-button-toggle>
              <mat-button-toggle value="person">
                <mat-icon>person</mat-icon> Person
              </mat-button-toggle>
              <mat-button-toggle value="equipment">
                <mat-icon>videocam</mat-icon> Equipment
              </mat-button-toggle>
            </mat-button-toggle-group>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                cdkTextareaAutosize
                cdkAutosizeMinRows="2"
                cdkAutosizeMaxRows="5"
                placeholder="Optional notes"
              ></textarea>
            </mat-form-field>
          </form>

          <div class="step-actions">
            <span class="grow"></span>
            <button mat-flat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <!-- 2. When -->
        <mat-step [stepControl]="whenGroup" label="When">
          <form class="step" [formGroup]="whenGroup">
            <div class="row">
              <mat-form-field appearance="outline" class="grow">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date" />
                <mat-datepicker-toggle matIconSuffix [for]="picker" />
                <mat-datepicker #picker />
              </mat-form-field>
            </div>

            <div class="row">
              <mat-form-field appearance="outline" class="grow">
                <mat-label>Starts</mat-label>
                <input matInput [matTimepicker]="startTp" formControlName="startTime" />
                <mat-timepicker-toggle matIconSuffix [for]="startTp" />
                <mat-timepicker #startTp />
              </mat-form-field>
              <mat-form-field appearance="outline" class="grow">
                <mat-label>Ends</mat-label>
                <input matInput [matTimepicker]="endTp" formControlName="endTime" />
                <mat-timepicker-toggle matIconSuffix [for]="endTp" />
                <mat-timepicker #endTp />
              </mat-form-field>
            </div>

            <div class="recurrence">
              <mat-form-field appearance="outline">
                <mat-label>Repeat</mat-label>
                <mat-select formControlName="freq">
                  <mat-option value="NONE">Does not repeat</mat-option>
                  <mat-option value="DAILY">Daily</mat-option>
                  <mat-option value="WEEKLY">Weekly</mat-option>
                  <mat-option value="MONTHLY">Monthly</mat-option>
                </mat-select>
              </mat-form-field>

              @if (isRepeating()) {
                <mat-form-field appearance="outline" class="interval">
                  <mat-label>Every</mat-label>
                  <input matInput type="number" min="1" formControlName="interval" />
                  <span matTextSuffix>{{ freqNoun() }}</span>
                </mat-form-field>

                @if (whenGroup.controls.freq.value === 'WEEKLY') {
                  <div class="field-label">On days</div>
                  <mat-button-toggle-group multiple formControlName="byWeekday" aria-label="Weekdays">
                    @for (d of weekdays; track d.value) {
                      <mat-button-toggle [value]="d.value">{{ d.label }}</mat-button-toggle>
                    }
                  </mat-button-toggle-group>
                }

                <div class="field-label">Ends</div>
                <mat-button-toggle-group formControlName="endsMode" aria-label="Ends">
                  <mat-button-toggle value="never">Never</mat-button-toggle>
                  <mat-button-toggle value="count">After N</mat-button-toggle>
                </mat-button-toggle-group>

                @if (whenGroup.controls.endsMode.value === 'count') {
                  <mat-form-field appearance="outline" class="interval">
                    <mat-label>Occurrences</mat-label>
                    <input matInput type="number" min="1" formControlName="count" />
                  </mat-form-field>
                }
              }
            </div>

            @if (nextOccurrences().length) {
              <div class="preview">
                <div class="field-label">Next occurrences</div>
                <ul class="preview-list">
                  @for (occ of nextOccurrences(); track occ.getTime()) {
                    <li>
                      <mat-icon>event</mat-icon>
                      {{ occ | date: 'EEE, MMM d · HH:mm' }}
                    </li>
                  }
                </ul>
              </div>
            }
          </form>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <span class="grow"></span>
            <button mat-flat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <!-- 3. Who & where -->
        <mat-step [stepControl]="whoGroup" label="Who & where">
          <form class="step" [formGroup]="whoGroup">
            <mat-form-field appearance="outline">
              <mat-label>{{ resourceLabel() }}</mat-label>
              <mat-select formControlName="resourceId">
                @for (r of availableResources(); track r.id) {
                  <mat-option [value]="r.id">
                    {{ r.name }}
                    @if (r.floor) {
                      <span class="opt-meta">· {{ r.floor }}</span>
                    }
                  </mat-option>
                } @empty {
                  <mat-option disabled>No matching resources</mat-option>
                }
              </mat-select>
              @if (whoGroup.controls.resourceId.hasError('required')) {
                <mat-error>Pick a resource.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Attendees</mat-label>
              <mat-chip-grid #chipGrid aria-label="Attendees">
                @for (a of attendees(); track a) {
                  <mat-chip-row (removed)="removeAttendee(a)">
                    {{ a }}
                    <button matChipRemove [attr.aria-label]="'Remove ' + a">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </mat-chip-row>
                }
                <input
                  placeholder="Add attendee…"
                  [matChipInputFor]="chipGrid"
                  [matChipInputAddOnBlur]="true"
                  (matChipInputTokenEnd)="addAttendee($event)"
                />
              </mat-chip-grid>
            </mat-form-field>

            @if (conflicts().length) {
              <div class="conflict" role="alert">
                <mat-icon>warning</mat-icon>
                <span>This resource is already booked at that time.</span>
              </div>
            }
          </form>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <span class="grow"></span>
            <button mat-flat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <!-- 4. Review -->
        <mat-step label="Review">
          <div class="step">
            <div class="summary">
              <div class="summary-row">
                <mat-icon>title</mat-icon>
                <div>
                  <div class="summary-value">{{ whatGroup.controls.title.value || 'Untitled' }}</div>
                  <div class="summary-meta">{{ calendarLabel() }}</div>
                </div>
              </div>
              <div class="summary-row">
                <mat-icon>schedule</mat-icon>
                <div>
                  <div class="summary-value">{{ whenLabel() }}</div>
                  <div class="summary-meta">{{ recurrenceLabel() }}</div>
                </div>
              </div>
              <div class="summary-row">
                <mat-icon>place</mat-icon>
                <div class="summary-value">{{ resourceName() || 'No resource selected' }}</div>
              </div>
              @if (attendees().length) {
                <div class="summary-row">
                  <mat-icon>group</mat-icon>
                  <div class="summary-value">{{ attendees().join(', ') }}</div>
                </div>
              }
              @if (whatGroup.controls.description.value) {
                <div class="summary-row">
                  <mat-icon>notes</mat-icon>
                  <div class="summary-value">{{ whatGroup.controls.description.value }}</div>
                </div>
              }
              @if (conflicts().length) {
                <div class="summary-row conflict-note">
                  <mat-icon>warning</mat-icon>
                  <div class="summary-value">Overlaps an existing booking on this resource.</div>
                </div>
              }
            </div>
          </div>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <span class="grow"></span>
            <button mat-flat-button [disabled]="saving()" (click)="create()">
              <mat-icon>check</mat-icon> Create booking
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: `
    .wizard {
      display: flex;
      flex-direction: column;
      min-width: 460px;
      max-width: 560px;
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }
    .wizard-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1rem 0.25rem 1.5rem;
    }
    .wizard-title {
      font: var(--mat-sys-title-large);
      margin: 0;
    }
    .step {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0.25rem 0.25rem;
    }
    .row {
      display: flex;
      gap: 0.75rem;
    }
    .grow { flex: 1; }
    .field-label {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
      margin-top: 0.25rem;
    }
    mat-button-toggle-group mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 0.35rem;
    }
    .recurrence {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      background: var(--mat-sys-surface-container);
    }
    .interval { max-width: 180px; }
    .preview {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .preview-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .preview-list li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .preview-list mat-icon,
    .conflict mat-icon,
    .summary-row mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .opt-meta { color: var(--mat-sys-on-surface-variant); }
    .conflict {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      font: var(--mat-sys-body-medium);
    }
    .conflict mat-icon { color: var(--mat-sys-on-error-container); }
    .summary {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1rem 1.1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      background: var(--mat-sys-surface-container);
    }
    .summary-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .summary-value {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface);
    }
    .summary-meta {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .conflict-note,
    .conflict-note mat-icon {
      color: var(--mat-sys-error);
    }
    .step-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.25rem 0.25rem;
    }
  `,
})
export class BookingWizard {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly schedule = inject(ScheduleService);
  private readonly dialogRef = inject(MatDialogRef<BookingWizard>);
  private readonly data = inject<BookingWizardData>(MAT_DIALOG_DATA, {
    optional: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly weekdays = WEEKDAY_OPTIONS;

  private readonly base = this.data?.start ?? defaultStart();

  protected readonly whatGroup = this.fb.group({
    title: ['', Validators.required],
    type: ['room' as ResourceType, Validators.required],
    description: [''],
  });

  protected readonly whenGroup = this.fb.group({
    date: [this.base, Validators.required],
    startTime: [this.base, Validators.required],
    endTime: [addMinutes(this.base, 60), Validators.required],
    freq: ['NONE' as FreqChoice],
    interval: [1, [Validators.min(1)]],
    byWeekday: [[] as Weekday[]],
    endsMode: ['never' as EndsMode],
    count: [10, [Validators.min(1)]],
  });

  protected readonly whoGroup = this.fb.group({
    resourceId: ['', Validators.required],
  });

  private readonly attendeesList = this.fb.control<string[]>([]);
  protected readonly attendees = toSignal(this.attendeesList.valueChanges, {
    initialValue: this.attendeesList.value,
  });

  protected readonly saving = signal(false);

  private readonly changes = toSignal(
    merge(
      this.whatGroup.valueChanges,
      this.whenGroup.valueChanges,
      this.whoGroup.valueChanges,
    ),
    { initialValue: null },
  );

  protected readonly isRepeating = computed(() => {
    this.changes();
    return this.whenGroup.controls.freq.value !== 'NONE';
  });

  protected readonly freqNoun = computed(() => {
    this.changes();
    const freq = this.whenGroup.controls.freq.value;
    return freq === 'NONE' ? '' : `${FREQ_NOUN[freq]}(s)`;
  });

  private readonly calendarKey = computed<CalendarKey>(() => {
    this.changes();
    return TYPE_TO_CALENDAR[this.whatGroup.controls.type.value];
  });

  protected readonly calendarLabel = computed(
    () => CALENDAR_LABELS[this.calendarKey()],
  );

  protected readonly resourceLabel = computed(() => {
    switch (this.whatGroup.controls.type.value) {
      case 'person':
        return 'Person';
      case 'equipment':
        return 'Equipment';
      default:
        return 'Meeting room';
    }
  });

  protected readonly availableResources = computed<Resource[]>(() => {
    const key = this.calendarKey();
    return this.schedule.resources().filter((r) => r.calendarKey === key);
  });

  private readonly firstStart = computed<Date | null>(() => {
    this.changes();
    return combine(
      this.whenGroup.controls.date.value,
      this.whenGroup.controls.startTime.value,
    );
  });

  private readonly firstEnd = computed<Date | null>(() => {
    this.changes();
    return combine(
      this.whenGroup.controls.date.value,
      this.whenGroup.controls.endTime.value,
    );
  });

  private readonly recurrence = computed<RecurrenceRule | null>(() => {
    this.changes();
    const c = this.whenGroup.controls;
    const freq = c.freq.value;
    if (freq === 'NONE') return null;
    const rule: RecurrenceRule = {
      freq,
      interval: Math.max(1, Number(c.interval.value) || 1),
    };
    if (freq === 'WEEKLY' && c.byWeekday.value.length) {
      rule.byWeekday = c.byWeekday.value;
    }
    if (c.endsMode.value === 'count') {
      rule.count = Math.max(1, Number(c.count.value) || 1);
    }
    return rule;
  });

  protected readonly nextOccurrences = computed<Date[]>(() => {
    const start = this.firstStart();
    if (!start) return [];
    const rec = this.recurrence();
    if (!rec) return [start];
    const rule = new RRule(toRRuleOptions(rec, start));
    return rule.all((_d, i) => i < 5).map(fromFakeUtc);
  });

  protected readonly conflicts = computed<BookingInstance[]>(() => {
    const rid = this.whoGroup.controls.resourceId.value;
    const start = this.firstStart();
    const end = this.firstEnd();
    if (!rid || !start || !end) return [];
    return this.schedule.instancesFor(start, end, [rid]);
  });

  protected readonly resourceName = computed(() => {
    const rid = this.whoGroup.controls.resourceId.value;
    return rid ? (this.schedule.resourceById(rid)?.name ?? '') : '';
  });

  protected readonly whenLabel = computed(() => {
    const start = this.firstStart();
    const end = this.firstEnd();
    if (!start || !end) return 'Pick a date and time';
    const day = start.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    return `${day} · ${timeStr(start)}–${timeStr(end)}`;
  });

  protected readonly recurrenceLabel = computed(() => {
    const rec = this.recurrence();
    if (!rec) return 'Does not repeat';
    const every =
      rec.interval === 1
        ? `Every ${FREQ_NOUN[rec.freq]}`
        : `Every ${rec.interval} ${FREQ_NOUN[rec.freq]}s`;
    const days =
      rec.freq === 'WEEKLY' && rec.byWeekday?.length
        ? ` on ${rec.byWeekday.join(', ')}`
        : '';
    const ends = rec.count ? `, ${rec.count} times` : '';
    return `${every}${days}${ends}`;
  });

  constructor() {
    this.whatGroup.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.whoGroup.controls.resourceId.setValue(''));
  }

  addAttendee(event: MatChipInputEvent): void {
    const value = event.value.trim();
    if (value && !this.attendeesList.value.includes(value)) {
      this.attendeesList.setValue([...this.attendeesList.value, value]);
    }
    event.chipInput?.clear();
  }

  removeAttendee(attendee: string): void {
    this.attendeesList.setValue(
      this.attendeesList.value.filter((a) => a !== attendee),
    );
  }

  async create(): Promise<void> {
    if (this.saving()) return;
    if (this.whatGroup.invalid || this.whenGroup.invalid || this.whoGroup.invalid) {
      this.whatGroup.markAllAsTouched();
      this.whenGroup.markAllAsTouched();
      this.whoGroup.markAllAsTouched();
      return;
    }
    const start = this.firstStart();
    const end = this.firstEnd();
    if (!start || !end) return;

    this.saving.set(true);
    const now = Date.now();
    const booking: Booking = {
      id: crypto.randomUUID(),
      title: this.whatGroup.controls.title.value.trim(),
      resourceId: this.whoGroup.controls.resourceId.value,
      calendarKey: this.calendarKey(),
      start: start.toISOString(),
      end: end.toISOString(),
      recurrence: this.recurrence(),
      exceptions: [],
      attendees: this.attendeesList.value,
      description: this.whatGroup.controls.description.value.trim(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.schedule.addBooking(booking);
      this.dialogRef.close(booking.id);
    } catch {
      this.saving.set(false);
    }
  }
}

function defaultStart(): Date {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function combine(date: Date | null, time: Date | null): Date | null {
  if (!date || !time) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0,
  );
}

function timeStr(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toRRuleOptions(rule: RecurrenceRule, dtstart: Date): Partial<Options> {
  const options: Partial<Options> = {
    freq: FREQ_MAP[rule.freq],
    interval: rule.interval,
    dtstart: toFakeUtc(dtstart),
  };
  if (rule.byWeekday?.length) {
    options.byweekday = rule.byWeekday.map((w) => WEEKDAY_MAP[w]);
  }
  if (rule.count != null) {
    options.count = rule.count;
  }
  if (rule.until) {
    options.until = toFakeUtc(new Date(rule.until));
  }
  return options;
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
