import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trades {}
