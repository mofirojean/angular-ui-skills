import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InitialsPipe } from 'ngx-transforms';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ToggleButton } from 'primeng/togglebutton';
import { PlayerService } from '../../audio/player.service';
import { LibraryService, type AlbumSummary } from '../../data/library.service';
import type { Track } from '../../data/types';
import { AlbumTile } from '../../shared/album-tile/album-tile';

@Component({
  selector: 'echo-artist',
  imports: [
    FormsModule,
    InitialsPipe,
    Breadcrumb,
    Button,
    TableModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ToggleButton,
    AlbumTile,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (artist(); as data) {
      <section class="artist-page">
        <p-breadcrumb [model]="crumbs()" />

        <header class="artist-hero">
          <div class="avatar">
            <span>{{ data.name | initials }}</span>
          </div>
          <div class="hero-meta">
            <span class="eyebrow">Artist</span>
            <h1 class="title">{{ data.name }}</h1>
            <div class="hero-stats">
              <span>
                {{ data.trackIds.length }}
                {{ data.trackIds.length === 1 ? 'track' : 'tracks' }}
              </span>
              <span class="dot">·</span>
              <span>
                {{ albums().length }}
                {{ albums().length === 1 ? 'album' : 'albums' }}
              </span>
            </div>
            <div class="hero-actions">
              <p-button
                label="Play"
                icon="pi pi-play"
                (onClick)="onPlayAll()"
                [disabled]="tracks().length === 0"
              />
              <p-button
                label="Shuffle"
                icon="pi pi-refresh"
                severity="secondary"
                [outlined]="true"
                (onClick)="onShufflePlay()"
                [disabled]="tracks().length === 0"
              />
              <p-toggleButton
                [ngModel]="following()"
                (ngModelChange)="following.set($event)"
                onLabel="Following"
                offLabel="Follow"
                onIcon="pi pi-check"
                offIcon="pi pi-plus"
              />
            </div>
          </div>
        </header>

        <p-tabs [(value)]="activeTab" class="artist-tabs">
          <p-tablist>
            <p-tab value="overview">Overview</p-tab>
            <p-tab value="discography">Discography</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="overview">
              <section class="panel">
                <div class="section-header">
                  <h2>Popular</h2>
                  @if (popularTracks().length > 5) {
                    <button
                      type="button"
                      class="link"
                      (click)="showAllPopular.set(!showAllPopular())"
                    >
                      {{ showAllPopular() ? 'Show less' : 'Show all' }}
                    </button>
                  }
                </div>
                @if (popularTracks().length === 0) {
                  <div class="empty">No tracks yet.</div>
                } @else {
                  <p-table [value]="visiblePopular()" size="small">
                    <ng-template pTemplate="body" let-track let-i="rowIndex">
                      <tr
                        class="artist-row"
                        (dblclick)="onPlayTrack(track)"
                      >
                        <td style="width: 3rem">
                          <button
                            type="button"
                            class="row-play"
                            (click)="onPlayTrack(track)"
                            [attr.aria-label]="'Play ' + track.title"
                          >
                            <i class="pi pi-play"></i>
                          </button>
                          <span class="row-index">{{ i + 1 }}</span>
                        </td>
                        <td>
                          <div class="row-title">{{ track.title }}</div>
                          <div class="row-sub">{{ track.album }}</div>
                        </td>
                        <td class="tabular-nums" style="width: 5rem; text-align: right">
                          {{ formatDuration(track.duration) }}
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                }
              </section>

              @if (latestAlbum(); as latest) {
                <section class="panel">
                  <div class="section-header">
                    <h2>Latest release</h2>
                  </div>
                  <div class="tile-solo">
                    <echo-album-tile
                      [album]="latest"
                      (play)="onPlayAlbum($event)"
                      (open)="onOpenAlbum($event)"
                    />
                  </div>
                </section>
              }
            </p-tabpanel>

            <p-tabpanel value="discography">
              <section class="panel">
                @if (albums().length === 0) {
                  <div class="empty">No albums yet.</div>
                } @else {
                  <div class="tile-grid">
                    @for (album of albums(); track album.key) {
                      <echo-album-tile
                        [album]="album"
                        (play)="onPlayAlbum($event)"
                        (open)="onOpenAlbum($event)"
                      />
                    }
                  </div>
                }
              </section>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </section>
    } @else {
      <section class="artist-page">
        <div class="empty large">
          Artist not found. They may have been removed from the library.
        </div>
      </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .artist-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .artist-page {
          padding: 2rem 2.5rem;
        }
      }
      .artist-hero {
        display: flex;
        gap: 1.5rem;
        align-items: center;
      }
      .avatar {
        flex-shrink: 0;
        width: 128px;
        height: 128px;
        border-radius: 999px;
        background: linear-gradient(
          145deg,
          var(--p-primary-500) 0%,
          var(--p-primary-700) 100%
        );
        display: grid;
        place-items: center;
        color: white;
        font-size: 2.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }
      .hero-meta {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 2.25rem;
        font-weight: 600;
        color: var(--echo-heading);
        line-height: 1.05;
        margin: 0;
      }
      .hero-stats {
        display: flex;
        gap: 0.4rem;
        font-size: 0.875rem;
        color: var(--echo-muted);
      }
      .dot {
        opacity: 0.6;
      }
      .hero-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }
      :host ::ng-deep .artist-tabs {
        display: flex;
        flex-direction: column;
      }
      :host ::ng-deep .artist-tabs .p-tabpanel {
        padding: 1rem 0 0;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 1.5rem;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .section-header h2 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
      }
      .link {
        border: none;
        background: transparent;
        color: var(--echo-muted);
        font-size: 0.8rem;
        cursor: pointer;
      }
      .link:hover {
        color: var(--echo-heading);
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
      .tile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem 1rem;
      }
      .tile-solo {
        max-width: 220px;
      }
      .artist-row {
        cursor: default;
      }
      .artist-row:hover {
        background: var(--echo-hover);
      }
      .row-play {
        display: none;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: none;
        background: var(--echo-hover);
        color: var(--echo-heading);
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .artist-row:hover .row-play {
        display: inline-flex;
      }
      .artist-row:hover .row-index {
        display: none;
      }
      .row-index {
        display: inline-block;
        width: 28px;
        text-align: center;
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .row-title {
        font-size: 0.875rem;
        color: var(--echo-heading);
      }
      .row-sub {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      @media (max-width: 640px) {
        .artist-hero {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .avatar {
          width: 96px;
          height: 96px;
          font-size: 2rem;
        }
        .title {
          font-size: 1.75rem;
        }
      }
    `,
  ],
})
export class Artist {
  private readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  readonly id = input.required<string>();

  protected readonly name = computed(() => decodeURIComponent(this.id()));
  protected readonly artist = computed(() =>
    this.library.getArtist(this.name()),
  );
  protected readonly tracks = computed(() =>
    this.library.tracksByArtist(this.name()),
  );
  protected readonly albums = computed(() =>
    this.library.albumsByArtist(this.name()),
  );
  protected readonly popularTracks = computed(() =>
    [...this.tracks()].sort((a, b) => b.playCount - a.playCount || b.addedAt - a.addedAt),
  );
  protected readonly latestAlbum = computed<AlbumSummary | null>(() => {
    const [first] = this.albums();
    return first ?? null;
  });

  protected readonly activeTab = signal<'overview' | 'discography'>('overview');
  protected readonly showAllPopular = signal(false);
  protected readonly following = signal(false);

  protected readonly visiblePopular = computed(() => {
    const list = this.popularTracks();
    return this.showAllPopular() ? list : list.slice(0, 5);
  });

  protected readonly crumbs = computed<MenuItem[]>(() => [
    { label: 'Library', routerLink: '/library' },
    { label: this.name() },
  ]);

  async onPlayAll(): Promise<void> {
    const tracks = this.tracks();
    if (tracks.length === 0) return;
    await this.player.playTrack(tracks[0], tracks);
  }

  async onShufflePlay(): Promise<void> {
    const tracks = [...this.tracks()];
    if (tracks.length === 0) return;
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    await this.player.playTrack(tracks[0], tracks);
  }

  async onPlayTrack(track: Track): Promise<void> {
    await this.player.playTrack(track, this.popularTracks());
  }

  async onPlayAlbum(album: AlbumSummary): Promise<void> {
    const tracks = this.library.tracksInAlbum(album.key);
    if (tracks.length === 0) return;
    await this.player.playTrack(tracks[0], tracks);
  }

  onOpenAlbum(album: AlbumSummary): void {
    void this.router.navigate(['/album', encodeURIComponent(album.key)]);
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
