import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <mat-icon class="material-symbols-outlined notfound__icon">help</mat-icon>
      <h1 class="notfound__title">404</h1>
      <p class="notfound__sub">The page you visited does not exist.</p>
      <button mat-flat-button routerLink="/">
        <mat-icon class="material-symbols-outlined">arrow_back</mat-icon>
        Back to dashboard
      </button>
    </div>
  `,
  styles: `
    .page {
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }
    .notfound__icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 12px;
    }
    .notfound__title {
      margin: 0;
      font-size: 36px;
      font-weight: 600;
    }
    .notfound__sub {
      margin: 0 0 16px;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
