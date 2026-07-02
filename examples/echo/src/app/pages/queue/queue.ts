import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-queue',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Queue"
      [phase]="7"
      subtitle="OrderList editor with Now Playing, Next Up, and Auto-Queue sections. Reorder mutates real playback order."
    />
  `,
})
export class Queue {}
