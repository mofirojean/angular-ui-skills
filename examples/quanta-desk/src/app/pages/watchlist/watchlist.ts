import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Watchlist {}
