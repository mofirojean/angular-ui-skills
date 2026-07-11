import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'cad-settings',
  imports: [PagePlaceholder],
  template: `
    <cad-page-placeholder
      title="Settings"
      label="preferences"
      subtitle="Working hours, week start, default duration, grid snap increment, theme, and demo-data reset."
    />
  `,
})
export class Settings {}
