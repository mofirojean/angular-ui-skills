import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

interface PrRow {
  id: string;
  title: string;
  repo: string;
  branch: string;
  author: { name: string; initials: string; };
  reviewers: { initials: string; tone: string; }[];
  labels: { name: string; tone: string; }[];
  status: 'open' | 'draft' | 'approved' | 'changes-requested';
  added: number;
  removed: number;
  updatedAgo: string;
}

@Component({
  selector: 'app-inbox',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmBadgeImports, HlmAvatarImports],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inbox {
  protected readonly filters = [
    { key: 'needs',  label: 'Needs review', count: 7, active: true },
    { key: 'wait',   label: 'Waiting on author', count: 3, active: false },
    { key: 'approved', label: 'Approved', count: 2, active: false },
    { key: 'all',    label: 'All', count: 12, active: false },
  ];

  protected readonly rows: readonly PrRow[] = [
    {
      id: '142',
      title: 'Fix race condition in agent run scheduler',
      repo: 'forge/runtime',
      branch: 'feat/runner-v2',
      author: { name: 'Sasha Lin', initials: 'SL' },
      reviewers: [
        { initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
        { initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
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
      reviewers: [{ initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' }],
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
