import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'echo-sidebar',
  imports: [RouterLink, RouterLinkActive, Button],
  host: {
    class:
      'hidden h-full w-60 shrink-0 flex-col border-r border-[var(--p-surface-800)] bg-[var(--p-surface-950)] md:flex',
  },
  template: `
    <div class="flex items-center gap-2 px-5 pt-5 pb-4">
      <span
        class="grid h-8 w-8 place-items-center rounded-md bg-[var(--p-primary-500)] text-[var(--p-primary-contrast-color)]"
      >
        <i class="pi pi-wave-pulse text-sm"></i>
      </span>
      <span class="text-lg font-semibold tracking-tight text-[var(--p-surface-0)]">Echo</span>
    </div>

    <nav class="flex flex-col gap-0.5 px-3">
      @for (item of primary; track item.path) {
        <a
          [routerLink]="item.path"
          [routerLinkActive]="'nav-active'"
          [routerLinkActiveOptions]="{ exact: !!item.exact }"
          class="nav-item"
        >
          <i class="pi {{ item.icon }} nav-icon"></i>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>

    <div class="mx-5 my-3 h-px bg-[var(--p-surface-800)]"></div>

    <nav class="flex flex-col gap-0.5 px-3">
      @for (item of listening; track item.path) {
        <a
          [routerLink]="item.path"
          [routerLinkActive]="'nav-active'"
          class="nav-item"
        >
          <i class="pi {{ item.icon }} nav-icon"></i>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>

    <div class="mx-5 my-3 h-px bg-[var(--p-surface-800)]"></div>

    <div class="flex items-center justify-between px-5 pb-2">
      <span class="text-xs font-medium uppercase tracking-[0.2em] text-[var(--p-surface-500)]">
        Playlists
      </span>
      <p-button
        icon="pi pi-plus"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Create playlist"
      />
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-4">
      <p class="mt-2 text-xs leading-relaxed text-[var(--p-surface-500)]">
        No playlists yet. Import some tracks and build your first one.
      </p>
    </div>

    <div class="border-t border-[var(--p-surface-800)] px-3 py-3">
      <a routerLink="/settings" routerLinkActive="nav-active" class="nav-item">
        <i class="pi pi-cog nav-icon"></i>
        <span>Settings</span>
      </a>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1;
        color: var(--p-surface-300);
        text-decoration: none;
        transition: background-color 120ms ease, color 120ms ease;
      }
      :host ::ng-deep .nav-item:hover {
        background: var(--p-surface-800);
        color: var(--p-surface-0);
      }
      :host ::ng-deep .nav-item.nav-active {
        background: color-mix(in oklab, var(--p-primary-500) 12%, transparent);
        color: var(--p-primary-300);
      }
      :host ::ng-deep .nav-icon {
        font-size: 0.95rem;
        width: 1.1rem;
        display: inline-flex;
        justify-content: center;
      }
    `,
  ],
})
export class Sidebar {
  readonly primary: NavItem[] = [
    { label: 'Home', icon: 'pi-home', path: '/', exact: true },
    { label: 'Search', icon: 'pi-search', path: '/search' },
    { label: 'Library', icon: 'pi-book', path: '/library' },
    { label: 'Browse', icon: 'pi-th-large', path: '/browse' },
    { label: 'Import', icon: 'pi-upload', path: '/import' },
  ];

  readonly listening: NavItem[] = [
    { label: 'Queue', icon: 'pi-list', path: '/queue' },
    { label: 'Now Playing', icon: 'pi-play-circle', path: '/now-playing' },
  ];
}
