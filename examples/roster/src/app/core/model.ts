// Domain models and types for Roster. Everything an Angular feature might
// import shape-wise lives here, the data layer (MockDataService) and view
// components both consume from this single source of truth.

// --- Navigation --------------------------------------------------------------

export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  /** Optional static count shown on the right side of the row. */
  readonly badge?: number | string;
}

export interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

// --- Employees ---------------------------------------------------------------

export type EmployeeStatus = 'active' | 'on-leave' | 'onboarding';

// Initials and time-ago strings are derived in templates via ngx-transforms
// pipes (`| initials`, `| timeAgo`), so we don't carry pre-computed values on
// these shapes.

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

// --- Dashboard surfaces ------------------------------------------------------

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

export type OnboardingStage = 'Offer' | 'Setup' | 'Day 1' | '30 days';

export interface OnboardingTask {
  readonly id: string;
  readonly hire: string;
  readonly task: string;
  readonly stage: OnboardingStage;
  readonly dueIn: number;
  readonly owner: string;
}

// --- Onboarding pipeline -----------------------------------------------------

export interface OnboardingHire {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly department: string;
  readonly team: string;
  readonly manager: string;
  readonly location: string;
  readonly startDate: Date;
  readonly stage: OnboardingStage;
}

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly stage: OnboardingStage;
  readonly owner: string;
  readonly dueOn: Date;
  readonly done: boolean;
  readonly note?: string;
}

export interface OnboardingChecklist {
  readonly hire: OnboardingHire;
  readonly items: readonly ChecklistItem[];
  readonly completedCount: number;
  readonly totalCount: number;
  readonly progressPct: number;
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

// --- Profile surfaces --------------------------------------------------------

export type SalaryReason = 'Hire' | 'Annual increase' | 'Promotion' | 'Adjustment';

export interface SalaryEntry {
  readonly effectiveOn: Date;
  readonly amount: number;
  readonly reason: SalaryReason;
  readonly note?: string;
}

export interface ReviewCycleSummary {
  readonly cycle: string;
  readonly date: Date;
  readonly score: number;
  readonly summary: string;
  readonly reviewer: string;
}

export type DocCategory = 'Contract' | 'ID' | 'Tax' | 'Equity' | 'Misc';

export interface ProfileDoc {
  readonly id: string;
  readonly name: string;
  readonly category: DocCategory;
  readonly bytes: number;
  readonly uploadedAt: Date;
  readonly uploadedBy: string;
}

export type ActivityKind =
  | 'joined'
  | 'role-change'
  | 'comp-adjustment'
  | 'doc-upload'
  | 'leave'
  | 'review'
  | 'team-change';

export interface ActivityEvent {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly label: string;
  readonly at: Date;
}

export interface EmployeeProfile {
  readonly employee: Employee;
  readonly manager: Employee | null;
  readonly reports: readonly Employee[];
  readonly currentSalary: number;
  readonly salaryHistory: readonly SalaryEntry[];
  readonly reviews: readonly ReviewCycleSummary[];
  readonly documents: readonly ProfileDoc[];
  readonly activity: readonly ActivityEvent[];
  readonly sensitive: boolean;
  readonly tenureDays: number;
  readonly equityVestedPct: number;
}
