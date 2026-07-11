import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'cad-resources',
  imports: [PagePlaceholder],
  template: `
    <cad-page-placeholder
      title="Resources"
      label="rooms and people"
      subtitle="Meeting rooms with capacity and equipment, bookable people with availability. Tabs, a rooms table, and people cards land here."
    />
  `,
})
export class Resources {}
