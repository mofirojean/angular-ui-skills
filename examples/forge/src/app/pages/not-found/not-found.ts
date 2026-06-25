import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NgIcon, HlmButtonImports],
  template: `
    <section class="flex flex-col items-center justify-center min-h-full p-8 text-center max-w-md mx-auto">
      <div class="relative mb-6">
        <span class="absolute inset-0 size-20 rounded-full bg-amber-500/15 blur-2xl"></span>
        <span class="relative inline-flex size-20 items-center justify-center rounded-full bg-muted ring-1 ring-border text-muted-foreground">
          <ng-icon name="lucideCircleAlert" size="32"></ng-icon>
        </span>
      </div>
      <p class="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">404</p>
      <h2 class="mt-1 text-2xl font-semibold tracking-tight">This route does not exist</h2>
      <p class="mt-2 text-sm text-muted-foreground max-w-sm">
        The URL might be wrong, or the page was removed. Use the command palette
        <kbd class="font-mono text-[10px] px-1.5 py-0.5 rounded border bg-muted">⌘K</kbd>
        to jump anywhere, or head back to your inbox.
      </p>
      <div class="mt-6 flex items-center gap-2">
        <a hlmBtn routerLink="/" class="gap-2">
          <ng-icon name="lucideInbox" size="14"></ng-icon>
          Back to inbox
        </a>
        <a hlmBtn variant="outline" routerLink="/settings" class="gap-2">
          <ng-icon name="lucideSettings" size="14"></ng-icon>
          Open settings
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
