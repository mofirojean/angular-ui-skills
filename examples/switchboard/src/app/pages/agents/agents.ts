import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-agents',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card nzTitle="Agents">
        <nz-empty nzNotFoundContent="Phase 6 lands the team table, agent detail Modal, and the Transfer permission editor." />
      </nz-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Agents {}
