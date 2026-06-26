import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import type { MiniAvatar } from '../../core/model';

type AuthoredStatus = 'open' | 'changes-requested' | 'approved' | 'merged' | 'closed';
type Tab = 'open' | 'merged' | 'closed' | 'all';

interface AuthoredPr {
  readonly id: string;
  readonly title: string;
  readonly repo: string;
  readonly branch: string;
  readonly status: AuthoredStatus;
  readonly reviewers: readonly MiniAvatar[];
  readonly approvals: number;
  readonly changesRequested: number;
  readonly ci: 'pass' | 'fail' | 'pending' | 'none';
  readonly added: number;
  readonly removed: number;
  readonly age: string;
  readonly mergedAgo?: string;
}

@Component({
  selector: 'app-authored',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmAvatarImports],
  templateUrl: './authored.html',
  styleUrl: './authored.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Authored {
  protected readonly activeTab = signal<Tab>('open');
  protected setTab(t: Tab): void { this.activeTab.set(t); }

  protected readonly rows: readonly AuthoredPr[] = [
    {
      id: '140', title: 'Polish settings sub-sidenav icon alignment',
      repo: 'forge/web', branch: 'polish/settings',
      status: 'approved',
      reviewers: [
        { initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300', review: 'approved' },
      ],
      approvals: 1, changesRequested: 0, ci: 'pass',
      added: 14, removed: 9, age: '3h ago',
    },
    {
      id: '138', title: 'Adopt ngx-sonner for global toast layer',
      repo: 'forge/web', branch: 'feat/ngx-sonner',
      status: 'open',
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', review: 'pending' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300', review: 'pending' },
      ],
      approvals: 0, changesRequested: 0, ci: 'pending',
      added: 64, removed: 11, age: '6h ago',
    },
    {
      id: '133', title: 'Trim runtime config schema to required keys',
      repo: 'forge/runtime', branch: 'refactor/config-trim',
      status: 'changes-requested',
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', review: 'requested-changes' },
        { initials: 'QH', tone: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300', review: 'approved' },
      ],
      approvals: 1, changesRequested: 1, ci: 'fail',
      added: 132, removed: 64, age: '1d ago',
    },
    {
      id: '128', title: 'Pin spartan-ng to 1.0.1',
      repo: 'forge/web', branch: 'chore/spartan-1.0.1',
      status: 'merged',
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', review: 'approved' },
      ],
      approvals: 1, changesRequested: 0, ci: 'pass',
      added: 8, removed: 8, age: '2d ago', mergedAgo: 'merged yesterday',
    },
    {
      id: '120', title: 'Replace any[] in mock-data.service.ts',
      repo: 'forge/web', branch: 'chore/types-mock',
      status: 'closed',
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', review: 'pending' },
      ],
      approvals: 0, changesRequested: 0, ci: 'none',
      added: 22, removed: 12, age: '5d ago',
    },
  ];

  protected readonly visibleRows = computed<readonly AuthoredPr[]>(() => {
    const t = this.activeTab();
    if (t === 'all') return this.rows;
    if (t === 'merged') return this.rows.filter(r => r.status === 'merged');
    if (t === 'closed') return this.rows.filter(r => r.status === 'closed');
    return this.rows.filter(r => r.status === 'open' || r.status === 'changes-requested' || r.status === 'approved');
  });

  protected readonly tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'open',   label: 'Open',   count: this.rows.filter(r => r.status !== 'merged' && r.status !== 'closed').length },
    { key: 'merged', label: 'Merged', count: this.rows.filter(r => r.status === 'merged').length },
    { key: 'closed', label: 'Closed', count: this.rows.filter(r => r.status === 'closed').length },
    { key: 'all',    label: 'All',    count: this.rows.length },
  ];

  protected statusAccent(s: AuthoredStatus): string {
    switch (s) {
      case 'open':              return 'border-l-sky-500';
      case 'approved':          return 'border-l-emerald-500';
      case 'changes-requested': return 'border-l-amber-500';
      case 'merged':            return 'border-l-violet-500';
      case 'closed':            return 'border-l-zinc-400';
    }
  }

  protected reviewerRing(r: MiniAvatar): string {
    if (r.review === 'approved')          return 'ring-emerald-500/80';
    if (r.review === 'requested-changes') return 'ring-amber-500/80';
    return 'ring-background';
  }

  protected reviewSummary(row: AuthoredPr): { label: string; tone: string; icon: string } {
    if (row.changesRequested > 0) {
      return {
        label: `${row.changesRequested} changes requested`,
        tone: 'text-amber-600 dark:text-amber-400',
        icon: 'lucideMessageSquare',
      };
    }
    if (row.approvals >= 1) {
      return {
        label: `${row.approvals} approval${row.approvals === 1 ? '' : 's'}`,
        tone: 'text-emerald-600 dark:text-emerald-400',
        icon: 'lucideCheck',
      };
    }
    return {
      label: 'Awaiting review',
      tone: 'text-muted-foreground',
      icon: 'lucideClock',
    };
  }

  protected ciIcon(ci: AuthoredPr['ci']): string {
    if (ci === 'pass')    return 'lucideCircleCheck';
    if (ci === 'fail')    return 'lucideCircleX';
    if (ci === 'pending') return 'lucideClock';
    return 'lucideMinus';
  }

  protected ciTone(ci: AuthoredPr['ci']): string {
    if (ci === 'pass')    return 'text-emerald-600 dark:text-emerald-400';
    if (ci === 'fail')    return 'text-red-600 dark:text-red-400';
    if (ci === 'pending') return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  }
}
