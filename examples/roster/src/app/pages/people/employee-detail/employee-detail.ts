import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-detail',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Employee {{ id() }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Phase 3 lands the tab-driven profile (Overview / Compensation / Reviews / Documents / Activity) with MatTree reporting line.
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetail {
  readonly id = input<string>('');
}
