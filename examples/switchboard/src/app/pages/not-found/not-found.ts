import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NzResultModule, NzButtonModule],
  template: `
    <div class="page">
      <nz-result
        nzStatus="404"
        nzTitle="404"
        nzSubTitle="Sorry, the page you visited does not exist."
      >
        <div nz-result-extra>
          <button nz-button nzType="primary" routerLink="/">Back to dashboard</button>
        </div>
      </nz-result>
    </div>
  `,
  styles: `.page { padding: 48px 24px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
