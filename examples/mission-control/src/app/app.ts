import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';

interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmAvatarImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmIcon,
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

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Overview', icon: 'lucideHouse', route: '/', exact: true },
    { label: 'Agents', icon: 'lucideBot', route: '/agents' },
    { label: 'Runs', icon: 'lucidePlay', route: '/runs' },
    { label: 'Schedules', icon: 'lucideCalendar', route: '/schedules' },
    { label: 'Marketplace', icon: 'lucideStore', route: '/marketplace' },
    { label: 'Settings', icon: 'lucideSettings', route: '/settings' },
  ];

  protected toggleTheme(): void {
    const next = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(next);
    this.document.documentElement.classList.toggle('dark', next === 'dark');
  }
}
