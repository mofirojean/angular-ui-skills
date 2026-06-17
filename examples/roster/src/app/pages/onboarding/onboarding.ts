import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-onboarding',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Onboarding</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Phase 4 lands the CDK drag-drop kanban + new-hire MatStepper wizard.
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Onboarding {}
