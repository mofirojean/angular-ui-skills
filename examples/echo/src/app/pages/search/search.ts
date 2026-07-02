import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-search',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Search"
      [phase]="9"
      subtitle="AutoComplete-driven substring search over LibraryService signals. Tabs across All / Songs / Artists / Albums / Playlists. Top result Card plus section DataViews on the All tab."
    />
  `,
})
export class Search {}
