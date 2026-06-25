import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import type { SettingsSection } from '../../core/model';

@Component({
  selector: 'app-settings',
  imports: [NgIcon, HlmButtonImports],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly active = signal<string>('profile');
  protected readonly dirty = signal<boolean>(false);

  protected readonly sections: SettingsSection[] = [
    { key: 'profile',       label: 'Profile',            icon: 'lucideCircleUserRound', sub: 'Name, bio, photo' },
    { key: 'notifications', label: 'Notifications',      icon: 'lucideBell',            sub: 'Email + in-app' },
    { key: 'keyboard',      label: 'Keyboard shortcuts', icon: 'lucideCommand',         sub: 'Customize bindings' },
    { key: 'display',       label: 'Display',            icon: 'lucideEye',             sub: 'Theme + density' },
    { key: 'integrations',  label: 'Integrations',       icon: 'lucideFolderGit2',      sub: 'Linked services' },
  ];

  protected select(key: string): void {
    this.active.set(key);
    this.dirty.set(false);
  }

  protected touch(): void {
    if (!this.dirty()) this.dirty.set(true);
  }

  protected discard(): void {
    this.dirty.set(false);
  }

  protected save(): void {
    this.dirty.set(false);
  }

  protected readonly notificationPrefs = [
    { key: 'review-requested', label: 'When a review is requested',         email: true,  inApp: true  },
    { key: 'pr-mentioned',     label: 'When you are mentioned in a PR',     email: true,  inApp: true  },
    { key: 'comment-reply',    label: 'When someone replies to your comment', email: false, inApp: true  },
    { key: 'pr-merged',        label: 'When a PR you authored is merged',   email: true,  inApp: true  },
    { key: 'ci-failure',       label: 'When CI fails on your branch',       email: false, inApp: true  },
    { key: 'weekly-digest',    label: 'Weekly activity digest',             email: true,  inApp: false },
  ];

  protected readonly shortcuts = [
    { action: 'Open command palette',  keys: ['⌘', 'K'] },
    { action: 'Jump to inbox',         keys: ['g', 'i'] },
    { action: 'Jump to drafts',        keys: ['g', 'd'] },
    { action: 'Toggle theme',          keys: ['t'] },
    { action: 'Approve PR (in detail)', keys: ['a'] },
    { action: 'Request changes',       keys: ['r'] },
    { action: 'Add comment',           keys: ['c'] },
    { action: 'Next PR in inbox',      keys: ['j'] },
    { action: 'Previous PR in inbox',  keys: ['k'] },
    { action: 'Help / cheat sheet',    keys: ['?'] },
  ];

  protected readonly integrations = [
    { name: 'GitHub',     status: 'connected' as const,    detail: 'Mirroring 4 repositories' },
    { name: 'Linear',     status: 'connected' as const,    detail: 'Issues linked to PRs by `FIN-` prefix' },
    { name: 'Slack',      status: 'connected' as const,    detail: '#forge-reviews channel notifications' },
    { name: 'Vercel',     status: 'connected' as const,    detail: 'Preview deployments on every PR' },
    { name: 'Sentry',     status: 'disconnected' as const, detail: 'Error tracking, click to set up' },
    { name: 'PagerDuty',  status: 'disconnected' as const, detail: 'On-call escalation, click to set up' },
  ];
}
