import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Popover } from 'primeng/popover';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';

import { CommandPalette } from './shared/command-palette/command-palette';

interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly exact?: boolean;
  readonly badge?: string;
}

interface PinnedTicker {
  readonly symbol: string;
  readonly name: string;
  readonly price: string;
  readonly change: number;
  readonly spark: string;
  readonly route: string;
}

interface MarketIndex {
  readonly label: string;
  readonly value: string;
  readonly change: number;
}

interface ResourceItem {
  readonly label: string;
  readonly icon: string;
  readonly href: string;
  readonly badge?: string;
}

interface Notification {
  readonly id: string;
  readonly icon: string;
  readonly tone: 'success' | 'warn' | 'info' | 'danger';
  readonly title: string;
  readonly detail: string;
  readonly time: string;
  readonly unread: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Avatar,
    Button,
    ConfirmDialog,
    Drawer,
    Menu,
    OverlayBadge,
    Popover,
    Toast,
    Tooltip,
    CommandPalette,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = signal<'light' | 'dark'>('dark');
  protected readonly modeIcon = computed(() => (this.mode() === 'light' ? 'pi pi-moon' : 'pi pi-sun'));
  protected readonly mobileNavOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly sidebarToggleIcon = computed(() =>
    this.sidebarCollapsed() ? 'pi pi-angles-right' : 'pi pi-angles-left',
  );

  protected readonly palette = viewChild(CommandPalette);

  protected openPalette(): void {
    this.palette()?.show();
  }

  protected readonly notifications = signal<Notification[]>([
    {
      id: 'n1',
      icon: 'pi pi-check-circle',
      tone: 'success',
      title: 'Order filled',
      detail: 'BUY 100 NVDA @ $872.45 filled in full.',
      time: '2m ago',
      unread: true,
    },
    {
      id: 'n2',
      icon: 'pi pi-exclamation-triangle',
      tone: 'warn',
      title: 'Margin at 72%',
      detail: 'Approaching maintenance threshold on Acme Capital.',
      time: '14m ago',
      unread: true,
    },
    {
      id: 'n3',
      icon: 'pi pi-bolt',
      tone: 'info',
      title: 'Price alert: TSLA',
      detail: 'TSLA crossed below $250.00 (last $248.91).',
      time: '38m ago',
      unread: true,
    },
    {
      id: 'n4',
      icon: 'pi pi-times-circle',
      tone: 'danger',
      title: 'Order rejected',
      detail: 'LIMIT 50 AMD: insufficient buying power.',
      time: '1h ago',
      unread: false,
    },
    {
      id: 'n5',
      icon: 'pi pi-sparkles',
      tone: 'info',
      title: 'Weekly research digest',
      detail: '4 new analyst notes on your watchlist.',
      time: '5h ago',
      unread: false,
    },
  ]);

  protected readonly unreadCount = computed(
    () => this.notifications().filter((n) => n.unread).length,
  );

  protected readonly hasUnread = computed(() => this.unreadCount() > 0);

  protected markAllRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, unread: false })));
  }

  protected toneClasses(tone: Notification['tone']): string {
    switch (tone) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10';
      case 'warn': return 'text-amber-500 bg-amber-500/10';
      case 'danger': return 'text-rose-500 bg-rose-500/10';
      case 'info': return 'text-primary bg-primary/10';
    }
  }

  constructor() {
    this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });
  }

  protected readonly workspace = {
    name: 'Acme Capital',
    tier: 'Pro · US-East',
    initials: 'AC',
    aum: '$48.2M',
    positions: 24,
  };

  protected readonly marketStatus = signal<'open' | 'after-hours' | 'closed'>('open');
  protected readonly marketLabel = computed(() => {
    switch (this.marketStatus()) {
      case 'open': return 'Markets open';
      case 'after-hours': return 'After hours';
      case 'closed': return 'Markets closed';
    }
  });

  protected readonly user = {
    name: 'Mofiro Jean',
    initials: 'MJ',
    plan: 'Pro',
    trialDaysLeft: 12,
  };

  protected readonly pinned: readonly PinnedTicker[] = [
    {
      symbol: 'AAPL',
      name: 'Apple',
      price: '184.32',
      change: 1.24,
      spark: '0,9 7,7 14,8 21,5 28,6 35,3 42,2',
      route: '/holdings/AAPL',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla',
      price: '248.91',
      change: -3.12,
      spark: '0,3 7,4 14,6 21,5 28,8 35,7 42,10',
      route: '/holdings/TSLA',
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA',
      price: '872.45',
      change: 4.62,
      spark: '0,11 7,8 14,9 21,5 28,4 35,2 42,1',
      route: '/holdings/NVDA',
    },
  ];

  protected readonly markets: readonly MarketIndex[] = [
    { label: 'S&P 500', value: '5,232', change: 0.34 },
    { label: 'NASDAQ', value: '16,832', change: 0.51 },
    { label: 'BTC/USD', value: '67,432', change: 2.18 },
    { label: 'Oil WTI', value: '82.41', change: -0.42 },
  ];

  protected readonly resources: readonly ResourceItem[] = [
    { label: 'Docs', icon: 'pi pi-book', href: '#docs' },
    { label: "What's new", icon: 'pi pi-sparkles', href: '#changelog', badge: 'New' },
    { label: 'API status', icon: 'pi pi-bolt', href: '#status' },
    { label: 'Help & support', icon: 'pi pi-question-circle', href: '#help' },
  ];

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/', exact: true },
    { label: 'Holdings', icon: 'pi pi-briefcase', route: '/holdings', badge: '24' },
    { label: 'Watchlist', icon: 'pi pi-eye', route: '/watchlist', badge: '12' },
    { label: 'Trade', icon: 'pi pi-arrows-h', route: '/trade' },
    { label: 'Trades', icon: 'pi pi-history', route: '/trades' },
    { label: 'Research', icon: 'pi pi-book', route: '/research' },
    { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
  ];

  protected readonly userMenuModel: MenuItem[] = [
    {
      label: this.user.name,
      items: [
        { label: 'Profile', icon: 'pi pi-user', routerLink: '/settings' },
        { label: 'Trading prefs', icon: 'pi pi-sliders-h', routerLink: '/settings' },
        { label: 'API keys', icon: 'pi pi-key', routerLink: '/settings' },
      ],
    },
    {
      label: 'Workspace',
      items: [
        { label: 'Switch workspace', icon: 'pi pi-replay' },
        { label: 'Invite teammate', icon: 'pi pi-user-plus' },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Help & docs', icon: 'pi pi-question-circle' },
        { separator: true },
        { label: 'Sign out', icon: 'pi pi-sign-out' },
      ],
    },
  ];

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  protected formatChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }
}
