import { Injectable, signal } from '@angular/core';

export type EmployeeStatus = 'active' | 'on-leave' | 'onboarding';

// Initials and time-ago strings are derived in templates via ngx-transforms
// pipes (`| initials`, `| timeAgo`), so we don't carry pre-computed values on
// these shapes anymore.

export interface Employee {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly department: string;
  readonly team: string;
  readonly location: string;
  readonly manager: string | null;
  readonly status: EmployeeStatus;
  readonly joinedAt: Date;
  readonly lastReviewedAt: Date | null;
  readonly birthday: { month: number; day: number };
}

export interface LeaveToday {
  readonly employee: Pick<Employee, 'id' | 'name' | 'role'>;
  readonly type: 'vacation' | 'sick' | 'personal' | 'parental';
  readonly returnsOn: Date;
}

export interface BirthdayEntry {
  readonly employee: Pick<Employee, 'id' | 'name' | 'role'>;
  readonly date: Date;
  readonly daysAway: number;
}

export interface OnboardingTask {
  readonly id: string;
  readonly hire: string;
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

// --- Source data --------------------------------------------------------------

const FIRST = [
  'Aiko','Ines','Riley','Quinn','Marcus','Lena','Hana','Owen','Zara','Felix',
  'Amelia','Jordan','Noah','Sasha','Diego','Priya','Mateo','Wren','Theo','Sofia',
  'Esme','Levi','Nia','Kai','Mira','Soren','Cleo','Ari','Yuki','Tariq',
  'Maya','Ivan','Lila','Otis','Greta','Cyrus','Reyna','Dax','Vera','Kojo',
  'Anya','Bram','Selma','Jude','Lior','Mira','Oren','Tess','Xavi','Yara',
] as const;

const LAST = [
  'Stone','Park','Rivera','Lin','Brooks','Anand','Vargas','Chen','Hayes','Tanaka',
  'Webb','Petrov','Yamamoto','Carter','Idris','Moreau','Romero','Cruz','Nakamura','Khan',
  'Patel','Lopez','Becker','Schmidt','Reyes','Holloway','Okafor','Adler','Mahmoud','Suzuki',
  'Pereira','Bauer','Romano','Singh','Cohen','Walsh','Diaz','Yoon','Berg','Vance',
] as const;

interface DepartmentSpec {
  readonly name: string;
  readonly teams: readonly string[];
  readonly roles: readonly string[];
}

const DEPARTMENTS: readonly DepartmentSpec[] = [
  {
    name: 'Engineering',
    teams: ['Platform', 'Mobile', 'Web', 'Infra'],
    roles: ['Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager'],
  },
  {
    name: 'Product',
    teams: ['Growth', 'Core'],
    roles: ['Product Manager', 'Senior PM', 'Group PM', 'Data Analyst'],
  },
  {
    name: 'Design',
    teams: ['Brand', 'Product Design'],
    roles: ['Product Designer', 'Senior Designer', 'Lead Designer', 'Brand Designer'],
  },
  {
    name: 'Sales',
    teams: ['EMEA', 'AMER'],
    roles: ['Account Executive', 'Senior AE', 'Sales Engineer', 'Sales Manager'],
  },
  {
    name: 'Marketing',
    teams: ['Content', 'Lifecycle'],
    roles: ['Marketer', 'Senior Marketer', 'Content Lead', 'Brand Manager'],
  },
  {
    name: 'People',
    teams: ['Recruiting', 'People Ops'],
    roles: ['Recruiter', 'People Partner', 'HR Admin', 'L&D Lead'],
  },
  {
    name: 'Finance',
    teams: ['Accounting', 'FP&A'],
    roles: ['Accountant', 'Financial Analyst', 'Controller', 'Finance Lead'],
  },
];

const LOCATIONS = [
  'Remote, US',
  'New York',
  'San Francisco',
  'London',
  'Berlin',
  'Singapore',
  'Toronto',
  'Remote, EU',
] as const;

const MANAGERS = [
  'Mofiro Jean',
  'Sasha Lin',
  'Aiko Tanaka',
  'Quinn Hayes',
  'Riley Chen',
  'Lena Petrov',
  'Diego Brooks',
  'Owen Carter',
  'Felix Moreau',
  'Hana Yamamoto',
] as const;

function daysFromNow(days: number, today = TODAY): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
}

// Anchor everything to a fixed "today" so the data is deterministic.
const TODAY = new Date(2026, 5, 18);

// Pseudo-random but deterministic, used to spread join dates / review dates so
// the table feels real without depending on `Math.random()`.
function hash(n: number, salt: number): number {
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildEmployees(): Employee[] {
  const out: Employee[] = [];
  for (let i = 0; i < 200; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    const name = `${first} ${last}`;

    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const team = dept.teams[(i * 3) % dept.teams.length];
    const role = dept.roles[(i * 5) % dept.roles.length];

    const status: EmployeeStatus =
      i % 23 === 0 ? 'onboarding' : i % 17 === 0 ? 'on-leave' : 'active';

    // Joined between ~7 years ago and 7 days ago. Onboarding hires are recent.
    const joinedDaysAgo = status === 'onboarding'
      ? Math.floor(hash(i, 1) * 25) + 1
      : Math.floor(hash(i, 2) * 2400) + 30;

    // Last review: nullable, recent hires haven't been reviewed yet.
    const reviewedDaysAgo = joinedDaysAgo < 120
      ? null
      : Math.floor(hash(i, 3) * 540) + 14;

    out.push({
      id: `emp-${String(i + 1).padStart(3, '0')}`,
      name,
      role,
      department: dept.name,
      team,
      location: LOCATIONS[(i * 11) % LOCATIONS.length],
      manager:
        i % 31 === 0 ? null : MANAGERS[(i * 13) % MANAGERS.length],
      status,
      joinedAt: daysFromNow(-joinedDaysAgo),
      lastReviewedAt: reviewedDaysAgo === null ? null : daysFromNow(-reviewedDaysAgo),
      birthday: {
        month: ((i * 3) % 12) + 1,
        day: ((i * 5) % 27) + 1,
      },
    });
  }
  return out;
}

// --- Dashboard surfaces (still hand-curated for narrative tightness) ----------

const RECENT_HIRES: ReadonlyArray<{ name: string; role: string; daysAgo: number; dept: string; team: string }> = [
  { name: 'Amelia Stone',  role: 'Senior Backend Engineer', daysAgo: 3,  dept: 'Engineering', team: 'Platform' },
  { name: 'Jordan Park',   role: 'Product Designer',         daysAgo: 6,  dept: 'Design',      team: 'Product Design' },
  { name: 'Noah Rivera',   role: 'Account Executive',        daysAgo: 9,  dept: 'Sales',       team: 'AMER' },
  { name: 'Sasha Lin',     role: 'Engineering Manager',      daysAgo: 14, dept: 'Engineering', team: 'Mobile' },
  { name: 'Diego Brooks',  role: 'Brand Marketer',           daysAgo: 19, dept: 'Marketing',   team: 'Content' },
  { name: 'Priya Anand',   role: 'Data Analyst',             daysAgo: 22, dept: 'Product',     team: 'Growth' },
  { name: 'Mateo Vargas',  role: 'IT Specialist',            daysAgo: 27, dept: 'People',      team: 'People Ops' },
];

const LEAVE_TODAY: ReadonlyArray<{ name: string; role: string; type: LeaveToday['type']; back: number }> = [
  { name: 'Riley Chen',  role: 'Staff Engineer',          type: 'parental', back: 38 },
  { name: 'Quinn Hayes', role: 'Senior Account Manager',  type: 'vacation', back: 4 },
  { name: 'Aiko Tanaka', role: 'Lead Product Designer',   type: 'sick',     back: 1 },
  { name: 'Marcus Webb', role: 'Recruiter',               type: 'personal', back: 2 },
  { name: 'Lena Petrov', role: 'Mobile Engineer',         type: 'vacation', back: 9 },
];

const BIRTHDAYS: ReadonlyArray<{ name: string; role: string; daysAway: number }> = [
  { name: 'Hana Yamamoto', role: 'Frontend Engineer',     daysAway: 0 },
  { name: 'Owen Carter',   role: 'Solutions Architect',   daysAway: 2 },
  { name: 'Zara Idris',    role: 'Customer Success Lead', daysAway: 5 },
  { name: 'Felix Moreau',  role: 'DevOps Engineer',       daysAway: 8 },
  { name: 'Ines Romero',   role: 'Junior Designer',       daysAway: 11 },
];

const ONBOARDING_TASKS: ReadonlyArray<OnboardingTask> = [
  { id: 'ob-1', hire: 'Amelia Stone', task: 'Ship laptop & peripherals', stage: 'Setup',   dueIn: 1,  owner: 'IT' },
  { id: 'ob-2', hire: 'Amelia Stone', task: 'Buddy intro coffee',        stage: 'Day 1',   dueIn: 3,  owner: 'Sasha Lin' },
  { id: 'ob-3', hire: 'Jordan Park',  task: 'Figma + Linear access',     stage: 'Setup',   dueIn: 0,  owner: 'IT' },
  { id: 'ob-4', hire: 'Jordan Park',  task: 'Brand systems walkthrough', stage: '30 days', dueIn: 12, owner: 'Aiko Tanaka' },
  { id: 'ob-5', hire: 'Noah Rivera',  task: 'CRM onboarding session',    stage: 'Day 1',   dueIn: 2,  owner: 'Quinn Hayes' },
  { id: 'ob-6', hire: 'Sasha Lin',    task: '1:1 cadence with reports',  stage: '30 days', dueIn: 6,  owner: 'Mofiro Jean' },
];

// --- Service ------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly loading = signal(true);

  readonly employees = signal<readonly Employee[]>(buildEmployees());

  /** Pulled off the curated department list, handy for the directory filters. */
  readonly departments = DEPARTMENTS.map((d) => d.name);
  readonly teams = DEPARTMENTS.flatMap((d) => d.teams);
  readonly locations = LOCATIONS;

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
      role: h.role,
      department: h.dept,
      team: h.team,
      location: LOCATIONS[i % LOCATIONS.length],
      manager: 'Mofiro Jean',
      status: 'active' as const,
      joinedAt: daysFromNow(-h.daysAgo),
      lastReviewedAt: null,
      birthday: { month: ((i * 3) % 12) + 1, day: ((i * 5) % 27) + 1 },
    })),
  );

  readonly upcomingBirthdays = signal<readonly BirthdayEntry[]>(
    BIRTHDAYS.map((b, i) => ({
      employee: {
        id: `bd-${i}`,
        name: b.name,
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
