import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'echo-not-found',
  imports: [RouterLink, Button],
  template: `
    <section class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--echo-accent)]">
        404
      </span>
      <h1 class="text-4xl font-semibold tracking-tight text-[var(--echo-heading)]">
        Nothing plays at this address.
      </h1>
      <p class="max-w-md text-sm text-[var(--echo-text)]">
        The page you're after doesn't exist. Head back home to see your library.
      </p>
      <p-button label="Back to home" icon="pi pi-home" routerLink="/" class="mt-2" />
    </section>
  `,
})
export class NotFound {}
