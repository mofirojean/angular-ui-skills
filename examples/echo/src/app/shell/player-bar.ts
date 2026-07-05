import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Slider } from 'primeng/slider';
import { PlayerService } from '../audio/player.service';
import { LibraryService } from '../data/library.service';

@Component({
  selector: 'echo-player-bar',
  imports: [FormsModule, RouterLink, Button, Slider],
  host: {
    class:
      'shrink-0 border-t border-[var(--echo-border)] bg-[var(--echo-chrome-bg)]',
  },
  template: `
    <span class="sr-only" role="status" aria-live="polite">
      @if (currentTrack(); as track) {
        Now playing: {{ track.title }} by {{ track.artist }}
      }
    </span>

    <div class="flex h-14 items-center gap-3 px-3 md:hidden">
      <a routerLink="/now-playing" class="flex min-w-0 flex-1 items-center gap-2">
        @if (coverUrl(); as url) {
          <img
            [src]="url"
            alt=""
            class="h-10 w-10 shrink-0 rounded object-cover"
          />
        } @else {
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded bg-[var(--echo-tile)] text-[var(--echo-muted)]"
          >
            <i class="pi pi-image text-sm"></i>
          </div>
        }
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-[var(--echo-heading)]">
            {{ currentTrack()?.title ?? 'Nothing playing' }}
          </div>
          <div class="truncate text-xs text-[var(--echo-muted)]">
            {{ currentTrack()?.artist ?? 'Tap to open' }}
          </div>
        </div>
      </a>
      <p-button
        [icon]="liked() ? 'pi pi-heart-fill' : 'pi pi-heart'"
        [rounded]="true"
        [severity]="liked() ? 'primary' : 'secondary'"
        [text]="true"
        size="small"
        ariaLabel="Like"
        [disabled]="!currentTrack()"
        (onClick)="onToggleLike()"
      />
      <p-button
        [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
        [rounded]="true"
        ariaLabel="Play or pause"
        [disabled]="!currentTrack()"
        (onClick)="onTogglePlay()"
      />
    </div>

    <div class="hidden h-20 items-center gap-6 px-4 md:flex">
      <a routerLink="/now-playing" class="flex min-w-0 flex-1 items-center gap-3">
        @if (coverUrl(); as url) {
          <img
            [src]="url"
            alt=""
            class="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        } @else {
          <div
            class="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-[var(--echo-tile)] text-[var(--echo-muted)]"
          >
            <i class="pi pi-image"></i>
          </div>
        }
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-[var(--echo-heading)]">
            {{ currentTrack()?.title ?? 'Nothing playing' }}
          </div>
          <div class="truncate text-xs text-[var(--echo-muted)]">
            {{ currentTrack()?.artist ?? 'Import a track to get started' }}
          </div>
        </div>
        <p-button
          [icon]="liked() ? 'pi pi-heart-fill' : 'pi pi-heart'"
          [rounded]="true"
          [severity]="liked() ? 'primary' : 'secondary'"
          [text]="true"
          size="small"
          ariaLabel="Like"
          [disabled]="!currentTrack()"
          (click)="$event.preventDefault(); onToggleLike()"
        />
      </a>

      <div class="flex flex-2 flex-col items-center gap-1">
        <div class="flex items-center gap-1">
          <p-button
            icon="pi pi-refresh"
            [rounded]="true"
            [severity]="shuffle() ? 'primary' : 'secondary'"
            [text]="!shuffle()"
            size="small"
            ariaLabel="Shuffle"
            (onClick)="onShuffle()"
          />
          <p-button
            icon="pi pi-step-backward"
            [rounded]="true"
            severity="secondary"
            [text]="true"
            size="small"
            ariaLabel="Previous"
            [disabled]="!currentTrack()"
            (onClick)="onPrevious()"
          />
          <p-button
            [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
            [rounded]="true"
            size="large"
            ariaLabel="Play or pause"
            [disabled]="!currentTrack()"
            (onClick)="onTogglePlay()"
          />
          <p-button
            icon="pi pi-step-forward"
            [rounded]="true"
            severity="secondary"
            [text]="true"
            size="small"
            ariaLabel="Next"
            [disabled]="!hasNext()"
            (onClick)="onNext()"
          />
          <p-button
            [icon]="repeatIcon()"
            [rounded]="true"
            [severity]="repeat() !== 'off' ? 'primary' : 'secondary'"
            [text]="repeat() === 'off'"
            size="small"
            ariaLabel="Repeat"
            (onClick)="onRepeat()"
          />
        </div>

        <div class="flex w-full max-w-xl items-center gap-3">
          <span class="w-10 text-right text-xs tabular-nums text-[var(--echo-muted)]">
            {{ progressLabel() }}
          </span>
          <p-slider
            class="flex-1"
            [ngModel]="progressPercent()"
            (ngModelChange)="onSeek($event)"
            [min]="0"
            [max]="100"
            [step]="0.1"
            [disabled]="!currentTrack()"
          />
          <span class="w-10 text-xs tabular-nums text-[var(--echo-muted)]">
            {{ durationLabel() }}
          </span>
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
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-[var(--echo-muted)] hover:text-[var(--echo-heading)]"
            (click)="onToggleMute()"
            [attr.aria-label]="muted() ? 'Unmute' : 'Mute'"
          >
            <i class="pi" [class.pi-volume-up]="!muted()" [class.pi-volume-off]="muted()"></i>
          </button>
          <p-slider
            class="w-24"
            [ngModel]="volumePercent()"
            (ngModelChange)="onVolume($event)"
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
    </div>
  `,
})
export class PlayerBar {
  private readonly player = inject(PlayerService);
  private readonly library = inject(LibraryService);

  protected readonly liked = computed(() => {
    const track = this.player.currentTrack();
    if (!track) return false;
    return this.library.getById(track.id)?.liked ?? false;
  });

  protected readonly currentTrack = this.player.currentTrack;
  protected readonly isPlaying = this.player.isPlaying;
  protected readonly hasNext = this.player.hasNext;
  protected readonly shuffle = this.player.shuffle;
  protected readonly repeat = this.player.repeat;
  protected readonly muted = this.player.muted;
  protected readonly coverUrl = this.player.coverUrl;

  protected readonly progressPercent = this.player.progressPercent;
  protected readonly volumePercent = computed(() =>
    Math.round(this.player.volume() * 100),
  );

  protected readonly progressLabel = computed(() =>
    formatTime(this.player.progress()),
  );
  protected readonly durationLabel = computed(() =>
    formatTime(this.player.duration()),
  );

  protected readonly repeatIcon = computed(() => {
    switch (this.player.repeat()) {
      case 'one':
        return 'pi pi-replay';
      case 'all':
        return 'pi pi-sync';
      default:
        return 'pi pi-sync';
    }
  });

  async onTogglePlay(): Promise<void> {
    await this.player.togglePlay();
  }

  async onPrevious(): Promise<void> {
    await this.player.previous();
  }

  async onNext(): Promise<void> {
    await this.player.next();
  }

  onShuffle(): void {
    this.player.toggleShuffle();
  }

  onRepeat(): void {
    this.player.cycleRepeat();
  }

  onSeek(percent: number): void {
    this.player.seekPercent(percent);
  }

  onVolume(percent: number): void {
    this.player.setVolume(percent / 100);
  }

  onToggleMute(): void {
    this.player.toggleMute();
  }

  async onToggleLike(): Promise<void> {
    const track = this.player.currentTrack();
    if (!track) return;
    await this.library.toggleLiked(track.id);
  }
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}