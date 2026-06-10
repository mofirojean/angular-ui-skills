import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-settings',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card nzTitle="Settings">
        <nz-empty nzNotFoundContent="Phase 5 lands Anchor side-nav with Form per section (General, Notifications, Business hours, Integrations)." />
      </nz-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {}
