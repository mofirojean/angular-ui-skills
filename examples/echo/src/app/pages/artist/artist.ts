import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-artist',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Artist"
      [phase]="6"
      subtitle="Hero Toolbar, Tabs across Overview / Discography / Related / About. Monthly plays Chart derived from the plays store; Timeline of release years."
    />
  `,
})
export class Artist {}
