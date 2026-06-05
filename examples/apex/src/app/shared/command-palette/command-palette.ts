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
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmKbd } from '@spartan-ng/helm/kbd';

import { CONVERSATIONS } from '../../data/conversations';
import { PROJECTS } from '../../data/projects';

interface CommandItem {
  readonly id: string;
  readonly group: 'Navigation' | 'Actions' | 'Recent chats' | 'Projects';
  readonly label: string;
  readonly icon: string;
  readonly keywords?: string;
  readonly shortcut?: string;
  readonly run: () => void;
}

interface CommandGroup {
  readonly label: string;
  readonly items: readonly CommandItem[];
}

@Component({
  selector: 'app-command-palette',
  imports: [NgIcon, HlmIcon, HlmKbd],
  templateUrl: './command-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private readonly commands: readonly CommandItem[] = [
    {
      id: 'nav-new-chat',
      group: 'Navigation',
      label: 'New chat',
      icon: 'lucidePlus',
      keywords: 'compose start fresh',
      shortcut: 'N',
      run: () => this.go('/'),
    },
    {
      id: 'nav-projects',
      group: 'Navigation',
      label: 'Projects',
      icon: 'lucideFolder',
      keywords: 'workspace bundles',
      shortcut: 'G P',
      run: () => this.go('/projects'),
    },
    {
      id: 'nav-settings',
      group: 'Navigation',
      label: 'Settings',
      icon: 'lucideSettings',
      keywords: 'preferences account profile keys',
      shortcut: 'G S',
      run: () => this.go('/settings'),
    },
    {
      id: 'act-theme',
      group: 'Actions',
      label: 'Switch theme',
      icon: 'lucideMoon',
      keywords: 'dark light appearance mode',
      shortcut: 'T',
      run: () => this.toggleTheme(),
    },
    {
      id: 'act-copy-url',
      group: 'Actions',
      label: 'Copy current URL',
      icon: 'lucideCopy',
      keywords: 'share link clipboard',
      run: () => this.copyUrl(),
    },
    {
      id: 'act-shortcuts',
      group: 'Actions',
      label: 'Keyboard shortcuts',
      icon: 'lucideZap',
      keywords: 'hotkeys help',
      shortcut: '?',
      run: () => this.go('/settings'),
    },
    ...CONVERSATIONS.slice(0, 6).map((c) => ({
      id: `chat-${c.id}`,
      group: 'Recent chats' as const,
      label: c.title,
      icon: 'lucideMessageCircle',
      keywords: c.messages[0]?.content?.slice(0, 80) ?? '',
      run: () => this.go(['/c', c.id]),
    })),
    ...PROJECTS.map((p) => ({
      id: `proj-${p.id}`,
      group: 'Projects' as const,
      label: p.name,
      icon: 'lucideFolderOpen',
      keywords: p.description,
      run: () => this.go(['/projects', p.id]),
    })),
  ];

  protected readonly filtered = computed<readonly CommandGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    const matched = q
      ? this.commands.filter((c) => {
          const blob = `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase();
          return blob.includes(q);
        })
      : this.commands;
    const order: CommandItem['group'][] = ['Navigation', 'Actions', 'Recent chats', 'Projects'];
    return order
      .map((label) => ({ label, items: matched.filter((c) => c.group === label) }))
      .filter((g) => g.items.length > 0);
  });

  protected readonly flat = computed<readonly CommandItem[]>(() =>
    this.filtered().flatMap((g) => g.items),
  );

  constructor() {
    this.document.addEventListener('keydown', (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      if (isMod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.toggle();
      } else if (event.key === 'Escape' && this.open()) {
        this.close();
      }
    });

    effect(() => {
      this.flat();
      this.activeIndex.set(0);
    });

    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      }
    });
  }

  protected toggle(): void {
    this.open() ? this.close() : this.show();
  }

  show(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.flat();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(items.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[this.activeIndex()];
      if (item) this.runItem(item);
    }
  }

  protected runItem(item: CommandItem): void {
    this.close();
    queueMicrotask(() => item.run());
  }

  protected indexOf(item: CommandItem): number {
    return this.flat().findIndex((c) => c.id === item.id);
  }

  private go(commands: string | readonly string[]): void {
    void this.router.navigateByUrl(Array.isArray(commands) ? commands.join('/') : (commands as string));
  }

  private toggleTheme(): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark');
  }

  private copyUrl(): void {
    void navigator.clipboard?.writeText(this.document.location.href);
  }
}
