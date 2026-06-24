import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

@Component({
  selector: 'app-author',
  imports: [NgIcon, HlmButtonImports, HlmAvatarImports],
  templateUrl: './author.html',
  styleUrl: './author.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Author {
  readonly handle = input<string>('');

  protected readonly displayName = computed(() => {
    const h = this.handle();
    if (!h) return 'Sasha Lin';
    return h.charAt(0).toUpperCase() + h.slice(1).replace(/-/g, ' ');
  });

  protected readonly stats = [
    { label: 'Open PRs',      value: 4,  trend: '+1 this week',  icon: 'lucideGitPullRequestArrow' },
    { label: 'Reviewed',      value: 87, trend: '+12 this month', icon: 'lucideEye' },
    { label: 'Merged',        value: 246, trend: 'all time',       icon: 'lucideGitMerge' },
    { label: 'Comments',      value: 1842, trend: 'across 312 PRs', icon: 'lucideMessageSquare' },
  ];

  protected readonly activity = [
    { kind: 'review',   pr: '#142', title: 'Fix race condition in agent run scheduler', ago: '12m ago' },
    { kind: 'commit',   pr: '#138', title: 'Bump @angular/cdk to 21.2.14',              ago: '1h ago' },
    { kind: 'open',     pr: '#143', title: 'Refactor command palette to use signals',   ago: '3h ago' },
    { kind: 'comment',  pr: '#139', title: 'Add streaming endpoint for live execution logs', ago: '5h ago' },
    { kind: 'merge',    pr: '#136', title: 'Implement bulk-approve action with undo',   ago: '1d ago' },
  ];

  protected kindIcon(kind: string): string {
    if (kind === 'review')  return 'lucideEye';
    if (kind === 'commit')  return 'lucideGitCommit';
    if (kind === 'open')    return 'lucideGitPullRequestArrow';
    if (kind === 'comment') return 'lucideMessageSquare';
    return 'lucideGitMerge';
  }

  protected kindLabel(kind: string): string {
    if (kind === 'review')  return 'Reviewed';
    if (kind === 'commit')  return 'Pushed to';
    if (kind === 'open')    return 'Opened';
    if (kind === 'comment') return 'Commented on';
    return 'Merged';
  }
}
