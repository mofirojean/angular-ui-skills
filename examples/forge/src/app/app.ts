import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmToaster } from '@spartan-ng/helm/sonner';

import { ThemeService } from './core/theme.service';
import { MockDataService } from './core/mock-data.service';
import { CommandPaletteService } from './core/command-palette.service';
import { NAV } from './core/nav';
import { CommandPalette } from './shell/command-palette';
import type { PinnedRepo } from './core/model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmButtonImports,
    HlmSidebarImports,
    HlmDropdownMenuImports,
    HlmAvatarImports,
    HlmToaster,
    CommandPalette,
    HlmSidebarImports,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onGlobalKey($event)',
  },
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly data = inject(MockDataService);
  protected readonly palette = inject(CommandPaletteService);
  private readonly router = inject(Router);

  protected onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.palette.toggle();
    }
  }

  protected readonly nav = NAV;
  protected readonly reviewer = this.data.currentReviewer;

  protected readonly pinnedRepos: readonly PinnedRepo[] = [
    { name: 'forge/runtime', openPrs: 3, status: 'pass' },
    { name: 'forge/api',     openPrs: 7, status: 'build' },
    { name: 'forge/web',     openPrs: 2, status: 'pass' },
    { name: 'forge/docs',    openPrs: 1, status: 'fail' },
  ];

  protected readonly userInitials = computed(() =>
    this.reviewer().name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    for (const section of this.nav) {
      const match = section.items.find(
        (i) => i.path === url || (i.path !== '/' && url.startsWith(i.path)),
      );
      if (match) return match.label;
    }
    if (url.startsWith('/pr/')) return 'Pull request';
    if (url.startsWith('/author/')) return 'Author';
    return 'Forge';
  });
}
