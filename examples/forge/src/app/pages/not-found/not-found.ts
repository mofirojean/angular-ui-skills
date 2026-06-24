import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, HlmButtonImports],
  template: `
    <section class="p-6 max-w-md mx-auto text-center mt-24">
      <h2 class="text-3xl font-semibold tracking-tight">404</h2>
      <p class="text-sm text-muted-foreground mt-2 mb-6">This route does not exist.</p>
      <a hlmBtn routerLink="/">Back to inbox</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
