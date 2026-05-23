import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmIcon } from '@spartan-ng/helm/icon';

interface PaletteAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly group: 'navigation' | 'actions' | 'preferences';
  readonly shortcut?: string;
  readonly run: () => void;
}

@Component({
  selector: 'app-command-palette',
  imports: [HlmCommandImports, HlmIcon, NgIcon],
  templateUrl: './command-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly open = signal(false);
  protected readonly state = computed(() => (this.open() ? ('open' as const) : ('closed' as const)));

  protected readonly navigation: readonly PaletteAction[] = [
    { id: 'go-overview', label: 'Go to Overview', icon: 'lucideHouse', group: 'navigation', run: () => this.go('/') },
    { id: 'go-agents', label: 'Go to Agents', icon: 'lucideBot', group: 'navigation', run: () => this.go('/agents') },
    { id: 'go-runs', label: 'Go to Runs', icon: 'lucidePlay', group: 'navigation', run: () => this.go('/runs') },
    { id: 'go-schedules', label: 'Go to Schedules', icon: 'lucideCalendar', group: 'navigation', run: () => this.go('/schedules') },
    { id: 'go-marketplace', label: 'Go to Marketplace', icon: 'lucideStore', group: 'navigation', run: () => this.go('/marketplace') },
    { id: 'go-settings', label: 'Go to Settings', icon: 'lucideSettings', group: 'navigation', shortcut: '⌘,', run: () => this.go('/settings') },
  ];

  protected readonly actions: readonly PaletteAction[] = [
    { id: 'new-agent', label: 'New agent…', icon: 'lucidePlus', group: 'actions', shortcut: '⌘N', run: () => this.fire('New agent') },
    { id: 'run-now', label: 'Run agent now', icon: 'lucideRocket', group: 'actions', run: () => this.fire('Triggered a run') },
    { id: 'invite', label: 'Invite teammate', icon: 'lucideUserPlus', group: 'actions', run: () => this.fire('Open invite dialog') },
    { id: 'copy-id', label: 'Copy workspace ID', icon: 'lucideCopy', group: 'actions', run: () => this.copy('ws_2026_acme_us_east_001') },
  ];

  protected readonly preferences: readonly PaletteAction[] = [
    { id: 'toggle-theme', label: 'Toggle dark mode', icon: 'lucideMoon', group: 'preferences', shortcut: '⌘D', run: () => this.toggleTheme() },
    { id: 'sign-out', label: 'Sign out', icon: 'lucideLogOut', group: 'preferences', run: () => this.fire('Signed out') },
  ];

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  protected onStateChange(next: 'open' | 'closed'): void {
    this.open.set(next === 'open');
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    const k = event.key.toLowerCase();
    if (k === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.open.update((v) => !v);
    }
  }

  protected run(action: PaletteAction): void {
    this.hide();
    queueMicrotask(() => action.run());
  }

  private go(url: string): void {
    void this.router.navigateByUrl(url);
  }

  private fire(label: string): void {
    toast.success(label, { description: 'Triggered from the command palette' });
  }

  private copy(value: string): void {
    void this.document.defaultView?.navigator.clipboard?.writeText(value);
    toast.info('Copied to clipboard', { description: value });
  }

  private toggleTheme(): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark');
    toast.info(`Switched to ${root.classList.contains('dark') ? 'dark' : 'light'} mode`);
  }
}
