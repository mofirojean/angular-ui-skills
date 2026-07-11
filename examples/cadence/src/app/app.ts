import { Component, computed, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { ThemeService } from './shared/theme.service';

const COLLAPSED_KEY = 'cadence.sidenav.collapsed';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconButton,
    MatDivider,
    MatIcon,
    MatNavList,
    MatListItem,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatToolbar,
    MatTooltip,
  ],
  template: `
    <mat-sidenav-container class="shell" autosize>
      <mat-sidenav
        #side
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="!isHandset()"
        class="sidenav"
        [class.collapsed]="isRail()"
      >
        <div class="brand">
          <mat-icon aria-hidden="true">event_repeat</mat-icon>
          @if (!isRail()) {
            <span>Cadence</span>
          }
        </div>
        <mat-nav-list>
          @for (item of nav; track item.path) {
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive="nav-active"
              [matTooltip]="isRail() ? item.label : ''"
              matTooltipPosition="right"
              (click)="isHandset() && side.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        @if (!isRail()) {
          <span class="section-label nav-label">Planning</span>
        }
        <mat-nav-list>
          @for (item of planned; track item.label) {
            <button
              mat-list-item
              [matTooltip]="isRail() ? item.label : ''"
              matTooltipPosition="right"
              (click)="onComingSoon(item.label)"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </button>
          }
        </mat-nav-list>
        <div class="sidenav-spacer"></div>
        @if (!isRail()) {
          <mat-divider class="side-divider" />
          <div class="side-section">
            <span class="section-label">Calendars</span>
            @for (cal of calendars; track cal.name) {
              <div class="cal-row">
                <span class="cal-dot" [style.background]="cal.color"></span>
                <span class="cal-name">{{ cal.name }}</span>
              </div>
            }
          </div>
          <div class="side-section">
            <div class="week-card">
              <span class="week-title">This week</span>
              <span class="week-stat">12 bookings</span>
              <span class="week-sub">3 rooms above 80% load</span>
            </div>
          </div>
        }
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/settings"
            routerLinkActive="nav-active"
            [matTooltip]="isRail() ? 'Settings' : ''"
            matTooltipPosition="right"
            (click)="isHandset() && side.close()"
          >
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
        <button
          type="button"
          class="profile"
          [class.rail]="isRail()"
          [matMenuTriggerFor]="profileMenu"
          [matTooltip]="isRail() ? 'Account' : ''"
          matTooltipPosition="right"
          aria-label="Open account menu"
        >
          <span class="avatar" aria-hidden="true">MJ</span>
          @if (!isRail()) {
            <div class="profile-meta">
              <span class="profile-name">Mofiro Jean</span>
              <span class="profile-role">Workspace admin</span>
            </div>
            <mat-icon class="profile-chevron">unfold_more</mat-icon>
          }
        </button>
        <mat-menu #profileMenu="matMenu" yPosition="above">
          <button mat-menu-item (click)="onComingSoon('Profile')">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Account settings</span>
          </button>
          <button mat-menu-item (click)="onComingSoon('Switch workspace')">
            <mat-icon>swap_horiz</mat-icon>
            <span>Switch workspace</span>
          </button>
          <mat-divider />
          <button mat-menu-item (click)="onComingSoon('Sign out')">
            <mat-icon>logout</mat-icon>
            <span>Sign out</span>
          </button>
        </mat-menu>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar class="header">
          <button
            mat-icon-button
            (click)="onToggleSidenav(side)"
            [attr.aria-label]="isHandset() ? 'Toggle navigation' : (collapsed() ? 'Expand navigation' : 'Collapse navigation')"
          >
            <mat-icon>{{ isHandset() || collapsed() ? 'menu' : 'menu_open' }}</mat-icon>
          </button>
          @if (!isHandset()) {
            <div class="search">
              <mat-icon aria-hidden="true">search</mat-icon>
              <input
                type="text"
                placeholder="Search bookings, rooms, people"
                aria-label="Search (coming soon)"
              />
            </div>
          }
          <span class="spacer"></span>
          <button
            mat-icon-button
            (click)="theme.toggle()"
            [attr.aria-label]="theme.dark() ? 'Switch to light theme' : 'Switch to dark theme'"
          >
            <mat-icon>{{ theme.dark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
          <button mat-flat-button (click)="onNewBooking()">
            <mat-icon>add</mat-icon>
            New booking
          </button>
        </mat-toolbar>
        <main class="outlet">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .shell {
      height: 100dvh;
    }
    .sidenav {
      width: 240px;
      border-right: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0;
      background: var(--mat-sys-surface);
      transition: width 200ms ease;
    }
    .sidenav ::ng-deep .mat-drawer-inner-container {
      display: flex;
      flex-direction: column;
    }
    .sidenav.collapsed {
      width: 68px;
    }
    .sidenav.collapsed .brand {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }
    .sidenav.collapsed .mdc-list-item__content {
      display: none;
    }
    .sidenav.collapsed mat-icon[matListItemIcon] {
      margin: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1.25rem 1rem 1rem;
      font: var(--mat-sys-title-large);
      color: var(--mat-sys-primary);
    }
    .sidenav mat-nav-list {
      padding: 0 0.625rem 0.625rem;
      --mat-list-list-item-label-text-weight: 500;
    }
    .sidenav mat-nav-list .mat-mdc-list-item {
      border-radius: 6px;
      height: 42px;
      margin-bottom: 2px;
    }
    /* Neutralize the <button> user-agent chrome so the Planning items render
       pixel-identical to the <a> nav items (buttons inherit text-align:center,
       which shifts the label inside MDC's content box). */
    .sidenav mat-nav-list button.mat-mdc-list-item {
      width: 100%;
      border: none;
      background: transparent;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .sidenav.collapsed mat-nav-list .mat-mdc-list-item {
      justify-content: center;
    }
    .sidenav mat-icon[matListItemIcon] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      font-size: 20px;
      line-height: 1;
      width: 20px;
      height: 20px;
      margin: 0 4px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .sidenav-spacer {
      flex: 1;
    }
    .side-divider {
      margin: 0.5rem 1rem;
    }
    .side-section {
      padding: 0.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .section-label {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
      padding: 0 0.375rem 0.35rem;
    }
    .nav-label {
      padding: 0.75rem 1.375rem 0.35rem;
    }
    .cal-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.3rem 0.375rem;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }
    .cal-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .week-card {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      padding: 0.75rem 0.875rem;
      border-radius: 8px;
      background: var(--mat-sys-surface-container);
    }
    .week-title {
      font: var(--mat-sys-label-small);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mat-sys-on-surface-variant);
    }
    .week-stat {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }
    .week-sub {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .search {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: min(420px, 38vw);
      height: 40px;
      padding: 0 0.9rem;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
    }
    .search mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }
    .search input::placeholder {
      color: var(--mat-sys-on-surface-variant);
    }
    .profile {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.8rem 1rem;
      border: none;
      border-top: 1px solid var(--mat-sys-outline-variant);
      background: transparent;
      text-align: left;
      width: 100%;
      cursor: pointer;
      font: inherit;
    }
    .profile:hover {
      background: var(--mat-sys-surface-container);
    }
    .profile.rail {
      justify-content: center;
      padding: 0.8rem 0;
    }
    .profile-chevron {
      margin-left: auto;
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-on-surface-variant);
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font: var(--mat-sys-label-medium);
      font-weight: 600;
    }
    .profile-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .profile-name {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-role {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .nav-active {
      --mat-list-list-item-container-color: var(--mat-sys-secondary-container);
      --mat-list-list-item-label-text-color: var(--mat-sys-on-secondary-container);
      --mat-list-list-item-hover-label-text-color: var(--mat-sys-on-secondary-container);
    }
    .sidenav .nav-active mat-icon[matListItemIcon] {
      color: var(--mat-sys-on-secondary-container);
    }
    .content {
      display: flex;
      flex-direction: column;
    }
    .header {
      position: relative;
      gap: 0.5rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
    }
    .spacer {
      flex: 1;
    }
    .outlet {
      flex: 1;
      overflow-y: auto;
      background: var(--mat-sys-surface-container-lowest);
    }
  `,
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly collapsed = signal(
    localStorage.getItem(COLLAPSED_KEY) === 'true',
  );
  protected readonly isRail = computed(() => !this.isHandset() && this.collapsed());

  onToggleSidenav(side: MatSidenav): void {
    if (this.isHandset()) {
      void side.toggle();
      return;
    }
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem(COLLAPSED_KEY, String(next));
  }

  protected readonly nav: NavItem[] = [
    { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
    { label: 'Resources', icon: 'meeting_room', path: '/resources' },
    { label: 'Bookings', icon: 'list_alt', path: '/bookings' },
  ];

  protected readonly planned = [
    { label: 'Timeline', icon: 'view_timeline' },
    { label: 'Reports', icon: 'insights' },
    { label: 'Approvals', icon: 'fact_check' },
  ];

  protected readonly calendars = [
    { name: 'Meeting rooms', color: '#0f766e' },
    { name: 'People', color: '#b45309' },
    { name: 'Equipment', color: '#6d28d9' },
    { name: 'External holds', color: '#be123c' },
  ];

  onNewBooking(): void {
    this.snackBar.open('The booking wizard lands with a later slice.', 'OK', {
      duration: 3000,
    });
  }

  onComingSoon(feature: string): void {
    this.snackBar.open(`${feature} lands with a later slice.`, 'OK', {
      duration: 3000,
    });
  }
}
