import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-time-off',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Time off</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Phase 5 lands the calendar + requests table + balances, plus the new-request dialog.
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeOff {}
