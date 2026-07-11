import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'cad-bookings',
  imports: [PagePlaceholder],
  template: `
    <cad-page-placeholder
      title="Bookings"
      label="the flat list"
      subtitle="Upcoming bookings as a filterable table with recurrence badges, edit and cancel actions, and undo snackbars."
    />
  `,
})
export class Bookings {}
