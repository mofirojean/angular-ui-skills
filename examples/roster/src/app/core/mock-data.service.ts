import { Injectable, signal } from '@angular/core';

export interface Employee {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
  readonly department: string;
  readonly location: string;
  readonly manager: string;
  readonly status: 'active' | 'on-leave' | 'onboarding';
  readonly joinedAt: Date;
  readonly birthday: { month: number; day: number };
}

export interface LeaveToday {
  readonly employee: Pick<Employee, 'id' | 'name' | 'initials' | 'role'>;
  readonly type: 'vacation' | 'sick' | 'personal' | 'parental';
  readonly returnsOn: Date;
}

export interface BirthdayEntry {
  readonly employee: Pick<Employee, 'id' | 'name' | 'initials' | 'role'>;
  readonly date: Date;
  readonly daysAway: number;
}

export interface OnboardingTask {
  readonly id: string;
  readonly hire: string;
  readonly initials: string;
  readonly task: string;
  readonly stage: 'Offer' | 'Setup' | 'Day 1' | '30 days';
  readonly dueIn: number;
  readonly owner: string;
}

export interface DashboardKpis {
  readonly activeEmployees: number;
  readonly openPositions: number;
  readonly pendingTimeOff: number;
  readonly reviewsDue: number;
  readonly deltas: {
    readonly activeEmployees: number;
    readonly openPositions: number;
    readonly pendingTimeOff: number;
    readonly reviewsDue: number;
  };
}

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'People', 'Finance'];
const LOCATIONS = ['Remote, US', 'New York', 'San Francisco', 'London', 'Berlin', 'Singapore'];

const RECENT_HIRES: ReadonlyArray<{ name: string; role: string; daysAgo: number; dept: string }> = [
  { name: 'Amelia Stone', role: 'Senior Backend Engineer', daysAgo: 3, dept: 'Engineering' },
  { name: 'Jordan Park', role: 'Product Designer', daysAgo: 6, dept: 'Design' },
  { name: 'Noah Rivera', role: 'Account Executive', daysAgo: 9, dept: 'Sales' },
  { name: 'Sasha Lin', role: 'Engineering Manager', daysAgo: 14, dept: 'Engineering' },
  { name: 'Diego Brooks', role: 'Brand Marketer', daysAgo: 19, dept: 'Marketing' },
  { name: 'Priya Anand', role: 'Data Analyst', daysAgo: 22, dept: 'Product' },
  { name: 'Mateo Vargas', role: 'IT Specialist', daysAgo: 27, dept: 'People' },
];

const LEAVE_TODAY: ReadonlyArray<{ name: string; role: string; type: LeaveToday['type']; back: number }> = [
  { name: 'Riley Chen',     role: 'Staff Engineer',          type: 'parental', back: 38 },
  { name: 'Quinn Hayes',    role: 'Senior Account Manager',  type: 'vacation', back: 4 },
  { name: 'Aiko Tanaka',    role: 'Lead Product Designer',   type: 'sick',     back: 1 },
  { name: 'Marcus Webb',    role: 'Recruiter',               type: 'personal', back: 2 },
  { name: 'Lena Petrov',    role: 'Mobile Engineer',         type: 'vacation', back: 9 },
];

const BIRTHDAYS: ReadonlyArray<{ name: string; role: string; daysAway: number }> = [
  { name: 'Hana Yamamoto',  role: 'Frontend Engineer',    daysAway: 0 },
  { name: 'Owen Carter',    role: 'Solutions Architect',  daysAway: 2 },
  { name: 'Zara Idris',     role: 'Customer Success Lead', daysAway: 5 },
  { name: 'Felix Moreau',   role: 'DevOps Engineer',      daysAway: 8 },
  { name: 'Ines Romero',    role: 'Junior Designer',      daysAway: 11 },
];

const ONBOARDING_TASKS: ReadonlyArray<OnboardingTask> = [
  { id: 'ob-1', hire: 'Amelia Stone',  initials: 'AS', task: 'Ship laptop & peripherals', stage: 'Setup',   dueIn: 1, owner: 'IT' },
  { id: 'ob-2', hire: 'Amelia Stone',  initials: 'AS', task: 'Buddy intro coffee',        stage: 'Day 1',   dueIn: 3, owner: 'Sasha Lin' },
  { id: 'ob-3', hire: 'Jordan Park',   initials: 'JP', task: 'Figma + Linear access',     stage: 'Setup',   dueIn: 0, owner: 'IT' },
  { id: 'ob-4', hire: 'Jordan Park',   initials: 'JP', task: 'Brand systems walkthrough', stage: '30 days', dueIn: 12, owner: 'Aiko Tanaka' },
  { id: 'ob-5', hire: 'Noah Rivera',   initials: 'NR', task: 'CRM onboarding session',    stage: 'Day 1',   dueIn: 2, owner: 'Quinn Hayes' },
  { id: 'ob-6', hire: 'Sasha Lin',     initials: 'SL', task: '1:1 cadence with reports',  stage: '30 days', dueIn: 6, owner: 'Mofiro Jean' },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function daysFromNow(days: number): Date {
  const d = new Date(2026, 5, 17);
  d.setDate(d.getDate() + days);
  return d;
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly loading = signal(true);

  readonly kpis = signal<DashboardKpis>({
    activeEmployees: 204,
    openPositions: 18,
    pendingTimeOff: 5,
    reviewsDue: 12,
    deltas: {
      activeEmployees: 6,
      openPositions: -2,
      pendingTimeOff: 1,
      reviewsDue: -4,
    },
  });

  readonly onLeaveToday = signal<readonly LeaveToday[]>(
    LEAVE_TODAY.map((l, i) => ({
      employee: {
        id: `lv-${i}`,
        name: l.name,
        initials: initials(l.name),
        role: l.role,
      },
      type: l.type,
      returnsOn: daysFromNow(l.back),
    })),
  );

  readonly recentlyJoined = signal<readonly Employee[]>(
    RECENT_HIRES.map((h, i) => ({
      id: `rj-${i}`,
      name: h.name,
      initials: initials(h.name),
      role: h.role,
      department: h.dept,
      location: LOCATIONS[i % LOCATIONS.length],
      manager: 'Mofiro Jean',
      status: 'active' as const,
      joinedAt: daysFromNow(-h.daysAgo),
      birthday: { month: ((i * 3) % 12) + 1, day: ((i * 5) % 27) + 1 },
    })),
  );

  readonly upcomingBirthdays = signal<readonly BirthdayEntry[]>(
    BIRTHDAYS.map((b, i) => ({
      employee: {
        id: `bd-${i}`,
        name: b.name,
        initials: initials(b.name),
        role: b.role,
      },
      date: daysFromNow(b.daysAway),
      daysAway: b.daysAway,
    })),
  );

  readonly openOnboardingTasks = signal<readonly OnboardingTask[]>(ONBOARDING_TASKS);

  constructor() {
    setTimeout(() => this.loading.set(false), 400);
  }
}
