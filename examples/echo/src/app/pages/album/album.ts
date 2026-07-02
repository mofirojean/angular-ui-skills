import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-album',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Album"
      [phase]="6"
      subtitle="Splitter layout: cover art and metadata on the left, tracklist Table with row expansion for credits on the right."
    />
  `,
})
export class Album {}
