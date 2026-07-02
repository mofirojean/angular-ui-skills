import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-playlist',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Playlist"
      [phase]="7"
      subtitle="OrderList tracklist with drag-drop reorder. Editable Inplace title and description. Add-tracks Drawer with an AutoComplete plus a mini PickList."
    />
  `,
})
export class Playlist {}
