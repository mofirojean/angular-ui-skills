import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DataService } from '../../data/data.service';

interface CommandHit {
  readonly group: 'Navigate' | 'Tickets' | 'Actions';
  readonly icon: string;
  readonly title: string;
  readonly hint?: string;
  readonly run: () => void;
}

@Component({
  selector: 'app-command-palette',
  imports: [FormsModule, NzInputModule, NzIconModule, NzTagModule],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
  readonly close = output<void>();

  private readonly router = inject(Router);
  private readonly data = inject(DataService);

  protected readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private readonly navItems: CommandHit[] = [
    { group: 'Navigate', icon: 'dashboard', title: 'Go to Dashboard', hint: '/',         run: () => this.go('/') },
    { group: 'Navigate', icon: 'inbox',     title: 'Go to Tickets',   hint: '/tickets',  run: () => this.go('/tickets') },
    { group: 'Navigate', icon: 'appstore',  title: 'Go to Queues',    hint: '/queues',   run: () => this.go('/queues') },
    { group: 'Navigate', icon: 'book',      title: 'Go to Knowledge', hint: '/kb',       run: () => this.go('/kb') },
    { group: 'Navigate', icon: 'team',      title: 'Go to Agents',    hint: '/agents',   run: () => this.go('/agents') },
    { group: 'Navigate', icon: 'setting',   title: 'Go to Settings',  hint: '/settings', run: () => this.go('/settings') },
  ];

  private readonly actionItems: CommandHit[] = [
    {
      group: 'Actions',
      icon: 'plus',
      title: 'Create new ticket',
      hint: 'Opens the new-ticket wizard',
      run: () => this.go('/tickets', { queryParams: { new: 1 } }),
    },
    {
      group: 'Actions',
      icon: 'check',
      title: 'Mark all notifications as read',
      run: () => {
        this.data.markAllNotificationsRead();
        this.close.emit();
      },
    },
  ];

  protected readonly results = computed<CommandHit[]>(() => {
    const q = this.query().toLowerCase().trim();
    const ticketHits: CommandHit[] = this.data
      .tickets()
      .filter((t) => {
        if (q.length < 2) return false;
        return (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q)
        );
      })
      .slice(0, 6)
      .map((t) => ({
        group: 'Tickets' as const,
        icon: 'inbox',
        title: `${t.id} · ${t.subject}`,
        hint: t.customer,
        run: () => this.go(['/tickets', t.id]),
      }));

    const navHits = q.length === 0
      ? this.navItems
      : this.navItems.filter((i) => i.title.toLowerCase().includes(q));

    const actionHits = q.length === 0
      ? this.actionItems
      : this.actionItems.filter((i) => i.title.toLowerCase().includes(q));

    return [...navHits, ...ticketHits, ...actionHits];
  });

  protected readonly grouped = computed(() => {
    const out = new Map<CommandHit['group'], CommandHit[]>();
    for (const hit of this.results()) {
      const list = out.get(hit.group) ?? [];
      list.push(hit);
      out.set(hit.group, list);
    }
    return Array.from(out.entries());
  });

  constructor() {
    // Reset highlight when results shrink.
    effect(() => {
      if (this.activeIndex() >= this.results().length) {
        this.activeIndex.set(0);
      }
    });

    setTimeout(() => this.input()?.nativeElement.focus(), 0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.results();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(list.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      list[this.activeIndex()]?.run();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close.emit();
    }
  }

  protected run(hit: CommandHit, index: number): void {
    this.activeIndex.set(index);
    hit.run();
  }

  private go(path: string | unknown[], extras?: Record<string, unknown>): void {
    void this.router.navigate(Array.isArray(path) ? path : [path], extras as never);
    this.close.emit();
  }

  protected indexOf(hit: CommandHit): number {
    return this.results().indexOf(hit);
  }
}
