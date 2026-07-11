import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cad-page-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="placeholder">
      <span class="eyebrow">{{ label() }}</span>
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </section>
  `,
  styles: `
    .placeholder {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 2.5rem;
    }
    .eyebrow {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--mat-sys-primary);
    }
    h1 {
      font: var(--mat-sys-display-small);
      color: var(--mat-sys-on-surface);
      margin: 0;
    }
    p {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      max-width: 56ch;
      margin: 0.5rem 0 0;
    }
  `,
})
export class PagePlaceholder {
  readonly title = input.required<string>();
  readonly label = input<string>('coming soon');
  readonly subtitle = input<string>('');
}
