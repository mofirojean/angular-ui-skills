import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'echo-player-bar',
  imports: [FormsModule, RouterLink, Button, Slider],
  host: {
    class:
      'flex h-20 shrink-0 items-center gap-6 border-t border-[var(--p-surface-800)] bg-[var(--p-surface-950)] px-4',
  },
  template: `
    <a routerLink="/now-playing" class="flex min-w-0 flex-1 items-center gap-3">
      <div
        class="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-[var(--p-surface-800)] text-[var(--p-surface-500)]"
      >
        <i class="pi pi-image"></i>
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium text-[var(--p-surface-100)]">
          Nothing playing
        </div>
        <div class="truncate text-xs text-[var(--p-surface-400)]">
          Import a track to get started
        </div>
      </div>
      <p-button
        icon="pi pi-heart"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Like"
        (click)="$event.preventDefault()"
      />
    </a>

    <div class="flex flex-2 flex-col items-center gap-1">
      <div class="flex items-center gap-1">
        <p-button
          icon="pi pi-refresh"
          [rounded]="true"
          severity="secondary"
          [text]="true"
          size="small"
          ariaLabel="Shuffle"
        />
        <p-button
          icon="pi pi-step-backward"
          [rounded]="true"
          severity="secondary"
          [text]="true"
          size="small"
          ariaLabel="Previous"
        />
        <p-button
          [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
          [rounded]="true"
          size="large"
          ariaLabel="Play or pause"
          (onClick)="togglePlay()"
        />
        <p-button
          icon="pi pi-step-forward"
          [rounded]="true"
          severity="secondary"
          [text]="true"
          size="small"
          ariaLabel="Next"
        />
        <p-button
          icon="pi pi-replay"
          [rounded]="true"
          severity="secondary"
          [text]="true"
          size="small"
          ariaLabel="Repeat"
        />
      </div>

      <div class="flex w-full max-w-xl items-center gap-3">
        <span class="w-10 text-right text-xs tabular-nums text-[var(--p-surface-400)]">0:00</span>
        <p-slider
          class="flex-1"
          [ngModel]="progress()"
          (ngModelChange)="progress.set($event)"
          [min]="0"
          [max]="100"
        />
        <span class="w-10 text-xs tabular-nums text-[var(--p-surface-400)]">0:00</span>
      </div>
    </div>

    <div class="flex flex-1 items-center justify-end gap-1">
      <p-button
        icon="pi pi-list"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Queue"
        routerLink="/queue"
      />
      <div class="flex items-center gap-2 pl-2">
        <i class="pi pi-volume-up text-[var(--p-surface-400)]"></i>
        <p-slider
          class="w-24"
          [ngModel]="volume()"
          (ngModelChange)="volume.set($event)"
          [min]="0"
          [max]="100"
        />
      </div>
      <p-button
        icon="pi pi-window-maximize"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Now Playing"
        routerLink="/now-playing"
      />
    </div>
  `,
})
export class PlayerBar {
  protected readonly isPlaying = signal(false);
  protected readonly progress = signal(0);
  protected readonly volume = signal(80);

  togglePlay() {
    this.isPlaying.update((v) => !v);
  }
}
