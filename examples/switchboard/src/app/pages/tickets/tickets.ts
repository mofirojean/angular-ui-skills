import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-tickets',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card nzTitle="Tickets">
        <nz-empty nzNotFoundContent="Phase 2 lands the flagship ticket table with filters, virtual scroll, and inline edit." />
      </nz-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tickets {}
