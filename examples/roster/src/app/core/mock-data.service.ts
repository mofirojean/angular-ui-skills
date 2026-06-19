import { Injectable, signal } from '@angular/core';

import type {
  ActivityEvent,
  BirthdayEntry,
  ChecklistItem,
  DashboardKpis,
  DocCategory,
  Employee,
  EmployeeProfile,
  EmployeeStatus,
  LeaveToday,
  OnboardingChecklist,
  OnboardingHire,
  OnboardingStage,
  OnboardingTask,
  ProfileDoc,
  ReviewCycleSummary,
  SalaryEntry,
  SalaryReason,
} from './model';

export type {
  ActivityEvent,
  ActivityKind,
  BirthdayEntry,
  ChecklistItem,
  DashboardKpis,
  DocCategory,
  Employee,
  EmployeeProfile,
  EmployeeStatus,
  LeaveToday,
  NavItem,
  NavSection,
  OnboardingChecklist,
  OnboardingHire,
  OnboardingStage,
  OnboardingTask,
  ProfileDoc,
  ReviewCycleSummary,
  SalaryEntry,
  SalaryReason,
} from './model';


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

const TODAY = new Date(2026, 5, 18);

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

    const joinedDaysAgo = status === 'onboarding'
      ? Math.floor(hash(i, 1) * 25) + 1
      : Math.floor(hash(i, 2) * 2400) + 30;

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

  readonly hires = signal<readonly OnboardingHire[]>(buildHires());

  /** Move a hire to a different stage (CDK drop event handler in the kanban). */
  moveHireToStage(hireId: string, stage: OnboardingStage): void {
    this.hires.update((list) =>
      list.map((h) => (h.id === hireId ? { ...h, stage } : h)),
    );
  }

  /** Insert a freshly-built hire (called from the new-hire wizard). */
  addHire(hire: OnboardingHire): void {
    this.hires.update((list) => [hire, ...list]);
  }

  getHire(id: string): OnboardingHire | null {
    return this.hires().find((h) => h.id === id) ?? null;
  }

  getChecklist(id: string): OnboardingChecklist | null {
    const hire = this.getHire(id);
    if (!hire) return null;
    const overrides = this.checklistOverrides();
    const items = buildChecklist(hire, overrides);
    const completed = items.filter((i) => i.done).length;
    return {
      hire,
      items,
      completedCount: completed,
      totalCount: items.length,
      progressPct: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    };
  }

  toggleChecklistItem(hireId: string, itemId: string, done: boolean, note?: string): void {
    this.checklistOverrides.update((m) => ({
      ...m,
      [`${hireId}/${itemId}`]: { done, note },
    }));
  }

  readonly checklistOverrides = signal<Record<string, { done: boolean; note?: string }>>({});

  // --- Profile lookup --------------------------------------------------------

  /**
   * Resolves the full profile bundle for an employee, deterministic per id so
   * the same surface renders every time. Returns null if no such id exists.
   */
  getProfile(id: string): EmployeeProfile | null {
    const all = this.employees();
    const employee = all.find((e) => e.id === id);
    if (!employee) return null;

    const seed = Number(id.replace(/\D/g, '')) || 0;
    const reports = employee.manager === null
      ? []
      : all.filter((e) => e.manager === employee.name).slice(0, 6);
    const managerEmp = employee.manager
      ? all.find((e) => e.name === employee.manager) ?? null
      : null;

    const tenureDays = Math.round(
      (TODAY.getTime() - employee.joinedAt.getTime()) / 86_400_000,
    );

    return {
      employee,
      manager: managerEmp,
      reports,
      currentSalary: buildSalaryHistory(employee, seed).at(-1)!.amount,
      salaryHistory: buildSalaryHistory(employee, seed),
      reviews: buildReviews(employee, seed),
      documents: buildDocuments(employee, seed),
      activity: buildActivity(employee, seed),
      sensitive:
        MANAGERS.includes(employee.name as (typeof MANAGERS)[number]) ||
        /Lead|Manager|Staff|Controller/.test(employee.role),
      tenureDays,
      equityVestedPct: Math.min(100, Math.round((tenureDays / (4 * 365)) * 100)),
    };
  }

  constructor() {
    setTimeout(() => this.loading.set(false), 400);
  }
}

// --- Profile derivation helpers ----------------------------------------------

function roleBase(role: string): number {
  if (/Staff|Lead|Manager|Controller|Director/.test(role)) return 175_000;
  if (/Senior/.test(role)) return 135_000;
  if (/Junior|Analyst|Specialist|Accountant/.test(role)) return 78_000;
  return 105_000;
}

function buildSalaryHistory(emp: Employee, seed: number): readonly SalaryEntry[] {
  const out: SalaryEntry[] = [];
  const base = roleBase(emp.role);
  const tenureYears = Math.max(
    1,
    Math.floor((TODAY.getTime() - emp.joinedAt.getTime()) / (365 * 86_400_000)),
  );
  const steps = Math.min(5, tenureYears + 1);

  let amount = Math.round(base * (0.82 + hash(seed, 21) * 0.08));
  let date = new Date(emp.joinedAt);

  out.push({
    effectiveOn: new Date(date),
    amount,
    reason: 'Hire',
  });

  for (let i = 1; i < steps; i++) {
    date = new Date(date);
    date.setMonth(date.getMonth() + 12);
    const bumpKind = hash(seed, 30 + i);
    const reason: SalaryReason =
      bumpKind > 0.85 ? 'Promotion' : bumpKind > 0.25 ? 'Annual increase' : 'Adjustment';
    const pct = reason === 'Promotion' ? 0.12 + hash(seed, 40 + i) * 0.08 : 0.04 + hash(seed, 50 + i) * 0.05;
    amount = Math.round(amount * (1 + pct));
    out.push({ effectiveOn: new Date(date), amount, reason });
  }

  // Cap so we don't put future-dated entries.
  return out.filter((e) => e.effectiveOn <= TODAY);
}

function buildReviews(emp: Employee, seed: number): readonly ReviewCycleSummary[] {
  if (emp.lastReviewedAt === null) return [];
  const cycles: ReviewCycleSummary[] = [];
  const startYear = emp.joinedAt.getFullYear();
  const endYear = TODAY.getFullYear();
  let idx = 0;
  for (let y = endYear; y >= Math.max(startYear, endYear - 3); y--) {
    for (const half of ['H1', 'H2']) {
      const cycleStart = new Date(y, half === 'H1' ? 5 : 11, 15);
      if (cycleStart > TODAY) continue;
      if (cycleStart < emp.joinedAt) continue;
      const score = 3 + Math.round(hash(seed, 60 + idx) * 2 * 10) / 10;
      cycles.push({
        cycle: `${half} ${y}`,
        date: cycleStart,
        score,
        summary:
          score >= 4.5
            ? 'Exceeded expectations across the cycle, ready for next-level scope.'
            : score >= 3.5
              ? 'Met or exceeded expectations, strong contributor on the team.'
              : 'Met expectations, growth areas flagged for the next cycle.',
        reviewer: emp.manager ?? 'Mofiro Jean',
      });
      idx++;
      if (cycles.length >= 4) break;
    }
    if (cycles.length >= 4) break;
  }
  return cycles;
}

const DOC_TEMPLATES: ReadonlyArray<{ name: string; category: DocCategory; kb: number }> = [
  { name: 'Employment offer.pdf',       category: 'Contract', kb: 412 },
  { name: 'NDA + IP assignment.pdf',    category: 'Contract', kb: 286 },
  { name: 'W-9 form 2025.pdf',          category: 'Tax',      kb: 188 },
  { name: 'Direct deposit setup.pdf',   category: 'Tax',      kb: 140 },
  { name: 'Stock option agreement.pdf', category: 'Equity',   kb: 524 },
  { name: 'ID verification.jpg',        category: 'ID',       kb: 1860 },
  { name: 'Equipment receipt.pdf',      category: 'Misc',     kb: 96 },
  { name: 'Background check report.pdf', category: 'Contract', kb: 612 },
];

function buildDocuments(emp: Employee, seed: number): readonly ProfileDoc[] {
  const count = 3 + Math.floor(hash(seed, 70) * 4);
  const picks = DOC_TEMPLATES.slice(0, count);
  return picks.map((d, i) => ({
    id: `${emp.id}-doc-${i}`,
    name: d.name,
    category: d.category,
    bytes: d.kb * 1024,
    uploadedAt: (() => {
      const offset = Math.floor(hash(seed, 80 + i) * 540);
      const max = Math.max(0, Math.round((TODAY.getTime() - emp.joinedAt.getTime()) / 86_400_000));
      return daysFromNow(-Math.min(offset, max));
    })(),
    uploadedBy: i % 3 === 0 ? emp.name : (emp.manager ?? 'Mofiro Jean'),
  }));
}

// --- Onboarding builders -----------------------------------------------------

const SEED_HIRES: ReadonlyArray<{
  name: string;
  role: string;
  dept: string;
  team: string;
  manager: string;
  location: string;
  startInDays: number;
  stage: OnboardingStage;
}> = [
  { name: 'Bram Cohen',     role: 'Senior Frontend Engineer', dept: 'Engineering', team: 'Web',          manager: 'Sasha Lin',     location: 'Remote, US',     startInDays: 14, stage: 'Offer' },
  { name: 'Lila Walsh',     role: 'Account Executive',         dept: 'Sales',       team: 'AMER',         manager: 'Quinn Hayes',   location: 'New York',       startInDays: 21, stage: 'Offer' },
  { name: 'Otis Singh',     role: 'Product Manager',           dept: 'Product',     team: 'Growth',       manager: 'Riley Chen',    location: 'San Francisco',  startInDays: 30, stage: 'Offer' },
  { name: 'Anya Reyes',     role: 'Mobile Engineer',           dept: 'Engineering', team: 'Mobile',       manager: 'Sasha Lin',     location: 'Berlin',         startInDays: 10, stage: 'Setup' },
  { name: 'Kai Berg',       role: 'Brand Designer',            dept: 'Design',      team: 'Brand',        manager: 'Aiko Tanaka',   location: 'London',         startInDays: 6,  stage: 'Setup' },
  { name: 'Mira Okafor',    role: 'Sales Engineer',            dept: 'Sales',       team: 'EMEA',         manager: 'Quinn Hayes',   location: 'Remote, EU',     startInDays: 4,  stage: 'Setup' },
  { name: 'Tess Mahmoud',   role: 'Recruiter',                 dept: 'People',      team: 'Recruiting',   manager: 'Mofiro Jean',   location: 'Singapore',      startInDays: 1,  stage: 'Day 1' },
  { name: 'Yara Adler',     role: 'Financial Analyst',         dept: 'Finance',     team: 'FP&A',         manager: 'Owen Carter',   location: 'Toronto',        startInDays: 0,  stage: 'Day 1' },
  { name: 'Xavi Holloway',  role: 'Software Engineer',         dept: 'Engineering', team: 'Platform',     manager: 'Sasha Lin',     location: 'Remote, US',     startInDays: 0,  stage: 'Day 1' },
  { name: 'Wren Carter',    role: 'Lead Designer',             dept: 'Design',      team: 'Product Design', manager: 'Aiko Tanaka', location: 'San Francisco',  startInDays: -20, stage: '30 days' },
  { name: 'Greta Pereira',  role: 'Content Lead',              dept: 'Marketing',   team: 'Content',      manager: 'Diego Brooks',  location: 'Remote, US',     startInDays: -24, stage: '30 days' },
  { name: 'Cleo Cohen',     role: 'Senior Engineer',           dept: 'Engineering', team: 'Infra',        manager: 'Sasha Lin',     location: 'London',         startInDays: -28, stage: '30 days' },
];

function buildHires(): OnboardingHire[] {
  return SEED_HIRES.map((h, i) => ({
    id: `hire-${String(i + 1).padStart(3, '0')}`,
    name: h.name,
    role: h.role,
    department: h.dept,
    team: h.team,
    manager: h.manager,
    location: h.location,
    startDate: daysFromNow(h.startInDays),
    stage: h.stage,
  }));
}

/** Items every new hire needs to complete, grouped by stage. */
const CHECKLIST_TEMPLATE: ReadonlyArray<{
  label: string;
  stage: OnboardingStage;
  owner: 'IT' | 'People' | 'Manager' | 'Hire';
  dueOffsetDays: number;
}> = [
  // Offer stage, before start date
  { label: 'Send signed offer letter',           stage: 'Offer',   owner: 'People',  dueOffsetDays: -14 },
  { label: 'Background check complete',          stage: 'Offer',   owner: 'People',  dueOffsetDays: -10 },
  { label: 'Equipment ordered',                  stage: 'Offer',   owner: 'IT',      dueOffsetDays: -7  },
  // Setup, week before start
  { label: 'Workstation prepared',               stage: 'Setup',   owner: 'IT',      dueOffsetDays: -3  },
  { label: 'Accounts provisioned (SSO, GitHub, Slack)', stage: 'Setup', owner: 'IT', dueOffsetDays: -2 },
  { label: 'Welcome packet sent',                stage: 'Setup',   owner: 'People',  dueOffsetDays: -1  },
  // Day 1, the first day
  { label: 'Office tour / remote-buddy intro',   stage: 'Day 1',   owner: 'Manager', dueOffsetDays: 0   },
  { label: 'Team introductions',                 stage: 'Day 1',   owner: 'Manager', dueOffsetDays: 0   },
  { label: 'Codebase / tools walkthrough',       stage: 'Day 1',   owner: 'Manager', dueOffsetDays: 1   },
  // 30 days
  { label: 'First 1:1 with manager',             stage: '30 days', owner: 'Manager', dueOffsetDays: 7   },
  { label: 'Complete compliance training',       stage: '30 days', owner: 'Hire',    dueOffsetDays: 14  },
  { label: 'Ship first PR / closed deal / shipped review', stage: '30 days', owner: 'Hire', dueOffsetDays: 30 },
];

function buildChecklist(
  hire: OnboardingHire,
  overrides: Record<string, { done: boolean; note?: string }>,
): readonly ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map((t, i) => {
    const id = `c-${i + 1}`;
    const ownerName =
      t.owner === 'IT' ? 'IT desk'
      : t.owner === 'People' ? 'Mofiro Jean'
      : t.owner === 'Manager' ? hire.manager
      : hire.name;
    const dueOn = new Date(hire.startDate);
    dueOn.setDate(dueOn.getDate() + t.dueOffsetDays);
    const ov = overrides[`${hire.id}/${id}`];
    // Pre-mark earlier-stage tasks as done by default so the progress bar
    // shows realistic forward momentum, the user can untick them.
    const stageOrder: Record<OnboardingStage, number> = {
      Offer: 0,
      Setup: 1,
      'Day 1': 2,
      '30 days': 3,
    };
    const defaultDone = stageOrder[t.stage] < stageOrder[hire.stage];
    return {
      id,
      label: t.label,
      stage: t.stage,
      owner: ownerName,
      dueOn,
      done: ov?.done ?? defaultDone,
      note: ov?.note,
    };
  });
}

function buildActivity(emp: Employee, seed: number): readonly ActivityEvent[] {
  const events: ActivityEvent[] = [];
  let idx = 0;

  events.push({
    id: `${emp.id}-act-${idx++}`,
    kind: 'joined',
    label: `Joined Acme Corp as ${emp.role}`,
    at: emp.joinedAt,
  });

  const days = Math.round((TODAY.getTime() - emp.joinedAt.getTime()) / 86_400_000);
  if (days > 60) {
    events.push({
      id: `${emp.id}-act-${idx++}`,
      kind: 'team-change',
      label: `Moved to ${emp.team} team`,
      at: daysFromNow(-Math.floor(days * 0.7)),
    });
  }
  if (days > 200) {
    events.push({
      id: `${emp.id}-act-${idx++}`,
      kind: 'comp-adjustment',
      label: 'Compensation adjusted (annual cycle)',
      at: daysFromNow(-Math.floor(days * 0.55)),
    });
  }
  if (emp.lastReviewedAt) {
    events.push({
      id: `${emp.id}-act-${idx++}`,
      kind: 'review',
      label: 'Performance review completed',
      at: emp.lastReviewedAt,
    });
  }
  if (hash(seed, 91) > 0.4) {
    events.push({
      id: `${emp.id}-act-${idx++}`,
      kind: 'leave',
      label: 'Vacation request approved',
      at: daysFromNow(-Math.floor(60 + hash(seed, 92) * 200)),
    });
  }
  events.push({
    id: `${emp.id}-act-${idx++}`,
    kind: 'doc-upload',
    label: 'Stock option agreement uploaded',
    at: daysFromNow(-Math.floor(30 + hash(seed, 93) * 100)),
  });

  return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}
