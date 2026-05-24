import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-holding-detail',
  templateUrl: './holding-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingDetail {
  readonly ticker = input<string>('');
}
