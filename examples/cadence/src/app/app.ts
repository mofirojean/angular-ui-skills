import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { ThemeService } from './shared/theme.service';

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
    MatIcon,
    MatNavList,
    MatListItem,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatToolbar,
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        #side
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="!isHandset()"
        class="sidenav"
      >
        <div class="brand">
          <mat-icon aria-hidden="true">event_repeat</mat-icon>
          <span>Cadence</span>
        </div>
        <mat-nav-list>
          @for (item of nav; track item.path) {
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive="nav-active"
              (click)="isHandset() && side.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-spacer"></div>
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/settings"
            routerLinkActive="nav-active"
            (click)="isHandset() && side.close()"
          >
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar class="header">
          @if (isHandset()) {
            <button
              mat-icon-button
              (click)="side.toggle()"
              aria-label="Toggle navigation"
            >
              <mat-icon>menu</mat-icon>
            </button>
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
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0;
      background: var(--mat-sys-surface);
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
    .sidenav mat-nav-list a.mat-mdc-list-item {
      border-radius: 6px;
      height: 42px;
      margin-bottom: 2px;
    }
    .sidenav mat-icon[matListItemIcon] {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 4px;
      color: var(--mat-sys-on-surface-variant);
    }
    .sidenav-spacer {
      flex: 1;
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

  protected readonly nav: NavItem[] = [
    { label: 'Calendar', icon: 'calendar_month', path: '/calendar' },
    { label: 'Resources', icon: 'meeting_room', path: '/resources' },
    { label: 'Bookings', icon: 'list_alt', path: '/bookings' },
  ];

  onNewBooking(): void {
    this.snackBar.open('The booking wizard lands with a later slice.', 'OK', {
      duration: 3000,
    });
  }
}
