import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Phase 6 also lands the settings sub-sidenav with General / Branding / Teams / Roles / Holidays / Notifications.
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}
