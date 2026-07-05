import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { PlayerService } from '../../audio/player.service';
import {
  LibraryService,
  type AlbumSummary,
  type ArtistSummary,
} from '../../data/library.service';
import { PlaylistService } from '../../data/playlist.service';
import type { Playlist, Track } from '../../data/types';
import { AlbumTile } from '../../shared/album-tile/album-tile';
import { ArtistTile } from '../../shared/artist-tile/artist-tile';

type TopResult =
  | { kind: 'track'; track: Track }
  | { kind: 'artist'; artist: ArtistSummary }
  | { kind: 'album'; album: AlbumSummary }
  | { kind: 'playlist'; playlist: Playlist };

@Component({
  selector: 'echo-search',
  imports: [
    FormsModule,
    Button,
    IconField,
    InputIcon,
    InputText,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AlbumTile,
    ArtistTile,
  ],
  template: `
    <section class="search-page">
      <header class="search-header">
        <span class="eyebrow">Search</span>
        <p-iconfield class="search-field">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Songs, artists, albums, playlists"
            [ngModel]="query()"
            (ngModelChange)="onQueryChange($event)"
            autofocus
          />
        </p-iconfield>
      </header>

      @if (!hasQuery()) {
        <div class="empty large">
          Type to search across your library.
        </div>
      } @else if (nothingFound()) {
        <div class="empty large">
          No results for "{{ query() }}".
        </div>
      } @else {
        <p-tabs [(value)]="activeTab" class="search-tabs">
          <p-tablist>
            <p-tab value="all">All</p-tab>
            <p-tab value="songs">Songs ({{ songs().length }})</p-tab>
            <p-tab value="artists">Artists ({{ artists().length }})</p-tab>
            <p-tab value="albums">Albums ({{ albums().length }})</p-tab>
            <p-tab value="playlists">
              Playlists ({{ playlists().length }})
            </p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="all">
              @if (topResult(); as top) {
                <section class="panel">
                  <h2 class="panel-title">Top result</h2>
                  <button
                    type="button"
                    class="top-card"
                    (click)="onOpenTop(top)"
                  >
                    <div class="top-icon">
                      <i class="pi" [class]="'pi ' + topIcon(top)"></i>
                    </div>
                    <div class="top-meta">
                      <div class="top-name">{{ topLabel(top) }}</div>
                      <div class="top-kind">{{ topKind(top) }}</div>
                    </div>
                    <p-button
                      icon="pi pi-play"
                      [rounded]="true"
                      ariaLabel="Play top result"
                      (click)="onPlayTop(top); $event.stopPropagation()"
                    />
                  </button>
                </section>
              }
              @if (songs().length > 0) {
                <section class="panel">
                  <h2 class="panel-title">Songs</h2>
                  <div class="song-list">
                    @for (track of songs().slice(0, 5); track track.id) {
                      <button
                        type="button"
                        class="song-row"
                        (click)="onPlaySong(track)"
                      >
                        <span class="song-title">{{ track.title }}</span>
                        <span class="song-artist">{{ track.artist }}</span>
                        <span class="song-duration tabular-nums">
                          {{ formatDuration(track.duration) }}
                        </span>
                      </button>
                    }
                  </div>
                </section>
              }
              @if (artists().length > 0) {
                <section class="panel">
                  <h2 class="panel-title">Artists</h2>
                  <div class="tile-grid tile-grid--artists">
                    @for (artist of artists().slice(0, 6); track artist.name) {
                      <echo-artist-tile
                        [artist]="artist"
                        (open)="onOpenArtist($event)"
                      />
                    }
                  </div>
                </section>
              }
              @if (albums().length > 0) {
                <section class="panel">
                  <h2 class="panel-title">Albums</h2>
                  <div class="tile-grid">
                    @for (album of albums().slice(0, 6); track album.key) {
                      <echo-album-tile
                        [album]="album"
                        (play)="onPlayAlbum($event)"
                        (open)="onOpenAlbum($event)"
                      />
                    }
                  </div>
                </section>
              }
              @if (playlists().length > 0) {
                <section class="panel">
                  <h2 class="panel-title">Playlists</h2>
                  <div class="song-list">
                    @for (playlist of playlists().slice(0, 5); track playlist.id) {
                      <button
                        type="button"
                        class="song-row"
                        (click)="onOpenPlaylist(playlist)"
                      >
                        <span class="song-title">{{ playlist.name }}</span>
                        <span class="song-artist">
                          {{ playlist.trackIds.length }}
                          {{ playlist.trackIds.length === 1 ? 'track' : 'tracks' }}
                        </span>
                        <i class="pi pi-chevron-right text-[var(--echo-muted)]"></i>
                      </button>
                    }
                  </div>
                </section>
              }
            </p-tabpanel>

            <p-tabpanel value="songs">
              @if (songs().length === 0) {
                <div class="empty">No songs match.</div>
              } @else {
                <div class="song-list">
                  @for (track of songs(); track track.id) {
                    <button
                      type="button"
                      class="song-row"
                      (click)="onPlaySong(track)"
                    >
                      <span class="song-title">{{ track.title }}</span>
                      <span class="song-artist">
                        {{ track.artist }} · {{ track.album }}
                      </span>
                      <span class="song-duration tabular-nums">
                        {{ formatDuration(track.duration) }}
                      </span>
                    </button>
                  }
                </div>
              }
            </p-tabpanel>

            <p-tabpanel value="artists">
              @if (artists().length === 0) {
                <div class="empty">No artists match.</div>
              } @else {
                <div class="tile-grid tile-grid--artists">
                  @for (artist of artists(); track artist.name) {
                    <echo-artist-tile
                      [artist]="artist"
                      (open)="onOpenArtist($event)"
                    />
                  }
                </div>
              }
            </p-tabpanel>

            <p-tabpanel value="albums">
              @if (albums().length === 0) {
                <div class="empty">No albums match.</div>
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
            </p-tabpanel>

            <p-tabpanel value="playlists">
              @if (playlists().length === 0) {
                <div class="empty">No playlists match.</div>
              } @else {
                <div class="song-list">
                  @for (playlist of playlists(); track playlist.id) {
                    <button
                      type="button"
                      class="song-row"
                      (click)="onOpenPlaylist(playlist)"
                    >
                      <span class="song-title">{{ playlist.name }}</span>
                      <span class="song-artist">
                        {{ playlist.trackIds.length }}
                        {{ playlist.trackIds.length === 1 ? 'track' : 'tracks' }}
                      </span>
                      <i class="pi pi-chevron-right text-[var(--echo-muted)]"></i>
                    </button>
                  }
                </div>
              }
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
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
      .search-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .search-page {
          padding: 2rem 2.5rem;
        }
      }
      .search-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .search-field {
        max-width: 480px;
      }
      .search-field input {
        width: 100%;
        font-size: 1rem;
      }
      :host ::ng-deep .search-tabs .p-tabpanel {
        padding: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .panel-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
      }
      .top-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        max-width: 480px;
        border: 1px solid var(--echo-border);
        border-radius: 12px;
        background: var(--echo-chrome-bg);
        color: inherit;
        cursor: pointer;
        text-align: left;
        transition: background 120ms ease;
      }
      .top-card:hover {
        background: var(--echo-hover);
      }
      .top-icon {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(
          145deg,
          var(--p-primary-500) 0%,
          var(--p-primary-700) 100%
        );
        color: white;
        font-size: 1.4rem;
      }
      .top-meta {
        flex: 1;
        min-width: 0;
      }
      .top-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .top-kind {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--echo-muted);
        margin-top: 0.15rem;
      }
      .song-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .song-row {
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
      .song-row:hover {
        background: var(--echo-hover);
      }
      .song-title {
        font-size: 0.875rem;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .song-artist {
        font-size: 0.75rem;
        color: var(--echo-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .song-duration {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .tile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem 1rem;
      }
      .tile-grid--artists {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
        min-height: 280px;
        display: grid;
        place-items: center;
      }
    `,
  ],
})
export class Search {
  private readonly library = inject(LibraryService);
  private readonly playlistService = inject(PlaylistService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly q = input<string>('');

  protected readonly query = signal('');
  protected readonly activeTab = signal<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');

  protected readonly hasQuery = computed(() => this.query().trim().length > 0);

  private readonly needle = computed(() => this.query().trim().toLowerCase());

  protected readonly songs = computed(() => {
    const needle = this.needle();
    if (!needle) return [];
    return this.library
      .tracks()
      .filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          t.artist.toLowerCase().includes(needle) ||
          t.album.toLowerCase().includes(needle),
      );
  });

  protected readonly artists = computed(() => {
    const needle = this.needle();
    if (!needle) return [];
    return this.library
      .artists()
      .filter((a) => a.name.toLowerCase().includes(needle));
  });

  protected readonly albums = computed(() => {
    const needle = this.needle();
    if (!needle) return [];
    return this.library
      .albums()
      .filter(
        (a) =>
          a.album.toLowerCase().includes(needle) ||
          a.albumArtist.toLowerCase().includes(needle),
      );
  });

  protected readonly playlists = computed(() => {
    const needle = this.needle();
    if (!needle) return [];
    return this.playlistService
      .playlists()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle),
      );
  });

  protected readonly nothingFound = computed(
    () =>
      this.songs().length === 0 &&
      this.artists().length === 0 &&
      this.albums().length === 0 &&
      this.playlists().length === 0,
  );

  protected readonly topResult = computed<TopResult | null>(() => {
    const needle = this.needle();
    if (!needle) return null;
    const score = (label: string): number => {
      const lower = label.toLowerCase();
      if (lower === needle) return 3;
      if (lower.startsWith(needle)) return 2;
      if (lower.includes(needle)) return 1;
      return 0;
    };
    let best: { result: TopResult; score: number } | null = null;
    const consider = (result: TopResult, s: number) => {
      if (s > 0 && (!best || s > best.score)) best = { result, score: s };
    };
    for (const artist of this.artists()) {
      consider({ kind: 'artist', artist }, score(artist.name) + 0.2);
    }
    for (const album of this.albums()) {
      consider({ kind: 'album', album }, score(album.album) + 0.1);
    }
    for (const track of this.songs()) {
      consider({ kind: 'track', track }, score(track.title) + 0.3);
    }
    for (const playlist of this.playlists()) {
      consider({ kind: 'playlist', playlist }, score(playlist.name));
    }
    return best ? (best as { result: TopResult }).result : null;
  });

  constructor() {
    effect(() => {
      this.query.set(this.q() ?? '');
    });
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    void this.router.navigate([], {
      queryParams: { q: value || null },
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  topLabel(top: TopResult): string {
    switch (top.kind) {
      case 'track':
        return top.track.title;
      case 'artist':
        return top.artist.name;
      case 'album':
        return top.album.album;
      case 'playlist':
        return top.playlist.name;
    }
  }

  topKind(top: TopResult): string {
    switch (top.kind) {
      case 'track':
        return `Song · ${top.track.artist}`;
      case 'artist':
        return 'Artist';
      case 'album':
        return `Album · ${top.album.albumArtist}`;
      case 'playlist':
        return 'Playlist';
    }
  }

  topIcon(top: TopResult): string {
    switch (top.kind) {
      case 'track':
        return 'pi-play-circle';
      case 'artist':
        return 'pi-user';
      case 'album':
        return 'pi-th-large';
      case 'playlist':
        return 'pi-heart';
    }
  }

  onOpenTop(top: TopResult): void {
    switch (top.kind) {
      case 'track':
        void this.onPlaySong(top.track);
        break;
      case 'artist':
        this.onOpenArtist(top.artist);
        break;
      case 'album':
        this.onOpenAlbum(top.album);
        break;
      case 'playlist':
        this.onOpenPlaylist(top.playlist);
        break;
    }
  }

  async onPlayTop(top: TopResult): Promise<void> {
    switch (top.kind) {
      case 'track':
        await this.onPlaySong(top.track);
        break;
      case 'artist': {
        const tracks = this.library.tracksByArtist(top.artist.name);
        if (tracks.length > 0) await this.player.playTrack(tracks[0], tracks);
        break;
      }
      case 'album':
        await this.onPlayAlbum(top.album);
        break;
      case 'playlist': {
        const tracks = top.playlist.trackIds
          .map((id) => this.library.getById(id))
          .filter((t): t is Track => !!t);
        if (tracks.length > 0) await this.player.playTrack(tracks[0], tracks);
        break;
      }
    }
  }

  async onPlaySong(track: Track): Promise<void> {
    try {
      await this.player.playTrack(track, this.songs());
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Playback failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async onPlayAlbum(album: AlbumSummary): Promise<void> {
    const tracks = this.library.tracksInAlbum(album.key);
    if (tracks.length === 0) return;
    await this.player.playTrack(tracks[0], tracks);
  }

  onOpenAlbum(album: AlbumSummary): void {
    void this.router.navigate(['/album', encodeURIComponent(album.key)]);
  }

  onOpenArtist(artist: ArtistSummary): void {
    void this.router.navigate(['/artist', encodeURIComponent(artist.name)]);
  }

  onOpenPlaylist(playlist: Playlist): void {
    void this.router.navigate(['/playlist', playlist.id]);
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
