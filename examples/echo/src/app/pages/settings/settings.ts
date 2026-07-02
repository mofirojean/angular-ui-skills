import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-settings',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Settings"
      [phase]="10"
      subtitle="Tabs across Profile / Playback / Library / Storage / Notifications / About. Includes the live-wired 5-Knob EQ, real navigator.storage.estimate() MeterGroup, and watched-folder Table."
    />
  `,
})
export class Settings {}
