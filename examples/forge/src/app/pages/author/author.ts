import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

type StatTrend = 'up' | 'down' | 'flat';
type AuthorTab = 'activity' | 'open' | 'reviews' | 'merged';

interface Stat {
  label: string;
  value: number;
  delta: string;
  trend: StatTrend;
  icon: string;
  period: string;
}

interface ActivityRow {
  kind: 'review' | 'commit' | 'open' | 'comment' | 'merge';
  pr: string;
  repo: string;
  title: string;
  ago: string;
}

@Component({
  selector: 'app-author',
  imports: [NgClass, NgIcon, HlmButtonImports, HlmAvatarImports],
  templateUrl: './author.html',
  styleUrl: './author.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Author {
  readonly handle = input<string>('');

  protected readonly activeTab = signal<AuthorTab>('activity');
  protected setTab(tab: AuthorTab): void { this.activeTab.set(tab); }

  protected readonly displayName = computed(() => {
    const h = this.handle();
    if (!h) return 'Sasha Lin';
    return h.charAt(0).toUpperCase() + h.slice(1).replace(/-/g, ' ');
  });

  protected readonly tabs: { key: AuthorTab; label: string; count: number }[] = [
    { key: 'activity', label: 'Recent activity', count: 24 },
    { key: 'open',     label: 'Open PRs',        count:  4 },
    { key: 'reviews',  label: 'Reviews given',   count: 87 },
    { key: 'merged',   label: 'Merged',          count: 246 },
  ];

  protected readonly stats: readonly Stat[] = [
    { label: 'Open PRs',  value: 4,    delta: '+1',  trend: 'up',   icon: 'lucideGitPullRequestArrow', period: 'vs last week' },
    { label: 'Reviewed',  value: 87,   delta: '+12', trend: 'up',   icon: 'lucideEye',                 period: 'this month' },
    { label: 'Merged',    value: 246,  delta: '',    trend: 'flat', icon: 'lucideGitMerge',            period: 'all time' },
    { label: 'Comments',  value: 1842, delta: '+34', trend: 'up',   icon: 'lucideMessageSquare',       period: 'across 312 PRs' },
  ];

  protected readonly activity: readonly ActivityRow[] = [
    { kind: 'review',  pr: '#142', repo: 'forge/runtime', title: 'Fix race condition in agent run scheduler',     ago: '12m ago' },
    { kind: 'commit',  pr: '#138', repo: 'forge/web',     title: 'Bump @angular/cdk to 21.2.14',                  ago: '1h ago' },
    { kind: 'open',    pr: '#143', repo: 'forge/web',     title: 'Refactor command palette to use signals',       ago: '3h ago' },
    { kind: 'comment', pr: '#139', repo: 'forge/runtime', title: 'Add streaming endpoint for live execution logs', ago: '5h ago' },
    { kind: 'merge',   pr: '#136', repo: 'forge/runtime', title: 'Implement bulk-approve action with undo',       ago: '1d ago' },
  ];

  protected kindIcon(kind: ActivityRow['kind']): string {
    if (kind === 'review')  return 'lucideEye';
    if (kind === 'commit')  return 'lucideGitCommit';
    if (kind === 'open')    return 'lucideGitPullRequestArrow';
    if (kind === 'comment') return 'lucideMessageSquare';
    return 'lucideGitMerge';
  }

  protected kindLabel(kind: ActivityRow['kind']): string {
    if (kind === 'review')  return 'Reviewed';
    if (kind === 'commit')  return 'Pushed to';
    if (kind === 'open')    return 'Opened';
    if (kind === 'comment') return 'Commented on';
    return 'Merged';
  }

  protected kindTone(kind: ActivityRow['kind']): string {
    if (kind === 'review')  return 'bg-sky-500/15 text-sky-700 dark:text-sky-300';
    if (kind === 'commit')  return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
    if (kind === 'open')    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    if (kind === 'comment') return 'bg-violet-500/15 text-violet-700 dark:text-violet-300';
    return 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300';
  }

  protected trendIcon(t: StatTrend): string {
    if (t === 'up')   return 'lucideArrowUp';
    if (t === 'down') return 'lucideArrowDown';
    return 'lucideMinus';
  }

  protected trendTone(t: StatTrend): string {
    if (t === 'up')   return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30';
    if (t === 'down') return 'bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/30';
    return 'bg-muted text-muted-foreground ring-border';
  }
}
