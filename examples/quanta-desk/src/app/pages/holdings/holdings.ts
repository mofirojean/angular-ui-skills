import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Holdings {}
