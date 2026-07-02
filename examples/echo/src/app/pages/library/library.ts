import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-library',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Library"
      [phase]="5"
      subtitle="Tabs across Songs / Albums / Artists / Playlists. Songs Table is virtual-scrolled against IndexedDB with ContextMenu, bulk Toolbar, and filter bar. Playing a track from here starts real audio."
    />
  `,
})
export class Library {}
