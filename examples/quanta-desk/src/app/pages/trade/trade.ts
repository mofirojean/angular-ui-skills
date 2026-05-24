import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trade {}
