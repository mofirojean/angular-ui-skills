import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MockDataService } from '../../core/mock-data.service';

type SectionKey =
  | 'general'
  | 'branding'
  | 'teams'
  | 'roles'
  | 'holidays'
  | 'notifications';

interface SectionItem {
  readonly key: SectionKey;
  readonly label: string;
  readonly icon: string;
  readonly sub: string;
}

interface Permission {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  enabled: boolean;
}

interface Holiday {
  readonly id: string;
  readonly name: string;
  date: Date;
}

interface NotificationPref {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  enabled: boolean;
}

const PALETTE_PRESETS = [
  { value: 'azure',     label: 'Azure',     swatch: '#4f6df5' },
  { value: 'violet',    label: 'Violet',    swatch: '#8b5cf6' },
  { value: 'rose',      label: 'Rose',      swatch: '#f43f5e' },
  { value: 'green',     label: 'Green',     swatch: '#16a34a' },
  { value: 'orange',    label: 'Orange',    swatch: '#f97316' },
  { value: 'slate',     label: 'Slate',     swatch: '#64748b' },
] as const;

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

const WEEK_STARTS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 6, label: 'Saturday' },
] as const;

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);

  protected readonly sections: readonly SectionItem[] = [
    { key: 'general',       label: 'General',       icon: 'settings',         sub: 'Workspace + density' },
    { key: 'branding',      label: 'Branding',      icon: 'palette',          sub: 'Logo + palette' },
    { key: 'teams',         label: 'Teams',         icon: 'groups',           sub: 'Membership + leads' },
    { key: 'roles',         label: 'Roles & permissions', icon: 'shield_person', sub: 'Per-role access' },
    { key: 'holidays',      label: 'Holidays',      icon: 'celebration',      sub: 'Company calendar' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications',    sub: 'Email + in-app' },
  ];

  protected readonly active = signal<SectionKey>('general');

  protected select(key: SectionKey): void {
    this.active.set(key);
  }

  // --- General ---------------------------------------------------------------

  protected readonly generalForm = this.fb.group({
    workspaceName: this.fb.control('Acme Corp'),
    timezone: this.fb.control('America/Los_Angeles'),
    weekStart: this.fb.control<number>(1),
    densityScale: this.fb.control<number>(-1),
  });

  protected readonly timezones = TIMEZONES;
  protected readonly weekStarts = WEEK_STARTS;

  protected readonly densityLabel = computed(() => {
    const v = this.generalForm.controls.densityScale.value;
    if (v >= 0) return 'Comfortable';
    if (v === -1) return 'Default (Roster)';
    if (v === -2) return 'Dense';
    return 'Compact';
  });

  // --- Branding --------------------------------------------------------------

  protected readonly paletteOptions = PALETTE_PRESETS;
  protected readonly selectedPalette = signal<string>('azure');

  protected pickPalette(value: string): void {
    this.selectedPalette.set(value);
  }

  protected readonly logoForm = this.fb.group({
    logoText: this.fb.control('R'),
    logoLabel: this.fb.control('Roster'),
  });

  // --- Teams -----------------------------------------------------------------

  protected readonly teams = computed(() => {
    const map = new Map<string, { team: string; department: string; members: number; lead: string }>();
    for (const emp of this.data.employees()) {
      const key = `${emp.department}::${emp.team}`;
      const entry = map.get(key);
      if (entry) {
        map.set(key, { ...entry, members: entry.members + 1 });
      } else {
        map.set(key, {
          team: emp.team,
          department: emp.department,
          members: 1,
          lead: emp.manager ?? 'Mofiro Jean',
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.members - a.members);
  });

  // --- Roles & permissions ---------------------------------------------------

  protected readonly permissions = signal<readonly Permission[]>([
    { key: 'view-comp',    label: 'View compensation', description: 'Salary, equity, bonus details across the org', enabled: false },
    { key: 'edit-people',  label: 'Edit employee records', description: 'Update role, manager, department, location', enabled: true },
    { key: 'invite',       label: 'Invite new hires', description: 'Create offer + start onboarding pipeline', enabled: true },
    { key: 'approve-leave', label: 'Approve time off',  description: 'Decision pending leave requests', enabled: true },
    { key: 'run-reviews',  label: 'Run review cycles', description: 'Start, edit, calibrate, finalize review cycles', enabled: false },
    { key: 'export-data',  label: 'Export data', description: 'Download CSV reports across all surfaces', enabled: false },
  ]);

  protected togglePermission(key: string, enabled: boolean): void {
    this.permissions.update((list) =>
      list.map((p) => (p.key === key ? { ...p, enabled } : p)),
    );
  }

  protected readonly rolesAssigned = signal<readonly string[]>(['HR Admin', 'Manager', 'Recruiter']);
  protected readonly chipSeparators = [13, 188] as const;

  protected addRole(value: string): void {
    const trimmed = value.trim();
    if (!trimmed) return;
    const list = this.rolesAssigned();
    if (list.includes(trimmed)) return;
    this.rolesAssigned.set([...list, trimmed]);
  }

  protected removeRole(role: string): void {
    this.rolesAssigned.set(this.rolesAssigned().filter((r) => r !== role));
  }

  // --- Holidays --------------------------------------------------------------

  private readonly today = new Date(2026, 5, 18);

  protected readonly holidays = signal<readonly Holiday[]>([
    { id: 'h1', name: "New Year's Day",    date: new Date(2026, 0, 1)  },
    { id: 'h2', name: 'Memorial Day',       date: new Date(2026, 4, 25) },
    { id: 'h3', name: 'Independence Day',   date: new Date(2026, 6, 4)  },
    { id: 'h4', name: 'Labor Day',          date: new Date(2026, 8, 7)  },
    { id: 'h5', name: 'Thanksgiving',       date: new Date(2026, 10, 26)},
    { id: 'h6', name: 'Day after Thanksgiving', date: new Date(2026, 10, 27)},
    { id: 'h7', name: 'Christmas Day',      date: new Date(2026, 11, 25)},
    { id: 'h8', name: 'Company shutdown',   date: new Date(2026, 11, 28)},
  ]);

  protected removeHoliday(id: string): void {
    this.holidays.update((list) => list.filter((h) => h.id !== id));
    this.snack.open('Holiday removed', 'Undo', { duration: 2400 });
  }

  protected readonly countryPresets = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'sg', label: 'Singapore' },
    { value: 'jp', label: 'Japan' },
  ];

  protected importCountry(country: string): void {
    this.snack.open(`Imported holidays for ${country.toUpperCase()}`, undefined, { duration: 2400 });
  }

  // --- Notifications ---------------------------------------------------------

  protected readonly notifications = signal<readonly NotificationPref[]>([
    { key: 'time-off',   label: 'Time-off requests',      description: 'Notify when reports submit leave requests',      enabled: true },
    { key: 'reviews',    label: 'Review cycle updates',   description: 'Reminders for cycle milestones',                  enabled: true },
    { key: 'onboarding', label: 'Onboarding progress',    description: 'Daily digest of pipeline movement',               enabled: false },
    { key: 'birthdays',  label: 'Birthdays + anniversaries', description: 'Heads-up the day before',                     enabled: true },
    { key: 'mentions',   label: 'Mentions',               description: 'When someone @-mentions you in a comment',         enabled: true },
    { key: 'digest',     label: 'Weekly digest',          description: 'Email recap every Monday morning',                enabled: false },
  ]);

  protected toggleNotification(key: string, enabled: boolean): void {
    this.notifications.update((list) =>
      list.map((n) => (n.key === key ? { ...n, enabled } : n)),
    );
  }

  protected saveAll(): void {
    this.snack.open('Settings saved', undefined, { duration: 2400 });
  }
}