import { Component, input } from '@angular/core';

@Component({
  selector: 'echo-page-placeholder',
  template: `
    <section class="flex h-full flex-col items-start justify-start px-10 pt-10 pb-16">
      <span class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--p-primary-400)]">
        Phase {{ phase() }} · {{ label() }}
      </span>
      <h1 class="mt-2 text-4xl font-semibold tracking-tight text-[var(--p-surface-0)]">
        {{ title() }}
      </h1>
      @if (subtitle()) {
        <p class="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--p-surface-300)]">
          {{ subtitle() }}
        </p>
      }
    </section>
  `,
})
export class PagePlaceholder {
  readonly title = input.required<string>();
  readonly label = input<string>('coming soon');
  readonly phase = input<number>(1);
  readonly subtitle = input<string>('');
}
