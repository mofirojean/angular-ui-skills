import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-home',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Home"
      label="foundation shell"
      [phase]="4"
      subtitle="Empty-state drop zone on first run, then Recently added, Recently played, Jump back in, and Your top artists once the library exists."
    />
  `,
})
export class Home {}
