import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';

import { Settings } from '../pages/settings/settings';
import { SettingsDialogService } from '../core/settings-dialog.service';

@Component({
  selector: 'app-settings-dialog',
  imports: [NgIcon, HlmButtonImports, Settings],
  template: `
    @if (svc.open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Settings">
        <button
          type="button"
          (click)="svc.hide()"
          class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-sd-fade-in"
          aria-label="Close settings"
        ></button>

        <div class="relative z-10 w-full max-w-5xl h-[min(640px,calc(100vh-4rem))] rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-sd-scale-in">
          <header class="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0 bg-muted/20">
            <ng-icon name="lucideSettings" size="14" class="text-muted-foreground"></ng-icon>
            <h2 class="text-sm font-semibold tracking-tight">Settings</h2>
            <span class="text-xs text-muted-foreground hidden sm:inline">Workspace + per-user preferences</span>
            <div class="flex-1"></div>
            <kbd class="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground hidden sm:inline">Esc</kbd>
            <button type="button" hlmBtn variant="ghost" size="icon" class="size-7" (click)="svc.hide()" aria-label="Close settings">
              <ng-icon name="lucideX" size="14"></ng-icon>
            </button>
          </header>

          <div class="flex-1 min-h-0">
            <app-settings />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    @keyframes sd-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes sd-scale-in {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-sd-fade-in  { animation: sd-fade-in  180ms ease-out; }
    .animate-sd-scale-in { animation: sd-scale-in 220ms cubic-bezier(0.32, 0.72, 0, 1); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class SettingsDialog {
  protected readonly svc = inject(SettingsDialogService);

  protected onEscape(event: Event): void {
    if (this.svc.open()) {
      event.preventDefault();
      this.svc.hide();
    }
  }
}
