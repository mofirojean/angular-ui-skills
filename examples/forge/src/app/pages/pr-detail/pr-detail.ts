import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

type TabKey = 'conversation' | 'files' | 'commits' | 'checks';

interface TimelineItem {
  kind: 'description' | 'comment' | 'event' | 'review';
  author?: { name: string; initials: string; tone: string };
  ago: string;
  body?: string;
  icon?: string;
  label?: string;
  verdict?: string;
}

@Component({
  selector: 'app-pr-detail',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmAvatarImports],
  templateUrl: './pr-detail.html',
  styleUrl: './pr-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrDetail {
  readonly id = input<string>('');

  protected readonly activeTab = signal<TabKey>('conversation');

  protected readonly tabs: { key: TabKey; label: string; count?: number; icon: string; }[] = [
    { key: 'conversation', label: 'Conversation', icon: 'lucideMessageSquare', count: 7 },
    { key: 'files',        label: 'Files changed', icon: 'lucideFiles',        count: 12 },
    { key: 'commits',      label: 'Commits',       icon: 'lucideGitCommit',    count: 4 },
    { key: 'checks',       label: 'Checks',        icon: 'lucideCircleCheck',  count: 5 },
  ];

  protected setTab(t: TabKey): void { this.activeTab.set(t); }

  protected readonly timeline: TimelineItem[] = [
    {
      kind: 'description',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'opened 6 hours ago',
      body: 'The agent scheduler had a race where two concurrent runs could grab the same slot id under heavy load. This PR locks the slot allocator behind a mutex and adds a regression test that hammers it with 1k concurrent requests.',
    },
    {
      kind: 'comment',
      author: { name: 'Mofiro Jean', initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ago: '4 hours ago',
      body: 'Nice catch on the regression test, the 1k-iteration shape is exactly what would have surfaced this earlier. One small thought, can we factor out the lock-acquire timeout into the config so we can dial it per env?',
    },
    {
      kind: 'event',
      icon: 'lucideGitCommit',
      label: 'Sasha Lin pushed 3 commits',
      ago: '2 hours ago',
    },
    {
      kind: 'comment',
      author: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      ago: '1 hour ago',
      body: 'Lock acquire timeout is now `runtime.scheduler.lockTimeoutMs`. Defaults to 250ms in dev, 1000ms in prod. Looks good to me.',
    },
    {
      kind: 'review',
      author: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      ago: '58 minutes ago',
      verdict: 'approved',
      body: 'Approved with 2 minor suggestions on the test file.',
    },
  ];
}
