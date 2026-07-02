import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-now-playing',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Now Playing"
      [phase]="8"
      subtitle="Fullscreen immersive view: Galleria for the cover, canvas-rendered waveform scrubber drawn from cached peaks, transport row, Tabs for Up next / Info / Related."
    />
  `,
})
export class NowPlaying {}
