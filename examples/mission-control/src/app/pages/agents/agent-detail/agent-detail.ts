import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmResizableImports } from '@spartan-ng/helm/resizable';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { Agent, AgentStatus, BadgeVariant } from '../agents.model';
import { AGENTS, OWNER_OPTIONS } from '../agents.data';
import {
  AuditEntry,
  DataSource,
  LogEntry,
  LogLevel,
  PermissionEntry,
  RetryPolicy,
  RunHistoryEntry,
  ScheduleMode,
} from './agent-detail.model';
import {
  SAMPLE_AUDIT,
  SAMPLE_DATA_SOURCES,
  SAMPLE_LOGS,
  SAMPLE_PERMISSIONS,
  SAMPLE_RUNS,
  TRIGGER_PATTERNS,
} from './agent-detail.data';

const CATEGORIES = [
  'Email',
  'Documents',
  'Sales',
  'Data',
  'Productivity',
  'Analytics',
  'Engineering',
  'Finance',
  'Legal',
  'Integration',
  'Internal',
] as const;

@Component({
  selector: 'app-agent-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIcon,
    HlmAccordionImports,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmDatePickerImports,
    HlmFieldImports,
    HlmIcon,
    HlmInputImports,
    HlmLabelImports,
    HlmRadioGroupImports,
    HlmResizableImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSkeletonImports,
    HlmSliderImports,
    HlmSwitchImports,
    HlmTableImports,
    HlmTabsImports,
    HlmTextareaImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './agent-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);

  protected readonly agent = signal<Agent | null>(null);
  protected readonly notFound = computed(() => !this.isLoading() && this.agent() === null);

  protected readonly ownerOptions = OWNER_OPTIONS;
  protected readonly categories = CATEGORIES;
  protected readonly triggerPatterns = TRIGGER_PATTERNS;

  protected readonly runs: readonly RunHistoryEntry[] = SAMPLE_RUNS;
  protected readonly permissions: readonly PermissionEntry[] = SAMPLE_PERMISSIONS;
  protected readonly auditEntries: readonly AuditEntry[] = SAMPLE_AUDIT;
  protected readonly dataSources = signal<readonly DataSource[]>(SAMPLE_DATA_SOURCES);

  protected readonly logs: readonly LogEntry[] = SAMPLE_LOGS;
  protected readonly selectedLogId = signal<string>(SAMPLE_LOGS[0]?.id ?? '');
  protected readonly selectedLog = computed<LogEntry | undefined>(() =>
    this.logs.find((l) => l.id === this.selectedLogId()),
  );

  protected readonly selectedLogJson = computed(() => {
    const log = this.selectedLog();
    if (!log) return '{}';
    return JSON.stringify(
      {
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        ...(log.payload ?? {}),
      },
      null,
      2,
    );
  });

  protected readonly configForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Email', Validators.required],
    ownerId: ['mj', Validators.required],
    status: ['active' as AgentStatus, Validators.required],
    enabled: [true],
    maxConcurrent: [3],
    apiTimeout: [30],
    retryPolicy: ['once' as RetryPolicy],
    scheduleMode: ['cron' as ScheduleMode],
    firstRun: [new Date() as Date | null],
    notificationEmail: ['', [Validators.email]],
    alertOnFailure: [true],
    criticalAlertsOnly: [false],
    tags: this.fb.nonNullable.group({
      production: [false],
      beta: [false],
      experimental: [false],
      critical: [false],
    }),
  });

  protected get nameCtrl() {
    return this.configForm.controls.name;
  }
  protected get descCtrl() {
    return this.configForm.controls.description;
  }
  protected get emailCtrl() {
    return this.configForm.controls.notificationEmail;
  }

  protected readonly overviewKpis = computed(() => {
    const a = this.agent();
    if (!a) return [];
    return [
      { label: 'Runs today', value: `${a.runsToday}`, icon: 'lucidePlay', tone: 'neutral' },
      { label: 'Success rate', value: a.successRate > 0 ? `${a.successRate}%` : '—', icon: 'lucideCircleCheck', tone: a.successRate >= 95 ? 'positive' : a.successRate >= 90 ? 'warning' : 'destructive' },
      { label: 'Cost today', value: `$${a.costToday.toFixed(2)}`, icon: 'lucideCircleDollarSign', tone: 'neutral' },
      { label: 'Last run', value: a.lastRun, icon: 'lucideClock', tone: 'neutral' },
    ] as const;
  });

  protected sparkPath(series: readonly number[]): string {
    if (series.length === 0) return '';
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    return series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  protected sparkAreaPath(series: readonly number[]): string {
    if (series.length === 0) return '';
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  }

  protected statusVariant(status: AgentStatus): BadgeVariant {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'outline';
      case 'disabled':
        return 'secondary';
      case 'archived':
        return 'secondary';
    }
  }

  protected statusIcon(status: AgentStatus): string {
    switch (status) {
      case 'active':
        return 'lucideCircleCheck';
      case 'draft':
        return 'lucideCircleDashed';
      case 'disabled':
        return 'lucideBan';
      case 'archived':
        return 'lucideArchive';
    }
  }

  protected logIcon(level: LogLevel): string {
    switch (level) {
      case 'info':
        return 'lucideInfo';
      case 'success':
        return 'lucideCircleCheck';
      case 'warn':
        return 'lucideTriangleAlert';
      case 'error':
        return 'lucideCircleX';
      case 'debug':
        return 'lucideCircleDashed';
    }
  }

  protected dataSourceIcon(type: DataSource['type']): string {
    switch (type) {
      case 'postgres':
        return 'lucideDatabase';
      case 'rest':
        return 'lucideZap';
      case 'webhook':
        return 'lucideWebhook';
      case 'storage':
        return 'lucideFileText';
    }
  }

  protected runAgent(): void {
    const a = this.agent();
    if (!a) return;
    toast.success(`${a.name} queued for run`);
  }

  protected saveConfig(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      toast.error('Fix the highlighted fields first');
      return;
    }
    const v = this.configForm.getRawValue();
    toast.success('Config saved', { description: `${v.name} updated` });
  }

  protected resetConfig(): void {
    this.applyAgentToForm(this.agent());
    toast.info('Config reset to last saved values');
  }

  protected selectLog(id: string): void {
    this.selectedLogId.set(id);
  }

  protected toggleDataSource(id: string): void {
    this.dataSources.update((list) =>
      list.map((ds) => (ds.id === id ? { ...ds, enabled: !ds.enabled } : ds)),
    );
  }

  protected backToAgents(): void {
    void this.router.navigate(['/agents']);
  }

  private applyAgentToForm(a: Agent | null): void {
    if (!a) return;
    const ownerId = OWNER_OPTIONS.find((o) => o.initials === a.owner.initials)?.id ?? 'mj';
    this.configForm.reset({
      name: a.name,
      description: a.description,
      category: a.category,
      ownerId,
      status: a.status,
      enabled: a.status !== 'disabled',
      maxConcurrent: 3,
      apiTimeout: 30,
      retryPolicy: 'once',
      scheduleMode: 'cron',
      firstRun: new Date(),
      notificationEmail: 'ops@example.com',
      alertOnFailure: true,
      criticalAlertsOnly: a.tags.includes('critical'),
      tags: {
        production: a.tags.includes('production'),
        beta: a.tags.includes('beta'),
        experimental: a.tags.includes('experimental'),
        critical: a.tags.includes('critical'),
      },
    });
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    const found = AGENTS.find((a) => a.id === id) ?? null;
    this.agent.set(found);
    this.applyAgentToForm(found);
    setTimeout(() => this.isLoading.set(false), 300);
  }
}
