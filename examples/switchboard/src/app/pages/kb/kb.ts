import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-kb',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card nzTitle="Knowledge base">
        <nz-empty nzNotFoundContent="Phase 5 lands Tree categories, Anchor TOC, and the article reader." />
      </nz-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Kb {}
