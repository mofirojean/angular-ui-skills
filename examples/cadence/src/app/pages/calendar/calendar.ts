import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'cad-calendar',
  imports: [PagePlaceholder],
  template: `
    <cad-page-placeholder
      title="Calendar"
      label="the main surface"
      subtitle="Day, week, month, and agenda views over the booking schedule. The custom time grid, mini month picker, and resource filters land here."
    />
  `,
})
export class Calendar {}
