import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';

interface NavChild {
  readonly label: string;
  readonly route: string;
  readonly badge?: string;
}

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly exact?: boolean;
  readonly badge?: string;
  readonly children?: readonly NavChild[];
}

interface ResourceItem {
  readonly label: string;
  readonly icon: string;
  readonly href: string;
}

interface PinnedItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly hint?: string;
}

interface Workspace {
  readonly name: string;
  readonly tier: string;
  readonly initials: string;
}

interface AppUser {
  readonly name: string;
  readonly initials: string;
  readonly plan: 'Free' | 'Pro' | 'Enterprise';
  readonly trialDaysLeft: number;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmIcon,
    HlmInputImports,
    HlmInputGroupImports,
    HlmSeparatorImports,
    HlmSidebarImports,
    HlmToasterImports,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = signal<'light' | 'dark'>('light');
  protected readonly themeIcon = computed(() => (this.mode() === 'light' ? 'lucideMoon' : 'lucideSun'));

  protected readonly workspace: Workspace = {
    name: 'Acme Corp',
    tier: 'Production · US-East',
    initials: 'AC',
  };

  protected readonly user: AppUser = {
    name: 'Mofiro Jean',
    initials: 'MJ',
    plan: 'Pro',
    trialDaysLeft: 12,
  };

  protected readonly pinned: readonly PinnedItem[] = [
    { label: 'Daily ops report', icon: 'lucideZap', route: '/', hint: '2 alerts' },
    { label: 'Cost drift', icon: 'lucideCircleDollarSign', route: '/', hint: '-8%' },
  ];

  protected readonly navItems: readonly NavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'lucideHouse', route: '/', exact: true },
    {
      id: 'agents',
      label: 'Agents',
      icon: 'lucideBot',
      route: '/agents',
      badge: '18',
      children: [
        { label: 'Active', route: '/agents', badge: '14' },
        { label: 'Drafts', route: '/agents', badge: '3' },
        { label: 'Archived', route: '/agents' },
        { label: 'Templates', route: '/marketplace' },
      ],
    },
    { id: 'runs', label: 'Runs', icon: 'lucidePlay', route: '/runs', badge: '12' },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: 'lucideCalendar',
      route: '/schedules',
      children: [
        { label: 'Upcoming', route: '/schedules', badge: '8' },
        { label: 'History', route: '/schedules' },
        { label: 'Calendar view', route: '/schedules' },
      ],
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: 'lucideStore',
      route: '/marketplace',
      children: [
        { label: 'Featured', route: '/marketplace' },
        { label: 'Categories', route: '/marketplace' },
        { label: 'Installed', route: '/marketplace', badge: '7' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'lucideSettings',
      route: '/settings',
      children: [
        { label: 'Profile', route: '/settings' },
        { label: 'Team', route: '/settings', badge: '6' },
        { label: 'Billing', route: '/settings' },
        { label: 'Notifications', route: '/settings' },
        { label: 'Integrations', route: '/settings', badge: '4' },
        { label: 'API keys', route: '/settings' },
      ],
    },
  ];

  protected readonly resourceItems: readonly ResourceItem[] = [
    { label: 'Documentation', icon: 'lucideBookOpen', href: 'https://spartan.ng' },
    { label: 'Support', icon: 'lucideLifeBuoy', href: 'mailto:support@example.com' },
    { label: 'Feedback', icon: 'lucideMessageSquare', href: 'https://github.com/mofirojean/angular-ui-skills/issues' },
  ];

  private readonly expandedIds = signal<ReadonlySet<string>>(new Set(['agents']));

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleExpanded(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleTheme(): void {
    const next = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(next);
    this.document.documentElement.classList.toggle('dark', next === 'dark');
  }
}
