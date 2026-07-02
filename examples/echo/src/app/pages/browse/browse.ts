import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-browse',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Browse"
      [phase]="8"
      subtitle="MegaMenu facets across Genre / Decade / Year / Format / Bit rate. Clicking a card fills the queue with every track that matches and starts playback."
    />
  `,
})
export class Browse {}
