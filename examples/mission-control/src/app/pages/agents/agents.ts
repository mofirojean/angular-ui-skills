import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmContextMenuImports } from '@spartan-ng/helm/context-menu';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import {
  Agent,
  AGENTS_PAGE_SIZE,
  AgentKpi,
  AgentStatus,
  BadgeVariant,
  OwnerOption,
  SortDirection,
  SortKey,
  StatusFilter,
} from './agents.model';
import { AGENTS, OWNER_OPTIONS } from './agents.data';

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

const ICON_OPTIONS = [
  'lucideBot',
  'lucideMail',
  'lucideFileText',
  'lucideTarget',
  'lucideDatabase',
  'lucideMessageSquare',
  'lucideReceipt',
  'lucideUsers',
  'lucideCalendar',
  'lucideHeart',
  'lucideBookOpen',
  'lucidePenTool',
  'lucideShield',
  'lucideWebhook',
  'lucideBug',
  'lucideCircleDollarSign',
  'lucideClipboardList',
  'lucideZap',
] as const;

@Component({
  selector: 'app-agents',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmComboboxImports,
    HlmContextMenuImports,
    HlmDialogImports,
    HlmDropdownMenuImports,
    HlmFieldImports,
    HlmIcon,
    HlmInputImports,
    HlmInputGroupImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSheetImports,
    HlmSkeletonImports,
    HlmSwitchImports,
    HlmTableImports,
    HlmTextareaImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './agents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Agents {
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly rowSkeletons = [0, 1, 2, 3, 4, 5, 6, 7];

  private readonly agents = AGENTS;
  protected readonly totalAgentsCount = AGENTS.length;
  protected readonly ownerOptions = OWNER_OPTIONS;
  protected readonly categories = CATEGORIES;
  protected readonly iconOptions = ICON_OPTIONS;

  protected readonly activeCount = computed(
    () => this.agents.filter((a) => a.status === 'active').length,
  );

  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly selectedOwner = signal<OwnerOption | null>(null);
  protected readonly ownerSearch = signal('');

  protected readonly filteredOwners = computed<readonly OwnerOption[]>(() => {
    const q = this.ownerSearch().toLowerCase().trim();
    if (!q) return this.ownerOptions;
    return this.ownerOptions.filter((o) => o.name.toLowerCase().includes(q));
  });

  protected readonly ownerToString = (option: OwnerOption | null): string => option?.name ?? '';
  protected readonly ownerEquals = (a: OwnerOption | null, b: OwnerOption | null): boolean => a?.id === b?.id;

  protected readonly kpis = computed<readonly AgentKpi[]>(() => {
    const all = this.agents;
    const active = all.filter((a) => a.status === 'active');
    const totalRunsToday = all.reduce((sum, a) => sum + a.runsToday, 0);
    const avgSuccess =
      active.length === 0 ? 0 : active.reduce((sum, a) => sum + a.successRate, 0) / active.length;
    const needsAttention = active.filter((a) => a.successRate < 90).length;
    const drafts = all.filter((a) => a.status === 'draft').length;
    const totalCost = all.reduce((sum, a) => sum + a.costToday, 0);

    return [
      { label: 'Active', value: `${active.length}`, icon: 'lucideCircleCheck', tone: 'positive', hint: `${all.length - active.length} non-active` },
      { label: 'Runs today', value: totalRunsToday.toLocaleString(), icon: 'lucidePlay', tone: 'neutral', hint: 'Across all active agents' },
      { label: 'Avg success', value: `${avgSuccess.toFixed(1)}%`, icon: 'lucideTrendingUp', tone: avgSuccess >= 95 ? 'positive' : avgSuccess >= 90 ? 'warning' : 'destructive', hint: 'Active agents only' },
      { label: 'Needs attention', value: `${needsAttention}`, icon: 'lucideCircleX', tone: needsAttention === 0 ? 'positive' : 'destructive', hint: needsAttention === 0 ? 'All healthy' : '<90% success rate' },
      { label: 'Drafts', value: `${drafts}`, icon: 'lucideCircleDashed', tone: 'neutral', hint: 'Waiting on review' },
      { label: 'Spend today', value: `$${totalCost.toFixed(2)}`, icon: 'lucideCircleDollarSign', tone: 'neutral', hint: 'Across all runs' },
    ];
  });

  protected readonly sortKey = signal<SortKey>('lastRun');
  protected readonly sortDir = signal<SortDirection>('asc');
  protected readonly page = signal(1);

  protected readonly activeAgent = signal<Agent | null>(null);

  protected readonly filteredAgents = computed<readonly Agent[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const owner = this.selectedOwner();

    return this.agents.filter((a) => {
      if (status !== 'all' && a.status !== status) return false;
      if (owner && a.owner.initials !== owner.initials) return false;
      if (q && !`${a.name} ${a.description} ${a.category} ${a.tags.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  protected readonly sortedAgents = computed<readonly Agent[]>(() => {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.filteredAgents()].sort((a, b) => {
      const av =
        key === 'lastRun' ? a.lastRunMinutes
        : key === 'runsToday' ? a.runsToday
        : key === 'successRate' ? a.successRate
        : key === 'created' ? a.createdDays
        : a.name;
      const bv =
        key === 'lastRun' ? b.lastRunMinutes
        : key === 'runsToday' ? b.runsToday
        : key === 'successRate' ? b.successRate
        : key === 'created' ? b.createdDays
        : b.name;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedAgents().length / AGENTS_PAGE_SIZE)),
  );
  protected readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  protected readonly paginatedAgents = computed<readonly Agent[]>(() => {
    const all = this.sortedAgents();
    const start = (this.page() - 1) * AGENTS_PAGE_SIZE;
    return all.slice(start, start + AGENTS_PAGE_SIZE);
  });

  protected readonly visibleRange = computed(() => {
    const total = this.sortedAgents().length;
    if (total === 0) return { start: 0, end: 0, total: 0 };
    const start = (this.page() - 1) * AGENTS_PAGE_SIZE + 1;
    const end = Math.min(start + AGENTS_PAGE_SIZE - 1, total);
    return { start, end, total };
  });

  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected readonly allOnPageSelected = computed(() => {
    const ids = this.selectedIds();
    const page = this.paginatedAgents();
    return page.length > 0 && page.every((a) => ids.has(a.id));
  });

  protected readonly someOnPageSelected = computed(() => {
    const ids = this.selectedIds();
    return this.paginatedAgents().some((a) => ids.has(a.id));
  });

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected toggleSelected(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleSelectAll(): void {
    this.selectedIds.update((set) => {
      const pageIds = this.paginatedAgents().map((a) => a.id);
      const allSelected = pageIds.every((id) => set.has(id));
      const next = new Set(set);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected bulkAction(kind: 'run' | 'disable' | 'archive' | 'delete'): void {
    const n = this.selectedCount();
    switch (kind) {
      case 'run':
        toast.success(`Queued ${n} agents`);
        break;
      case 'disable':
        toast.warning(`Disabled ${n} agents`);
        break;
      case 'archive':
        toast.info(`Archived ${n} agents`);
        break;
      case 'delete':
        toast.error(`Deleted ${n} agents`, { description: 'Mock — nothing actually removed' });
        break;
    }
    this.clearSelection();
  }

  protected readonly previewAgent = signal<Agent | null>(null);
  protected readonly previewTrigger = viewChild<ElementRef<HTMLButtonElement>>('previewTrigger');

  protected openPreview(agent: Agent): void {
    this.previewAgent.set(agent);
    queueMicrotask(() => this.previewTrigger()?.nativeElement.click());
  }

  protected readonly newAgentTrigger = viewChild<ElementRef<HTMLButtonElement>>('newAgentTrigger');

  protected readonly newAgentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Email', Validators.required],
    ownerId: ['mj', Validators.required],
    iconName: ['lucideBot', Validators.required],
    status: ['draft' as 'draft' | 'active', Validators.required],
    enabled: [true],
  });

  protected get nameCtrl() {
    return this.newAgentForm.controls.name;
  }
  protected get descCtrl() {
    return this.newAgentForm.controls.description;
  }

  protected openNewAgentDialog(): void {
    this.newAgentForm.reset({
      name: '',
      description: '',
      category: 'Email',
      ownerId: 'mj',
      iconName: 'lucideBot',
      status: 'draft',
      enabled: true,
    });
    queueMicrotask(() => this.newAgentTrigger()?.nativeElement.click());
  }

  protected submitNewAgent(ctx: { close: () => void }): void {
    if (this.newAgentForm.invalid) {
      this.newAgentForm.markAllAsTouched();
      return;
    }
    const v = this.newAgentForm.getRawValue();
    toast.success(`Created "${v.name}"`, {
      description: `New ${v.status} agent in ${v.category}`,
    });
    ctx.close();
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

  protected needsAttention(agent: Agent): boolean {
    return agent.status === 'active' && agent.successRate > 0 && agent.successRate < 90;
  }

  protected sparkPath(series: readonly number[]): string {
    if (series.length === 0) return '';
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const w = 100;
    const h = 24;
    return series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.page.set(1);
  }

  protected goToPage(target: number): void {
    this.page.set(Math.max(1, Math.min(target, this.totalPages())));
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.selectedOwner.set(null);
    this.ownerSearch.set('');
    this.page.set(1);
  }

  protected onSearch(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.page.set(1);
  }

  protected onStatusChange(value: unknown): void {
    const next = (value as StatusFilter | null | undefined) ?? 'all';
    this.statusFilter.set(next);
    this.page.set(1);
  }

  protected setActiveAgent(agent: Agent): void {
    this.activeAgent.set(agent);
  }

  protected runAgent(agent: Agent): void {
    toast.success(`${agent.name} queued for run`, { description: 'Started by you · just now' });
  }
  protected editAgent(agent: Agent): void {
    toast.info(`Opening editor for ${agent.name}`);
  }
  protected duplicateAgent(agent: Agent): void {
    toast.success(`Duplicated ${agent.name}`, { description: 'New draft created' });
  }
  protected toggleAgentEnabled(agent: Agent): void {
    if (agent.status === 'disabled') {
      toast.success(`Enabled ${agent.name}`);
    } else {
      toast.warning(`Disabled ${agent.name}`, { description: 'No further runs will be triggered' });
    }
  }
  protected deleteAgent(agent: Agent): void {
    toast.error(`Deleted ${agent.name}`, { description: 'Mock — no real data was changed' });
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 400);
  }
}