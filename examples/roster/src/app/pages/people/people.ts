import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-people',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>People</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          Phase 2 lands the flagship MatTable with filters, sort, paginate, bulk-select, and virtual scroll.
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class People {}
