import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import type { Author } from '../../core/model';

type MyReview = 'pending' | 'approved' | 'changes-requested';
type Filter = 'pending' | 'mine' | 'all';

interface ReviewingPr {
  readonly id: string;
  readonly title: string;
  readonly repo: string;
  readonly branch: string;
  readonly author: Author;
  readonly myReview: MyReview;
  readonly requestedAt: string;
  readonly added: number;
  readonly removed: number;
  readonly otherApprovals: number;
  readonly urgent?: boolean;
}

@Component({
  selector: 'app-reviewing',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmAvatarImports],
  templateUrl: './reviewing.html',
  styleUrl: './reviewing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reviewing {
  protected readonly filter = signal<Filter>('pending');
  protected setFilter(f: Filter): void { this.filter.set(f); }

  protected readonly rows: readonly ReviewingPr[] = [
    {
      id: '142', title: 'Fix race condition in agent run scheduler',
      repo: 'forge/runtime', branch: 'feat/runner-v2',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      myReview: 'pending', requestedAt: 'requested 4h ago',
      added: 89, removed: 23, otherApprovals: 1, urgent: true,
    },
    {
      id: '141', title: 'Migrate authn middleware to Fastify',
      repo: 'forge/api', branch: 'chore/fastify-auth',
      author: { name: 'Aiko Tanaka', initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' },
      myReview: 'pending', requestedAt: 'requested 1h ago',
      added: 312, removed: 184, otherApprovals: 0,
    },
    {
      id: '139', title: 'Add streaming endpoint for live execution logs',
      repo: 'forge/runtime', branch: 'feat/live-logs',
      author: { name: 'Quinn Hayes', initials: 'QH', tone: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' },
      myReview: 'approved', requestedAt: 'requested 1d ago',
      added: 247, removed: 8, otherApprovals: 2,
    },
    {
      id: '135', title: 'Bulk approve action with undo toast',
      repo: 'forge/web', branch: 'feat/bulk-approve',
      author: { name: 'Diego Brooks', initials: 'DB', tone: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' },
      myReview: 'changes-requested', requestedAt: 'requested 2d ago',
      added: 178, removed: 22, otherApprovals: 0,
    },
    {
      id: '131', title: 'Settings: persist density preference per device',
      repo: 'forge/web', branch: 'feat/density-pref',
      author: { name: 'Nia Walsh', initials: 'NW', tone: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' },
      myReview: 'approved', requestedAt: 'requested 3d ago',
      added: 56, removed: 14, otherApprovals: 1,
    },
  ];

  protected readonly visibleRows = computed<readonly ReviewingPr[]>(() => {
    const f = this.filter();
    if (f === 'all')     return this.rows;
    if (f === 'mine')    return this.rows.filter(r => r.myReview !== 'pending');
    return this.rows.filter(r => r.myReview === 'pending');
  });

  protected readonly filters: { key: Filter; label: string; count: number }[] = [
    { key: 'pending', label: 'Awaiting you', count: this.rows.filter(r => r.myReview === 'pending').length },
    { key: 'mine',    label: 'Reviewed',     count: this.rows.filter(r => r.myReview !== 'pending').length },
    { key: 'all',     label: 'All',          count: this.rows.length },
  ];

  protected reviewBadge(s: MyReview): { label: string; tone: string; icon: string } {
    if (s === 'approved') {
      return { label: 'You approved', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30', icon: 'lucideCheck' };
    }
    if (s === 'changes-requested') {
      return { label: 'Changes requested', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30', icon: 'lucideMessageSquare' };
    }
    return { label: 'Review pending', tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30', icon: 'lucideClock' };
  }

  protected statusAccent(s: MyReview): string {
    switch (s) {
      case 'approved':          return 'border-l-emerald-500';
      case 'changes-requested': return 'border-l-amber-500';
      case 'pending':           return 'border-l-sky-500';
    }
  }
}
