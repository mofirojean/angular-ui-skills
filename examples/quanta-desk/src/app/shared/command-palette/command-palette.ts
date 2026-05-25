import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';

interface Command {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly icon: string;
  readonly group: 'Navigation' | 'Actions' | 'Theme' | 'Help';
  readonly shortcut?: string;
  readonly keywords?: string;
  readonly run: () => void;
}

interface CommandGroup {
  readonly label: string;
  readonly items: Command[];
}

@Component({
  selector: 'app-command-palette',
  imports: [CommonModule, Dialog],
  templateUrl: './command-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly document = inject(DOCUMENT);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly commands: Command[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: 'pi pi-home', group: 'Navigation', shortcut: 'G D', keywords: 'home overview', run: () => this.navigate('/') },
    { id: 'nav-holdings', label: 'Go to Holdings', icon: 'pi pi-briefcase', group: 'Navigation', shortcut: 'G H', keywords: 'positions portfolio', run: () => this.navigate('/holdings') },
    { id: 'nav-watchlist', label: 'Go to Watchlist', icon: 'pi pi-eye', group: 'Navigation', shortcut: 'G W', keywords: 'tracked', run: () => this.navigate('/watchlist') },
    { id: 'nav-trade', label: 'Go to Trade ticket', icon: 'pi pi-arrows-h', group: 'Navigation', shortcut: 'G T', keywords: 'order new', run: () => this.navigate('/trade') },
    { id: 'nav-trades', label: 'Go to Trade history', icon: 'pi pi-history', group: 'Navigation', shortcut: 'G L', keywords: 'orders ledger', run: () => this.navigate('/trades') },
    { id: 'nav-research', label: 'Go to Research', icon: 'pi pi-book', group: 'Navigation', shortcut: 'G R', keywords: 'notes', run: () => this.navigate('/research') },
    { id: 'nav-settings', label: 'Go to Settings', icon: 'pi pi-cog', group: 'Navigation', shortcut: 'G S', keywords: 'profile billing keys', run: () => this.navigate('/settings') },

    // Actions
    { id: 'act-new-trade', label: 'New trade', icon: 'pi pi-plus', group: 'Actions', shortcut: 'N T', keywords: 'place order buy sell', run: () => this.navigate('/trade') },
    { id: 'act-new-note', label: 'New research note', icon: 'pi pi-pencil', group: 'Actions', shortcut: 'N R', keywords: 'compose write', run: () => this.navigate('/research') },
    { id: 'act-watch', label: 'Add to watchlist', icon: 'pi pi-star', group: 'Actions', shortcut: 'A W', keywords: 'track', run: () => this.navigate('/watchlist') },
    { id: 'act-export', label: 'Export current page', icon: 'pi pi-download', group: 'Actions', keywords: 'csv pdf download', run: () => this.flash('Export started') },
    { id: 'act-refresh', label: 'Refresh data', icon: 'pi pi-refresh', group: 'Actions', shortcut: 'R', keywords: 'reload sync', run: () => this.flash('Data refreshed') },

    // Theme
    { id: 'theme-light', label: 'Switch to light mode', icon: 'pi pi-sun', group: 'Theme', keywords: 'theme bright', run: () => this.setTheme('light') },
    { id: 'theme-dark', label: 'Switch to dark mode', icon: 'pi pi-moon', group: 'Theme', keywords: 'theme noir', run: () => this.setTheme('dark') },

    // Help
    { id: 'help-shortcuts', label: 'Show keyboard shortcuts', icon: 'pi pi-key', group: 'Help', shortcut: '?', keywords: 'keys hotkeys', run: () => this.flash('See PLAN.md for the keymap') },
    { id: 'help-docs', label: 'Open documentation', icon: 'pi pi-book', group: 'Help', keywords: 'docs help', run: () => this.flash('Docs would open here') },
  ];

  protected readonly filteredGroups = computed<CommandGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    const list = !q
      ? this.commands
      : this.commands.filter((c) => {
          const blob = `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase();
          return blob.includes(q);
        });

    const groupOrder: Command['group'][] = ['Navigation', 'Actions', 'Theme', 'Help'];
    return groupOrder
      .map((g) => ({
        label: g,
        items: list.filter((c) => c.group === g),
      }))
      .filter((g) => g.items.length > 0);
  });

  protected readonly flatItems = computed<Command[]>(() =>
    this.filteredGroups().flatMap((g) => g.items),
  );

  constructor() {
    // Global keydown handler for Cmd/Ctrl+K and Esc
    this.document.addEventListener('keydown', (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.toggle();
      } else if (event.key === 'Escape' && this.open()) {
        this.close();
      }
    });

    // Reset active index whenever filter results change
    effect(() => {
      this.flatItems();
      this.activeIndex.set(0);
    });

    // Autofocus input when opened
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      }
    });
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.show();
    }
  }

  show(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.flatItems();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(list.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.runActive();
    }
  }

  protected runActive(): void {
    const list = this.flatItems();
    const cmd = list[this.activeIndex()];
    if (cmd) this.runCommand(cmd);
  }

  protected runCommand(cmd: Command): void {
    this.close();
    queueMicrotask(() => cmd.run());
  }

  protected indexOf(cmd: Command): number {
    return this.flatItems().findIndex((c) => c.id === cmd.id);
  }

  protected groupItemsCount(group: CommandGroup): number {
    return group.items.length;
  }

  private navigate(path: string): void {
    void this.router.navigateByUrl(path);
  }

  private setTheme(mode: 'light' | 'dark'): void {
    this.document.documentElement.classList.toggle('dark', mode === 'dark');
    this.toast.add({ severity: 'info', summary: `Switched to ${mode} mode`, life: 1200 });
  }

  private flash(label: string): void {
    this.toast.add({ severity: 'info', summary: label, life: 1500 });
  }
}
