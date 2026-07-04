import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Slider } from 'primeng/slider';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { PlayerService } from '../../audio/player.service';
import { LibraryService } from '../../data/library.service';
import type { Track } from '../../data/types';
import { WaveformScrubber } from '../../shared/waveform-scrubber/waveform-scrubber';

@Component({
  selector: 'echo-now-playing',
  imports: [
    DecimalPipe,
    FormsModule,
    Button,
    Slider,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
    WaveformScrubber,
  ],
  template: `
    <section class="now-page">
      @if (backdropUrl(); as url) {
        <div
          class="backdrop"
          [style.background-image]="'url(' + url + ')'"
        ></div>
      }

      <header class="top-bar">
        <p-button
          icon="pi pi-chevron-down"
          [rounded]="true"
          severity="secondary"
          [text]="true"
          size="small"
          ariaLabel="Close"
          (onClick)="onClose()"
        />
        <div class="now-title">Now playing</div>
        <span class="w-10"></span>
      </header>

      @if (track(); as t) {
        <div class="stage">
          <div class="cover">
            @if (coverUrl(); as url) {
              <img [src]="url" alt="" />
            } @else {
              <div class="cover-fallback">
                <i class="pi pi-image text-4xl"></i>
              </div>
            }
          </div>

          <div class="track-meta">
            <h1 class="title">{{ t.title }}</h1>
            <div class="subtitle">
              <a
                class="link"
                href="javascript:void(0)"
                (click)="onGoArtist(t.artist)"
              >
                {{ t.artist }}
              </a>
              <span class="dot">·</span>
              <a
                class="link"
                href="javascript:void(0)"
                (click)="onGoAlbum(t)"
              >
                {{ t.album }}
              </a>
            </div>
          </div>

          <div class="scrubber">
            <echo-waveform-scrubber
              [peaks]="t.peaks"
              [progress]="progress()"
              [duration]="duration()"
              (seek)="onSeek($event)"
            />
            <div class="timestamps">
              <span>{{ formatTime(progress()) }}</span>
              <span>{{ formatTime(duration()) }}</span>
            </div>
          </div>

          <div class="transport">
            <p-button
              icon="pi pi-refresh"
              [rounded]="true"
              [severity]="shuffle() ? 'primary' : 'secondary'"
              [text]="!shuffle()"
              size="small"
              ariaLabel="Shuffle"
              (onClick)="player.toggleShuffle()"
            />
            <p-button
              icon="pi pi-step-backward"
              [rounded]="true"
              severity="secondary"
              [text]="true"
              (onClick)="onPrevious()"
              ariaLabel="Previous"
            />
            <p-button
              [icon]="isPlaying() ? 'pi pi-pause' : 'pi pi-play'"
              [rounded]="true"
              size="large"
              ariaLabel="Play or pause"
              (onClick)="onTogglePlay()"
            />
            <p-button
              icon="pi pi-step-forward"
              [rounded]="true"
              severity="secondary"
              [text]="true"
              (onClick)="onNext()"
              ariaLabel="Next"
            />
            <p-button
              icon="pi pi-sync"
              [rounded]="true"
              [severity]="repeat() !== 'off' ? 'primary' : 'secondary'"
              [text]="repeat() === 'off'"
              size="small"
              ariaLabel="Repeat"
              (onClick)="player.cycleRepeat()"
            />
          </div>

          <div class="volume">
            <i class="pi pi-volume-down text-[var(--echo-muted)]"></i>
            <p-slider
              class="w-40"
              [ngModel]="volumePercent()"
              (ngModelChange)="onVolume($event)"
              [min]="0"
              [max]="100"
            />
            <i class="pi pi-volume-up text-[var(--echo-muted)]"></i>
          </div>
        </div>

        <p-tabs [(value)]="activeTab" class="now-tabs">
          <p-tablist>
            <p-tab value="up-next">Up next</p-tab>
            <p-tab value="info">Info</p-tab>
            <p-tab value="related">Related</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="up-next">
              @if (upNext().length === 0) {
                <div class="empty">Queue is empty after the current track.</div>
              } @else {
                <div class="up-next-list">
                  @for (nextTrack of upNext(); track nextTrack.id) {
                    <button
                      type="button"
                      class="next-row"
                      (click)="onPlayFromQueue(nextTrack)"
                    >
                      <span class="next-title">{{ nextTrack.title }}</span>
                      <span class="next-artist">{{ nextTrack.artist }}</span>
                      <span class="next-duration tabular-nums">
                        {{ formatTime(nextTrack.duration) }}
                      </span>
                    </button>
                  }
                </div>
              }
            </p-tabpanel>
            <p-tabpanel value="info">
              <dl class="info-grid">
                <dt>Format</dt>
                <dd>{{ t.format || t.codec || 'Unknown' }}</dd>
                <dt>Codec</dt>
                <dd>{{ t.codec || '—' }}</dd>
                <dt>Bit rate</dt>
                <dd>
                  {{ t.bitrate ? (t.bitrate / 1000 | number: '1.0-0') + ' kbps' : '—' }}
                </dd>
                <dt>Sample rate</dt>
                <dd>
                  {{ t.sampleRate ? (t.sampleRate / 1000 | number: '1.1-1') + ' kHz' : '—' }}
                </dd>
                <dt>Channels</dt>
                <dd>{{ t.channels ?? '—' }}</dd>
                <dt>File size</dt>
                <dd>{{ formatSize(t.fileSize) }}</dd>
                <dt>File name</dt>
                <dd class="mono">{{ t.fileName }}</dd>
                @if (t.genre.length > 0) {
                  <dt>Genre</dt>
                  <dd>
                    <div class="chips">
                      @for (g of t.genre; track g) {
                        <p-tag severity="secondary" [value]="g" />
                      }
                    </div>
                  </dd>
                }
              </dl>
            </p-tabpanel>
            <p-tabpanel value="related">
              @if (related().length === 0) {
                <div class="empty">No related tracks yet.</div>
              } @else {
                <div class="related-list">
                  @for (rel of related(); track rel.id) {
                    <button
                      type="button"
                      class="next-row"
                      (click)="onPlayRelated(rel)"
                    >
                      <span class="next-title">{{ rel.title }}</span>
                      <span class="next-artist">{{ rel.album }}</span>
                      <span class="next-duration tabular-nums">
                        {{ formatTime(rel.duration) }}
                      </span>
                    </button>
                  }
                </div>
              }
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      } @else {
        <div class="empty large">
          Nothing playing. Pick a track from your library.
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .now-page {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-height: 100%;
        padding: 1rem 1.5rem 2rem;
      }
      @media (min-width: 768px) {
        .now-page {
          padding: 1.25rem 3rem 2.5rem;
        }
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        filter: blur(40px) saturate(140%) brightness(0.6);
        opacity: 0.55;
        pointer-events: none;
        z-index: 0;
      }
      .backdrop::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at center,
          transparent 0%,
          var(--echo-bg) 75%
        );
      }
      .top-bar,
      .stage,
      .now-tabs {
        position: relative;
        z-index: 1;
      }
      .top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .now-title {
        font-size: 0.75rem;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-muted);
      }
      .stage {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        justify-items: center;
        text-align: center;
        max-width: 720px;
        margin: 0 auto;
        width: 100%;
      }
      .cover {
        width: min(320px, 60vw);
        aspect-ratio: 1 / 1;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      }
      .cover img,
      .cover-fallback {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: grid;
        place-items: center;
        background: var(--echo-tile);
        color: var(--echo-muted);
      }
      .track-meta {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .title {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
        line-height: 1.1;
      }
      .subtitle {
        font-size: 0.95rem;
        color: var(--echo-text);
        display: flex;
        gap: 0.35rem;
        justify-content: center;
      }
      .link {
        color: inherit;
        text-decoration: none;
      }
      .link:hover {
        color: var(--echo-heading);
        text-decoration: underline;
      }
      .dot {
        opacity: 0.6;
      }
      .scrubber {
        width: 100%;
      }
      .timestamps {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--echo-muted);
        margin-top: 0.35rem;
      }
      .transport {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .volume {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      :host ::ng-deep .now-tabs {
        max-width: 720px;
        width: 100%;
        margin: 1rem auto 0;
      }
      :host ::ng-deep .now-tabs .p-tabpanel {
        padding-top: 1rem;
      }
      .empty {
        border-radius: 12px;
        border: 1px dashed var(--echo-border);
        color: var(--echo-muted);
        font-size: 0.875rem;
        padding: 2rem;
        text-align: center;
      }
      .empty.large {
        min-height: 320px;
        display: grid;
        place-items: center;
      }
      .up-next-list,
      .related-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .next-row {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.75rem;
        align-items: center;
        padding: 0.5rem 0.75rem;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
      }
      .next-row:hover {
        background: var(--echo-hover);
      }
      .next-title {
        font-size: 0.875rem;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .next-artist {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .next-duration {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .info-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        column-gap: 1.25rem;
        row-gap: 0.5rem;
        margin: 0;
        font-size: 0.875rem;
      }
      .info-grid dt {
        color: var(--echo-muted);
      }
      .info-grid dd {
        color: var(--echo-heading);
        margin: 0;
        word-break: break-word;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.75rem;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
    `,
  ],
})
export class NowPlaying {
  protected readonly player = inject(PlayerService);
  private readonly library = inject(LibraryService);
  private readonly router = inject(Router);

  protected readonly track = this.player.currentTrack;
  protected readonly progress = this.player.progress;
  protected readonly duration = this.player.duration;
  protected readonly isPlaying = this.player.isPlaying;
  protected readonly shuffle = this.player.shuffle;
  protected readonly repeat = this.player.repeat;
  protected readonly coverUrl = this.player.coverUrl;
  protected readonly volumePercent = computed(() => Math.round(this.player.volume() * 100));
  protected readonly activeTab = signal<'up-next' | 'info' | 'related'>('up-next');

  protected readonly backdropUrl = signal<string | null>(null);

  protected readonly upNext = computed(() => {
    const queue = this.player.queue();
    const idx = this.player.queueIndex();
    if (idx < 0) return [];
    return queue.slice(idx + 1, idx + 6);
  });

  protected readonly related = computed(() => {
    const current = this.track();
    if (!current) return [];
    return this.library
      .tracksByArtist(current.artist)
      .filter((t) => t.id !== current.id)
      .slice(0, 6);
  });

  constructor() {
    effect(() => {
      const url = this.coverUrl();
      this.backdropUrl.set(url);
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      void this.player.togglePlay();
    } else if (event.code === 'ArrowRight') {
      event.preventDefault();
      void this.player.next();
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault();
      void this.player.previous();
    }
  }

  onClose(): void {
    void this.router.navigate(['/']);
  }

  onTogglePlay(): void {
    void this.player.togglePlay();
  }

  onPrevious(): void {
    void this.player.previous();
  }

  onNext(): void {
    void this.player.next();
  }

  onSeek(seconds: number): void {
    this.player.seek(seconds);
  }

  onVolume(percent: number): void {
    this.player.setVolume(percent / 100);
  }

  async onPlayFromQueue(track: Track): Promise<void> {
    await this.player.playTrack(track);
  }

  async onPlayRelated(track: Track): Promise<void> {
    const queue = this.library.tracksByArtist(track.artist);
    await this.player.playTrack(track, queue);
  }

  onGoArtist(name: string): void {
    void this.router.navigate(['/artist', encodeURIComponent(name)]);
  }

  onGoAlbum(track: Track): void {
    const key = `${track.albumArtist}::${track.album}`;
    void this.router.navigate(['/album', encodeURIComponent(key)]);
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
