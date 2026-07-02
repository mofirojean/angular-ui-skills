import { Component } from '@angular/core';
import { PagePlaceholder } from '../../shared/page-placeholder/page-placeholder';

@Component({
  selector: 'echo-import',
  imports: [PagePlaceholder],
  template: `
    <echo-page-placeholder
      title="Import"
      [phase]="4"
      subtitle="Full-height FileUpload drop zone plus a progress Table showing filename, extracted metadata, per-file ProgressBar, and status Tag as tracks stream through the ImportService."
    />
  `,
})
export class Import {}
