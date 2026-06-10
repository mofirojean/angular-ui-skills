import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-dashboard',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card nzTitle="Dashboard">
        <nz-empty nzNotFoundContent="Phase 1 will land KPI cards, the 14-day volume chart, agent presence, and recent tickets." />
      </nz-card>
    </div>
  `,
  styles: `
    .page { padding: 24px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
