import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';

type Visibility = 'private' | 'internal' | 'public';
type CiStatus = 'pass' | 'fail' | 'pending' | 'none';
type Filter = 'pinned' | 'active' | 'archived' | 'all';

interface Topic {
  readonly name: string;
  readonly tone: string;
}

interface RepoRow {
  readonly name: string;
  readonly description: string;
  readonly defaultBranch: string;
  readonly ci: CiStatus;
  readonly openPrs: number;
  readonly branches: number;
  readonly contributors: number;
  readonly commitsToday: number;
  readonly lastPush: string;
  readonly visibility: Visibility;
  readonly protected: boolean;
  readonly pinned: boolean;
  readonly archived?: boolean;
  readonly lang: string;
  readonly langTone: string;
  readonly topics: readonly Topic[];
}

@Component({
  selector: 'app-repos',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmTooltip],
  templateUrl: './repos.html',
  styleUrl: './repos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {
  protected readonly activeFilter = signal<Filter>('all');
  protected setFilter(f: Filter): void { this.activeFilter.set(f); }

  protected readonly repos: readonly RepoRow[] = [
    {
      name: 'forge/runtime',
      description: 'Agent execution engine, scheduler, and lifecycle manager.',
      defaultBranch: 'main',
      ci: 'pass',
      openPrs: 3, branches: 12, contributors: 7, commitsToday: 4,
      lastPush: '4h ago',
      visibility: 'internal', protected: true, pinned: true,
      lang: 'TypeScript', langTone: 'bg-sky-500',
      topics: [
        { name: 'agents',  tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
        { name: 'runtime', tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
      ],
    },
    {
      name: 'forge/api',
      description: 'REST and GraphQL API surface for clients and integrations.',
      defaultBranch: 'main',
      ci: 'pending',
      openPrs: 7, branches: 18, contributors: 9, commitsToday: 2,
      lastPush: '1h ago',
      visibility: 'internal', protected: true, pinned: true,
      lang: 'TypeScript', langTone: 'bg-sky-500',
      topics: [
        { name: 'api',     tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
        { name: 'graphql', tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
      ],
    },
    {
      name: 'forge/web',
      description: 'The Forge review console, Angular + Spartan/ng.',
      defaultBranch: 'main',
      ci: 'pass',
      openPrs: 2, branches: 9, contributors: 5, commitsToday: 6,
      lastPush: '12m ago',
      visibility: 'internal', protected: true, pinned: true,
      lang: 'TypeScript', langTone: 'bg-sky-500',
      topics: [
        { name: 'frontend', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
        { name: 'angular',  tone: 'bg-red-500/10 text-red-700 dark:text-red-300' },
      ],
    },
    {
      name: 'forge/docs',
      description: 'Public docs site, runbooks, and architecture references.',
      defaultBranch: 'main',
      ci: 'fail',
      openPrs: 1, branches: 4, contributors: 3, commitsToday: 0,
      lastPush: '2d ago',
      visibility: 'public', protected: false, pinned: true,
      lang: 'Markdown', langTone: 'bg-zinc-400',
      topics: [
        { name: 'docs', tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
      ],
    },
    {
      name: 'forge/cli',
      description: 'Command-line entry point, runs locally and against deployments.',
      defaultBranch: 'main',
      ci: 'pass',
      openPrs: 0, branches: 3, contributors: 4, commitsToday: 1,
      lastPush: '6h ago',
      visibility: 'internal', protected: true, pinned: false,
      lang: 'Rust', langTone: 'bg-orange-500',
      topics: [
        { name: 'cli', tone: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300' },
      ],
    },
    {
      name: 'forge/devx',
      description: 'Internal developer experience tools, codegen, scripts.',
      defaultBranch: 'main',
      ci: 'pending',
      openPrs: 4, branches: 6, contributors: 6, commitsToday: 3,
      lastPush: '38m ago',
      visibility: 'internal', protected: false, pinned: false,
      lang: 'TypeScript', langTone: 'bg-sky-500',
      topics: [
        { name: 'tooling', tone: 'bg-teal-500/10 text-teal-700 dark:text-teal-300' },
      ],
    },
    {
      name: 'forge/runtime-bench',
      description: 'Benchmark harness for runtime hot paths and load tests.',
      defaultBranch: 'main',
      ci: 'pass',
      openPrs: 1, branches: 2, contributors: 2, commitsToday: 0,
      lastPush: '3d ago',
      visibility: 'internal', protected: false, pinned: false,
      lang: 'Go', langTone: 'bg-cyan-500',
      topics: [
        { name: 'bench', tone: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300' },
      ],
    },
    {
      name: 'forge/scratch',
      description: 'Experimental sandbox, anything can break, no SLAs.',
      defaultBranch: 'main',
      ci: 'none',
      openPrs: 0, branches: 27, contributors: 4, commitsToday: 0,
      lastPush: '4w ago',
      visibility: 'private', protected: false, pinned: false,
      archived: true,
      lang: 'TypeScript', langTone: 'bg-sky-500',
      topics: [
        { name: 'sandbox', tone: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300' },
      ],
    },
  ];

  protected readonly visibleRepos = computed<readonly RepoRow[]>(() => {
    const f = this.activeFilter();
    if (f === 'all')      return this.repos;
    if (f === 'pinned')   return this.repos.filter(r => r.pinned);
    if (f === 'archived') return this.repos.filter(r => r.archived);
    return this.repos.filter(r => !r.archived);
  });

  protected readonly filters: { key: Filter; label: string; count: number }[] = [
    { key: 'pinned',   label: 'Pinned',   count: this.repos.filter(r => r.pinned).length },
    { key: 'active',   label: 'Active',   count: this.repos.filter(r => !r.archived).length },
    { key: 'archived', label: 'Archived', count: this.repos.filter(r => r.archived).length },
    { key: 'all',      label: 'All',      count: this.repos.length },
  ];

  protected readonly totalOpenPrs = computed(() =>
    this.repos.filter(r => !r.archived).reduce((s, r) => s + r.openPrs, 0),
  );

  protected ciIcon(c: CiStatus): string {
    if (c === 'pass')    return 'lucideCircleCheck';
    if (c === 'fail')    return 'lucideCircleX';
    if (c === 'pending') return 'lucideClock';
    return 'lucideMinus';
  }

  protected ciTone(c: CiStatus): string {
    if (c === 'pass')    return 'text-emerald-600 dark:text-emerald-400';
    if (c === 'fail')    return 'text-red-600 dark:text-red-400';
    if (c === 'pending') return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  }

  protected ciLabel(c: CiStatus): string {
    if (c === 'pass')    return 'All checks passing';
    if (c === 'fail')    return 'Build failing';
    if (c === 'pending') return 'Checks running';
    return 'No CI configured';
  }

  protected visibilityChip(v: Visibility): { label: string; tone: string } {
    if (v === 'public') {
      return { label: 'Public', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30' };
    }
    if (v === 'internal') {
      return { label: 'Internal', tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30' };
    }
    return { label: 'Private', tone: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 ring-1 ring-zinc-500/30' };
  }
}
