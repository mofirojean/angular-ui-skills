import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Sidebar } from './shared/sidebar/sidebar';
import { CommandPalette } from './shared/command-palette/command-palette';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIcon, HlmButton, HlmIcon, Sidebar, CommandPalette],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  protected readonly mode = signal<'light' | 'dark'>(this.initialMode());
  protected readonly modeIcon = computed(() => (this.mode() === 'light' ? 'lucideMoon' : 'lucideSun'));
  protected readonly modeLabel = computed(() =>
    this.mode() === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
  );

  protected readonly mobileSidebarOpen = signal(false);

  protected readonly palette = viewChild(CommandPalette);

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });

    // Close the mobile sidebar after every successful navigation.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mobileSidebarOpen.set(false);
      }
    });
  }

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  protected openMobileSidebar(): void {
    this.mobileSidebarOpen.set(true);
  }

  protected closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  protected openPalette(): void {
    this.palette()?.show();
  }

  /** Seed the initial mode from the user's OS preference, defaulting to dark. */
  private initialMode(): 'light' | 'dark' {
    const win = this.document.defaultView;
    if (!win || typeof win.matchMedia !== 'function') return 'dark';
    return win.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
