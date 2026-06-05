import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmKbd } from '@spartan-ng/helm/kbd';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, NgIcon, HlmButton, HlmIcon, HlmKbd],
  template: `
    <div class="bg-background relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-10">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.6] dark:opacity-[0.25]"
        style="background-image: radial-gradient(ellipse 80% 50% at 50% 30%, oklch(0.92 0.12 60 / 0.18), transparent 70%);"
      ></div>

      <div class="relative z-10 w-full max-w-md text-center">
        <p class="text-muted-foreground font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
          404 · route not found
        </p>

        <h1
          class="font-serif text-foreground mt-3 text-[72px] font-medium leading-none tracking-tighter sm:text-[96px]"
        >
          Nothing here.
        </h1>

        <p class="text-muted-foreground mx-auto mt-4 max-w-sm text-[13px] leading-relaxed">
          The address you visited is not part of Apex. Maybe the link is stale,
          maybe the conversation was removed, maybe a typo crept in.
        </p>

        <div class="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-[11px]">
          Press
          <kbd hlmKbd class="h-4.5 text-[10px]">⌘</kbd>
          <kbd hlmKbd class="h-4.5 text-[10px]">K</kbd>
          to jump anywhere
        </div>

        <div class="mt-7 flex flex-wrap items-center justify-center gap-2">
          <button hlmBtn variant="outline" size="sm" type="button" (click)="goBack()">
            <ng-icon hlm name="lucideArrowLeft" size="xs" />
            Go back
          </button>
          <a hlmBtn size="sm" routerLink="/">
            <ng-icon hlm name="lucideHouse" size="xs" />
            New chat
          </a>
        </div>
      </div>
    </div>
  `,
  host: { class: 'flex min-h-0 flex-1' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly location = inject(Location);

  protected goBack(): void {
    this.location.back();
  }
}
