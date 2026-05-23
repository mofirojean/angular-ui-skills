import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { BadgeVariant, Run, RUNS_PAGE_SIZE, RunDetail, RunStatus, SortDirection, SortKey, StatusFilter } from './runs.model';
import { RUNS, getRunDetail } from './runs.data';

interface AgentFilterOption {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-runs',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmComboboxImports,
    HlmIcon,
    HlmInputGroupImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSheetImports,
    HlmSkeletonImports,
    HlmTableImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './runs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Runs {
  protected readonly isLoading = signal(true);
  protected readonly rowSkeletons = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly selectedAgent = signal<AgentFilterOption | null>(null);
  protected readonly agentSearch = signal('');
  protected readonly triggerFilter = signal<'all' | 'manual' | 'schedule' | 'webhook'>('all');

  protected readonly agentOptions = computed<readonly AgentFilterOption[]>(() => {
    const set = new Map<string, AgentFilterOption>();
    RUNS.forEach((r) => {
      if (!set.has(r.agent.id)) set.set(r.agent.id, { id: r.agent.id, name: r.agent.name });
    });
    return [...set.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly filteredAgents = computed<readonly AgentFilterOption[]>(() => {
    const q = this.agentSearch().toLowerCase().trim();
    if (!q) return this.agentOptions();
    return this.agentOptions().filter((a) => a.name.toLowerCase().includes(q));
  });

  protected readonly agentToString = (a: AgentFilterOption | null): string => a?.name ?? '';
  protected readonly agentEquals = (a: AgentFilterOption | null, b: AgentFilterOption | null) => a?.id === b?.id;

  protected readonly kpis = computed(() => {
    const all = RUNS;
    const succeeded = all.filter((r) => r.status === 'success');
    const failed = all.filter((r) => r.status === 'failed').length;
    const running = all.filter((r) => r.status === 'running' || r.status === 'queued').length;
    const totalCost = all.reduce((sum, r) => sum + r.cost, 0);
    const avgDuration =
      succeeded.length === 0
        ? 0
        : succeeded.reduce((sum, r) => sum + r.durationSeconds, 0) / succeeded.length;

    return [
      { label: 'Total runs', value: all.length.toLocaleString(), icon: 'lucidePlay', tone: 'neutral' },
      { label: 'Succeeded', value: succeeded.length.toLocaleString(), icon: 'lucideCircleCheck', tone: 'positive' },
      { label: 'Failed', value: failed.toLocaleString(), icon: 'lucideCircleX', tone: failed === 0 ? 'positive' : 'destructive' },
      { label: 'In progress', value: running.toLocaleString(), icon: 'lucideClock', tone: 'neutral' },
      { label: 'Avg duration', value: this.formatSeconds(avgDuration), icon: 'lucideClock', tone: 'neutral' },
      { label: 'Total cost', value: `$${totalCost.toFixed(2)}`, icon: 'lucideCircleDollarSign', tone: 'neutral' },
    ] as const;
  });

  protected readonly sortKey = signal<SortKey>('startedAt');
  protected readonly sortDir = signal<SortDirection>('desc');
  protected readonly page = signal(1);

  protected readonly filteredRuns = computed<readonly Run[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const agent = this.selectedAgent();
    const trigger = this.triggerFilter();

    return RUNS.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (agent && r.agent.id !== agent.id) return false;
      if (trigger !== 'all' && r.trigger !== trigger) return false;
      if (q && !`${r.id} ${r.agent.name} ${r.triggeredBy.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  protected readonly sortedRuns = computed<readonly Run[]>(() => {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.filteredRuns()].sort((a, b) => {
      const av =
        key === 'startedAt' ? a.startedMinutes
        : key === 'duration' ? a.durationSeconds
        : key === 'cost' ? a.cost
        : a.agent.name;
      const bv =
        key === 'startedAt' ? b.startedMinutes
        : key === 'duration' ? b.durationSeconds
        : key === 'cost' ? b.cost
        : b.agent.name;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedRuns().length / RUNS_PAGE_SIZE)));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  protected readonly paginatedRuns = computed<readonly Run[]>(() => {
    const all = this.sortedRuns();
    const start = (this.page() - 1) * RUNS_PAGE_SIZE;
    return all.slice(start, start + RUNS_PAGE_SIZE);
  });

  protected readonly visibleRange = computed(() => {
    const total = this.sortedRuns().length;
    if (total === 0) return { start: 0, end: 0, total: 0 };
    const start = (this.page() - 1) * RUNS_PAGE_SIZE + 1;
    const end = Math.min(start + RUNS_PAGE_SIZE - 1, total);
    return { start, end, total };
  });

  protected readonly detailRun = signal<RunDetail | null>(null);
  protected readonly detailTrigger = viewChild<ElementRef<HTMLButtonElement>>('detailTrigger');

  protected openDetail(run: Run): void {
    this.detailRun.set(getRunDetail(run));
    queueMicrotask(() => this.detailTrigger()?.nativeElement.click());
  }

  protected statusVariant(status: RunStatus): BadgeVariant {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'outline';
      case 'queued':
        return 'secondary';
    }
  }

  protected statusIcon(status: RunStatus): string {
    switch (status) {
      case 'success':
        return 'lucideCircleCheck';
      case 'failed':
        return 'lucideCircleX';
      case 'running':
        return 'lucideClock';
      case 'queued':
        return 'lucideCircleDashed';
    }
  }

  protected stepIcon(status: 'completed' | 'running' | 'failed' | 'pending'): string {
    switch (status) {
      case 'completed':
        return 'lucideCircleCheck';
      case 'running':
        return 'lucideClock';
      case 'failed':
        return 'lucideCircleX';
      case 'pending':
        return 'lucideCircleDashed';
    }
  }

  protected triggerIcon(trigger: Run['trigger']): string {
    switch (trigger) {
      case 'webhook':
        return 'lucideWebhook';
      case 'schedule':
        return 'lucideCalendar';
      case 'manual':
        return 'lucideUser';
    }
  }

  protected formatSeconds(s: number): string {
    if (s <= 0) return '—';
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `0:${secs.toString().padStart(2, '0')}`;
  }

  protected formatMs(ms: number): string {
    if (ms === 0) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  protected formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
    this.page.set(1);
  }

  protected goToPage(target: number): void {
    this.page.set(Math.max(1, Math.min(target, this.totalPages())));
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.selectedAgent.set(null);
    this.agentSearch.set('');
    this.triggerFilter.set('all');
    this.page.set(1);
  }

  protected onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected onStatusChange(value: unknown): void {
    const next = (value as StatusFilter | null | undefined) ?? 'all';
    this.statusFilter.set(next);
    this.page.set(1);
  }

  protected onTriggerChange(value: unknown): void {
    const next = (value as 'all' | 'manual' | 'schedule' | 'webhook' | null | undefined) ?? 'all';
    this.triggerFilter.set(next);
    this.page.set(1);
  }

  protected retryRun(): void {
    const r = this.detailRun();
    if (!r) return;
    toast.success(`Retrying ${r.id}`, { description: `${r.agent.name} requeued` });
  }

  protected copyRunId(): void {
    const r = this.detailRun();
    if (!r) return;
    void navigator.clipboard?.writeText(r.id);
    toast.info('Run ID copied to clipboard');
  }

  protected get hasFilters(): boolean {
    return (
      !!this.searchQuery() ||
      this.statusFilter() !== 'all' ||
      this.selectedAgent() !== null ||
      this.triggerFilter() !== 'all'
    );
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 400);
  }
}
