import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import type { PrRow } from '../../core/model';

type FilterKey = 'needs' | 'wait' | 'approved' | 'all';

@Component({
  selector: 'app-inbox',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmBadgeImports, HlmAvatarImports],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inbox {
  protected readonly activeFilter = signal<FilterKey>('needs');

  protected readonly filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'needs',    label: 'Needs review',      count: 13 },
    { key: 'wait',     label: 'Waiting on author', count:  5 },
    { key: 'approved', label: 'Approved',          count:  4 },
    { key: 'all',      label: 'All',               count: 22 },
  ];

  protected setFilter(key: FilterKey): void { this.activeFilter.set(key); }

  protected readonly visibleRows = computed<readonly PrRow[]>(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.rows;
    if (f === 'approved') return this.rows.filter(r => r.status === 'approved');
    if (f === 'wait') return this.rows.filter(r => r.status === 'changes-requested');
    return this.rows.filter(r => r.status === 'open' || r.status === 'draft');
  });

  protected readonly subtitle = computed<string>(() => {
    const f = this.activeFilter();
    const n = this.visibleRows().length;
    if (f === 'needs')    return `${n} pull request${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} your review`;
    if (f === 'wait')     return `${n} waiting on the author`;
    if (f === 'approved') return `${n} approved by you`;
    return `${n} pull request${n === 1 ? '' : 's'} in the queue`;
  });

  protected statusAccent(s: PrRow['status']): string {
    switch (s) {
      case 'open':              return 'border-l-sky-500';
      case 'draft':              return 'border-l-zinc-300 dark:border-l-zinc-700';
      case 'approved':           return 'border-l-emerald-500';
      case 'changes-requested':  return 'border-l-amber-500';
    }
  }

  protected reviewerRing(s: 'approved' | 'requested-changes' | 'pending' | undefined): string {
    if (s === 'approved')          return 'ring-emerald-500/80';
    if (s === 'requested-changes') return 'ring-amber-500/80';
    return 'ring-background';
  }

  protected authorTone(initials: string): string {
    const palette = [
      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300',
      'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
      'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300',
      'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
      'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300',
      'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) hash = (hash * 31 + initials.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  }

  protected readonly rows: readonly PrRow[] = [
    {
      id: '142',
      title: 'Fix race condition in agent run scheduler',
      repo: 'forge/runtime',
      branch: 'feat/runner-v2',
      author: { name: 'Sasha Lin', initials: 'SL' },
      reviewers: [
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', review: 'pending' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300', review: 'approved' },
      ],
      labels: [
        { name: 'bug',  tone: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
        { name: 'p1',   tone: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
      ],
      status: 'open',
      added: 89, removed: 23,
      updatedAgo: '12m ago',
    },
    {
      id: '141',
      title: 'Migrate authn middleware to Fastify',
      repo: 'forge/api',
      branch: 'chore/fastify-auth',
      author: { name: 'Aiko Tanaka', initials: 'AT' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [{ name: 'chore', tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }],
      status: 'open',
      added: 312, removed: 184,
      updatedAgo: '1h ago',
    },
    {
      id: '140',
      title: 'Polish settings sub-sidenav icon alignment',
      repo: 'forge/web',
      branch: 'polish/settings',
      author: { name: 'Mofiro Jean', initials: 'MJ' },
      reviewers: [{ initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300', review: 'approved' }],
      labels: [{ name: 'polish', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' }],
      status: 'approved',
      added: 14, removed: 9,
      updatedAgo: '3h ago',
    },
    {
      id: '139',
      title: 'Add streaming endpoint for live execution logs',
      repo: 'forge/runtime',
      branch: 'feat/live-logs',
      author: { name: 'Quinn Hayes', initials: 'QH' },
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ],
      labels: [
        { name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
      ],
      status: 'changes-requested',
      added: 421, removed: 38,
      updatedAgo: '5h ago',
    },
    {
      id: '138',
      title: 'Bump @angular/cdk to 21.2.14',
      repo: 'forge/web',
      branch: 'chore/deps',
      author: { name: 'Riley Chen', initials: 'RC' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [
        { name: 'chore', tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
        { name: 'deps',  tone: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
      ],
      status: 'open',
      added: 4, removed: 4,
      updatedAgo: '1d ago',
    },
    {
      id: '137',
      title: 'Document review-cycle calibration flow',
      repo: 'forge/docs',
      branch: 'docs/calibration',
      author: { name: 'Lena Petrov', initials: 'LP' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [{ name: 'docs', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }],
      status: 'draft',
      added: 156, removed: 4,
      updatedAgo: '2d ago',
    },
    {
      id: '136',
      title: 'Implement bulk-approve action with undo',
      repo: 'forge/web',
      branch: 'feat/bulk-approve',
      author: { name: 'Diego Brooks', initials: 'DB' },
      reviewers: [
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
        { initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' },
      ],
      labels: [{ name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }],
      status: 'open',
      added: 178, removed: 22,
      updatedAgo: '2d ago',
    },
    {
      id: '135',
      title: 'Refactor command palette to use signals',
      repo: 'forge/web',
      branch: 'refactor/palette-signals',
      author: { name: 'Sasha Lin', initials: 'SL' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [{ name: 'refactor', tone: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' }],
      status: 'approved',
      added: 92, removed: 144,
      updatedAgo: '3d ago',
    },
    {
      id: '134',
      title: 'Add CI status badges to the PR list',
      repo: 'forge/web',
      branch: 'feat/ci-badges',
      author: { name: 'Hana Yamamoto', initials: 'HY' },
      reviewers: [
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ],
      labels: [
        { name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
        { name: 'ui',   tone: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
      ],
      status: 'open',
      added: 64, removed: 11,
      updatedAgo: '3d ago',
    },
    {
      id: '133',
      title: 'Fix sidebar collapse animation on Safari',
      repo: 'forge/web',
      branch: 'fix/safari-sidebar',
      author: { name: 'Felix Moreau', initials: 'FM' },
      reviewers: [{ initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' }],
      labels: [
        { name: 'bug', tone: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
      ],
      status: 'changes-requested',
      added: 18, removed: 22,
      updatedAgo: '4d ago',
    },
    {
      id: '132',
      title: 'Add OpenAPI generator to the api build pipeline',
      repo: 'forge/api',
      branch: 'chore/openapi-gen',
      author: { name: 'Owen Carter', initials: 'OC' },
      reviewers: [
        { initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' },
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ],
      labels: [{ name: 'chore', tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }],
      status: 'open',
      added: 287, removed: 41,
      updatedAgo: '4d ago',
    },
    {
      id: '131',
      title: 'Surface CI failures as inline diff annotations',
      repo: 'forge/runtime',
      branch: 'feat/inline-annotations',
      author: { name: 'Riley Chen', initials: 'RC' },
      reviewers: [
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ],
      labels: [
        { name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
        { name: 'p1',   tone: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
      ],
      status: 'open',
      added: 412, removed: 18,
      updatedAgo: '5d ago',
    },
    {
      id: '130',
      title: 'Wire reviewer assignment to teams API',
      repo: 'forge/api',
      branch: 'feat/team-reviewers',
      author: { name: 'Quinn Hayes', initials: 'QH' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [{ name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }],
      status: 'draft',
      added: 96, removed: 8,
      updatedAgo: '5d ago',
    },
    {
      id: '129',
      title: 'Tighten focus ring on dropdown menu items',
      repo: 'forge/web',
      branch: 'polish/focus-rings',
      author: { name: 'Mofiro Jean', initials: 'MJ' },
      reviewers: [{ initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' }],
      labels: [
        { name: 'polish', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
        { name: 'a11y',   tone: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
      ],
      status: 'approved',
      added: 7, removed: 4,
      updatedAgo: '6d ago',
    },
    {
      id: '128',
      title: 'Migrate from Karma to Vitest',
      repo: 'forge/web',
      branch: 'chore/vitest',
      author: { name: 'Marcus Webb', initials: 'MW' },
      reviewers: [
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      ],
      labels: [
        { name: 'chore', tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
        { name: 'tests', tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
      ],
      status: 'open',
      added: 624, removed: 318,
      updatedAgo: '1w ago',
    },
    {
      id: '127',
      title: 'Add command palette keyboard shortcuts page',
      repo: 'forge/docs',
      branch: 'docs/shortcuts',
      author: { name: 'Ines Romero', initials: 'IR' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [{ name: 'docs', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' }],
      status: 'open',
      added: 89, removed: 0,
      updatedAgo: '1w ago',
    },
    {
      id: '126',
      title: 'Persist sidebar collapsed state across reloads',
      repo: 'forge/web',
      branch: 'feat/sidebar-persist',
      author: { name: 'Aiko Tanaka', initials: 'AT' },
      reviewers: [{ initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }],
      labels: [
        { name: 'feat',  tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
        { name: 'polish', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
      ],
      status: 'approved',
      added: 34, removed: 6,
      updatedAgo: '1w ago',
    },
    {
      id: '125',
      title: 'Add health endpoint to the runtime image',
      repo: 'forge/runtime',
      branch: 'feat/health-check',
      author: { name: 'Theo Cohen', initials: 'TC' },
      reviewers: [{ initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' }],
      labels: [
        { name: 'feat', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
        { name: 'infra', tone: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' },
      ],
      status: 'open',
      added: 52, removed: 3,
      updatedAgo: '1w ago',
    },
    {
      id: '124',
      title: 'Theme runtime logs viewer to match shell tokens',
      repo: 'forge/web',
      branch: 'polish/logs-theme',
      author: { name: 'Zara Idris', initials: 'ZI' },
      reviewers: [{ initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' }],
      labels: [{ name: 'polish', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' }],
      status: 'draft',
      added: 41, removed: 22,
      updatedAgo: '2w ago',
    },
    {
      id: '123',
      title: 'Replace lodash with native helpers in /web',
      repo: 'forge/web',
      branch: 'chore/drop-lodash',
      author: { name: 'Cyrus Lopez', initials: 'CL' },
      reviewers: [
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', review: 'requested-changes' },
      ],
      labels: [
        { name: 'chore', tone: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
        { name: 'deps',  tone: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300' },
      ],
      status: 'changes-requested',
      added: 138, removed: 412,
      updatedAgo: '2w ago',
    },
    {
      id: '122',
      title: 'Add Storybook for the helm wrapper library',
      repo: 'forge/web',
      branch: 'feat/storybook',
      author: { name: 'Nia Walsh', initials: 'NW' },
      reviewers: [
        { initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' },
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
        { initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
        { initials: 'QH', tone: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' },
      ],
      labels: [
        { name: 'feat',  tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
        { name: 'docs',  tone: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
      ],
      status: 'open',
      added: 487, removed: 12,
      updatedAgo: '3w ago',
    },
  ];

  protected statusLabel(s: PrRow['status']): string {
    if (s === 'open') return 'Open';
    if (s === 'draft') return 'Draft';
    if (s === 'approved') return 'Approved';
    return 'Changes requested';
  }

  protected statusTone(s: PrRow['status']): string {
    if (s === 'approved') return 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
    if (s === 'changes-requested') return 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
    if (s === 'draft') return 'border-zinc-400/30 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300';
    return 'border-sky-500/30 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300';
  }
}
