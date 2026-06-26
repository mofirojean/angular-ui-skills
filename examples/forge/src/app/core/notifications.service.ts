import { Injectable, computed, signal } from '@angular/core';

import type { Author } from './model';

export type NotificationKind =
  | 'review-requested'
  | 'mentioned'
  | 'pushed'
  | 'approved'
  | 'replied'
  | 'ci-failed';

export interface NotificationEntry {
  readonly id: string;
  readonly kind: NotificationKind;
  readonly actor: Author;
  readonly prId: string;
  readonly prTitle: string;
  readonly repo: string;
  readonly snippet?: string;
  readonly ago: string;
  readonly read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  readonly open = signal(false);

  readonly items = signal<readonly NotificationEntry[]>([
    {
      id: 'n-1', kind: 'review-requested',
      actor: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      prId: '142', prTitle: 'Fix race condition in agent run scheduler', repo: 'forge/runtime',
      ago: '12m ago', read: false,
    },
    {
      id: 'n-2', kind: 'mentioned',
      actor: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      prId: '141', prTitle: 'Migrate authn middleware to Fastify', repo: 'forge/api',
      snippet: '@mofirojean does the new middleware bypass keep working for /health?',
      ago: '47m ago', read: false,
    },
    {
      id: 'n-3', kind: 'ci-failed',
      actor: { name: 'forge-ci', initials: 'CI', tone: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
      prId: '138', prTitle: 'Adopt ngx-sonner for global toast layer', repo: 'forge/web',
      snippet: 'e2e failed on shard 3, ToastQueueSpec › replaces stale toast',
      ago: '1h ago', read: false,
    },
    {
      id: 'n-4', kind: 'approved',
      actor: { name: 'Quinn Hayes', initials: 'QH', tone: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' },
      prId: '140', prTitle: 'Polish settings sub-sidenav icon alignment', repo: 'forge/web',
      ago: '3h ago', read: true,
    },
    {
      id: 'n-5', kind: 'replied',
      actor: { name: 'Aiko Tanaka', initials: 'AT', tone: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-700 dark:text-fuchsia-300' },
      prId: '142', prTitle: 'Fix race condition in agent run scheduler', repo: 'forge/runtime',
      snippet: 'Good catch on the timeout. Let\'s also surface this in /metrics.',
      ago: '5h ago', read: true,
    },
    {
      id: 'n-6', kind: 'pushed',
      actor: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      prId: '142', prTitle: 'Fix race condition in agent run scheduler', repo: 'forge/runtime',
      snippet: 'pushed 3 commits to feat/runner-v2',
      ago: '6h ago', read: true,
    },
    {
      id: 'n-7', kind: 'review-requested',
      actor: { name: 'Diego Brooks', initials: 'DB', tone: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' },
      prId: '135', prTitle: 'Bulk approve action with undo toast', repo: 'forge/web',
      ago: '2d ago', read: true,
    },
  ]);

  readonly unreadCount = computed(() => this.items().filter(n => !n.read).length);

  show(): void  { this.open.set(true); }
  hide(): void  { this.open.set(false); }
  toggle(): void { this.open.update(v => !v); }

  markAllRead(): void {
    this.items.update(arr => arr.map(n => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this.items.update(arr => arr.map(n => n.id === id ? { ...n, read: true } : n));
  }
}
