import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { Splitter } from 'primeng/splitter';
import { SplitButton } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { PlayerService } from '../../audio/player.service';
import { LibraryService } from '../../data/library.service';
import { PlaylistService } from '../../data/playlist.service';
import type { Playlist, Track } from '../../data/types';

@Component({
  selector: 'echo-album',
  imports: [
    Breadcrumb,
    Button,
    ContextMenu,
    Splitter,
    SplitButton,
    TableModule,
    Tag,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (album(); as data) {
      <section class="album-page">
        <p-breadcrumb [model]="crumbs()" />
        <p-splitter
          [panelSizes]="[38, 62]"
          [minSizes]="[25, 40]"
          class="album-splitter"
        >
          <ng-template pTemplate>
            <div class="album-cover-panel">
              @if (coverUrl(); as url) {
                <img [src]="url" alt="" class="cover" />
              } @else {
                <div class="cover cover-fallback">
                  <i class="pi pi-image text-3xl"></i>
                </div>
              }
              <div class="meta">
                <span class="eyebrow">Album</span>
                <h1 class="title">{{ data.album }}</h1>
                <a
                  class="artist-link"
                  href="javascript:void(0)"
                  (click)="onGoArtist(data.albumArtist)"
                >
                  {{ data.albumArtist }}
                </a>
                <div class="chips">
                  @if (data.year) {
                    <p-tag severity="secondary" [value]="'' + data.year" />
                  }
                  <p-tag
                    severity="secondary"
                    [value]="tracks().length + ' tracks'"
                  />
                  <p-tag
                    severity="secondary"
                    [value]="totalDurationLabel()"
                  />
                </div>
                <div class="actions">
                  <p-button
                    label="Play"
                    icon="pi pi-play"
                    (onClick)="onPlay()"
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
                  <p-splitButton
                    label="Add to queue"
                    icon="pi pi-plus"
                    severity="secondary"
                    [outlined]="true"
                    [model]="moreActions()"
                    (onClick)="onAddAllToQueue()"
                  />
                </div>
              </div>
            </div>
          </ng-template>
          <ng-template pTemplate>
            <div class="album-tracks-panel">
              @if (tracks().length === 0) {
                <div class="empty">This album has no tracks.</div>
              } @else {
                <p-table
                  [value]="tracks()"
                  size="small"
                  class="album-table"
                >
                  <ng-template pTemplate="header">
                    <tr>
                      <th style="width: 3rem">#</th>
                      <th>Title</th>
                      <th style="width: 5rem; text-align: right">Duration</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-track let-i="rowIndex">
                    <tr
                      class="album-row"
                      (dblclick)="onPlayTrack(track)"
                      (contextmenu)="onContext($event, track)"
                    >
                      <td>
                        <button
                          type="button"
                          class="row-play"
                          (click)="onPlayTrack(track)"
                          [attr.aria-label]="'Play ' + track.title"
                        >
                          <i class="pi pi-play"></i>
                        </button>
                        <span class="row-index">{{ track.trackNo ?? i + 1 }}</span>
                      </td>
                      <td>
                        <div class="row-title">{{ track.title }}</div>
                        <div class="row-sub">{{ track.artist }}</div>
                      </td>
                      <td class="tabular-nums" style="text-align: right">
                        {{ formatDuration(track.duration) }}
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              }
            </div>
          </ng-template>
        </p-splitter>
      </section>

      <p-contextMenu #ctxMenu [model]="contextMenu()" appendTo="body" />
    } @else {
      <section class="album-page">
        <div class="empty large">
          Album not found. It may have been removed from the library.
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
      .album-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .album-page {
          padding: 2rem 2.5rem;
        }
      }
      :host ::ng-deep .album-splitter {
        border: none;
        background: transparent;
        min-height: 60vh;
      }
      :host ::ng-deep .album-splitter .p-splitter-panel {
        display: flex;
      }
      .album-cover-panel {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding-right: 1.5rem;
        width: 100%;
      }
      .cover {
        aspect-ratio: 1 / 1;
        width: 100%;
        max-width: 320px;
        border-radius: 12px;
        object-fit: cover;
      }
      .cover-fallback {
        background: var(--echo-tile);
        display: grid;
        place-items: center;
        color: var(--echo-muted);
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 1.75rem;
        line-height: 1.15;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
      }
      .artist-link {
        font-size: 0.95rem;
        color: var(--echo-text);
        text-decoration: none;
      }
      .artist-link:hover {
        color: var(--echo-heading);
        text-decoration: underline;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.25rem;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }
      .album-tracks-panel {
        width: 100%;
        padding-left: 1.5rem;
      }
      .album-row {
        cursor: default;
      }
      .album-row:hover {
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
      .album-row:hover .row-play {
        display: inline-flex;
      }
      .album-row:hover .row-index {
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
      @media (max-width: 900px) {
        :host ::ng-deep .album-splitter .p-splitter {
          flex-direction: column;
        }
        .album-cover-panel {
          padding-right: 0;
          padding-bottom: 1rem;
        }
        .album-tracks-panel {
          padding-left: 0;
          padding-top: 1rem;
        }
      }
    `,
  ],
})
export class Album {
  private readonly library = inject(LibraryService);
  private readonly playlists = inject(PlaylistService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  @ViewChild('ctxMenu') ctxMenu?: ContextMenu;

  readonly id = input.required<string>();

  protected readonly key = computed(() => decodeURIComponent(this.id()));
  protected readonly album = computed(() => this.library.getAlbum(this.key()));
  protected readonly tracks = computed(() => this.library.tracksInAlbum(this.key()));
  protected readonly coverUrl = signal<string | null>(null);
  private readonly contextTrack = signal<Track | null>(null);

  protected readonly totalDurationLabel = computed(() => {
    const total = this.tracks().reduce((sum, t) => sum + (t.duration || 0), 0);
    const minutes = Math.round(total / 60);
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hr ${m} min`;
  });

  protected readonly crumbs = computed<MenuItem[]>(() => [
    { label: 'Library', routerLink: '/library' },
    { label: this.album()?.album ?? 'Album' },
  ]);

  protected readonly moreActions = computed<MenuItem[]>(() => {
    const targets = this.playlists.playlists();
    const items: MenuItem[] = [
      {
        label: 'Play next',
        icon: 'pi pi-play',
        command: () => this.onPlay(),
      },
      {
        label: 'Add to playlist',
        icon: 'pi pi-heart',
        disabled: targets.length === 0,
        items: targets.map<MenuItem>((p) => ({
          label: p.name,
          icon: 'pi pi-list',
          command: () => this.onAddAllToPlaylist(p),
        })),
      },
      { separator: true },
      {
        label: 'Go to artist',
        icon: 'pi pi-user',
        command: () => {
          const a = this.album();
          if (a) this.onGoArtist(a.albumArtist);
        },
      },
    ];
    return items;
  });

  protected readonly contextMenu = computed<MenuItem[]>(() => {
    const track = this.contextTrack();
    const targets = this.playlists.playlists();
    return [
      {
        label: 'Play',
        icon: 'pi pi-play',
        disabled: !track,
        command: () => track && this.onPlayTrack(track),
      },
      {
        label: 'Add to queue',
        icon: 'pi pi-plus',
        disabled: !track,
        command: () => track && this.onAddTrackToQueue(track),
      },
      {
        label: 'Add to playlist',
        icon: 'pi pi-heart',
        disabled: !track || targets.length === 0,
        items: targets.map<MenuItem>((p) => ({
          label: p.name,
          icon: 'pi pi-list',
          command: () => track && this.onAddTrackToPlaylist(track, p),
        })),
      },
    ];
  });

  constructor() {
    effect((onCleanup) => {
      const album = this.album();
      const trackId = album?.coverTrackId ?? null;
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

  async onPlay(): Promise<void> {
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
    await this.player.playTrack(track, this.tracks());
  }

  onAddAllToQueue(): void {
    const tracks = this.tracks();
    if (tracks.length === 0) return;
    this.player.enqueue(tracks);
    this.messages.add({
      severity: 'success',
      summary: 'Added to queue',
      detail: `${tracks.length} tracks`,
      life: 2500,
    });
  }

  onAddTrackToQueue(track: Track): void {
    this.player.enqueue([track]);
    this.messages.add({
      severity: 'success',
      summary: 'Added to queue',
      detail: track.title,
      life: 2500,
    });
  }

  async onAddAllToPlaylist(playlist: Playlist): Promise<void> {
    const tracks = this.tracks();
    if (tracks.length === 0) return;
    await this.playlists.addTracks(
      playlist.id,
      tracks.map((t) => t.id),
    );
    this.messages.add({
      severity: 'success',
      summary: `Added to ${playlist.name}`,
      detail: `${tracks.length} tracks`,
      life: 2500,
    });
  }

  async onAddTrackToPlaylist(track: Track, playlist: Playlist): Promise<void> {
    await this.playlists.addTracks(playlist.id, [track.id]);
    this.messages.add({
      severity: 'success',
      summary: `Added to ${playlist.name}`,
      detail: track.title,
      life: 2500,
    });
  }

  onContext(event: MouseEvent, track: Track): void {
    this.contextTrack.set(track);
    this.ctxMenu?.show(event);
    event.preventDefault();
  }

  onGoArtist(name: string): void {
    void this.router.navigate(['/artist', encodeURIComponent(name)]);
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
