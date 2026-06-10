import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-ticket-detail',
  imports: [NzCardModule, NzEmptyModule],
  template: `
    <div class="page">
      <nz-card [nzTitle]="'Ticket ' + id()">
        <nz-empty nzNotFoundContent="Phase 3 lands the splitter layout with tabs (Conversation / Activity / Related / Customer)." />
      </nz-card>
    </div>
  `,
  styles: `.page { padding: 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  readonly id = input<string>('');
}
