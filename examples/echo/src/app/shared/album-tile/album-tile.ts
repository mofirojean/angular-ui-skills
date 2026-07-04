import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Button } from 'primeng/button';
import { LibraryService } from '../../data/library.service';
import type { AlbumSummary } from '../../data/library.service';

@Component({
  selector: 'echo-album-tile',
  imports: [Button, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="tile"
      (click)="open.emit(album())"
      (keydown.enter)="open.emit(album())"
    >
      <div class="cover">
        @if (coverUrl(); as url) {
          <img [ngSrc]="url" alt="" fill />
        } @else {
          <div class="cover-fallback">
            <i class="pi pi-image"></i>
          </div>
        }
        <span class="play-overlay">
          <p-button
            icon="pi pi-play"
            [rounded]="true"
            severity="primary"
            size="small"
            ariaLabel="Play album"
            (click)="onPlay($event)"
          />
        </span>
      </div>
      <div class="meta">
        <div class="title" [title]="album().album">{{ album().album }}</div>
        <div class="subtitle">
          <span>{{ album().albumArtist }}</span>
          @if (album().year) {
            <span class="dot">·</span>
            <span>{{ album().year }}</span>
          }
        </div>
      </div>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tile {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }
      .cover {
        position: relative;
        aspect-ratio: 1 / 1;
        border-radius: 8px;
        overflow: hidden;
        background: var(--echo-tile);
        transition: transform 200ms ease;
      }
      .tile:hover .cover {
        transform: translateY(-2px);
      }
      .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cover-fallback {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        color: var(--echo-muted);
        font-size: 1.5rem;
      }
      .play-overlay {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 150ms ease, transform 150ms ease;
      }
      .tile:hover .play-overlay,
      .tile:focus-visible .play-overlay {
        opacity: 1;
        transform: translateY(0);
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .subtitle {
        font-size: 0.75rem;
        color: var(--echo-muted);
        display: flex;
        gap: 0.35rem;
        align-items: center;
      }
      .dot {
        opacity: 0.6;
      }
    `,
  ],
})
export class AlbumTile {
  private readonly library = inject(LibraryService);

  readonly album = input.required<AlbumSummary>();
  readonly play = output<AlbumSummary>();
  readonly open = output<AlbumSummary>();

  protected readonly coverUrl = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const album = this.album();
      const trackId = album.coverTrackId;
      let objectUrl: string | null = null;
      let cancelled = false;
      if (!trackId) {
        this.coverUrl.set(null);
        return;
      }
      void this.library.loadCoverBlob(trackId).then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        this.coverUrl.set(objectUrl);
      });
      onCleanup(() => {
        cancelled = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        this.coverUrl.set(null);
      });
    });
  }

  onPlay(event: MouseEvent): void {
    event.stopPropagation();
    this.play.emit(this.album());
  }
}