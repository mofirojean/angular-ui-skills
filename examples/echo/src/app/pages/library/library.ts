import {
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { PlayerService } from '../../audio/player.service';
import { openEchoDb } from '../../data/db';
import { LibraryService, type AlbumSummary, type ArtistSummary } from '../../data/library.service';
import { PlaylistService } from '../../data/playlist.service';
import type { Playlist, Track } from '../../data/types';
import { AlbumTile } from '../../shared/album-tile/album-tile';
import { ArtistTile } from '../../shared/artist-tile/artist-tile';

type SongSort = 'added' | 'title' | 'artist' | 'duration';
type AlbumSort = 'added' | 'title' | 'artist';
type ArtistSort = 'name' | 'count';

@Component({
  selector: 'echo-library',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    ContextMenu,
    Dialog,
    IconField,
    InputIcon,
    InputText,
    Select,
    SelectButton,
    TableModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Textarea,
    AlbumTile,
    ArtistTile,
  ],
  template: `
    <section class="library-page">
      <header class="library-header">
        <div>
          <span class="eyebrow">Library</span>
          <h1 class="title">{{ headerLabel() }}</h1>
        </div>
      </header>

      <p-tabs [(value)]="activeTab" scrollable="true" class="library-tabs">
        <p-tablist>
          <p-tab value="songs">
            <div class="flex justify-center items-center gap-2">
              <i class="pi pi-list"></i>
              <span>Songs</span>
            </div>
          </p-tab>
          <p-tab value="albums">
            <div class="flex justify-center items-center gap-2">
              <i class="pi pi-th-large"></i>
              <span>Albums</span>
            </div>
          </p-tab>
          <p-tab value="artists">
            <div class="flex justify-center items-center gap-2">
              <i class="pi pi-user"></i>
              <span>Artists</span>
            </div>
          </p-tab>
          <p-tab value="playlists">
            <div class="flex justify-center items-center gap-2">
              <i class="pi pi-heart"></i>
              <span>Playlists</span>
            </div>
          </p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="songs">
            <div class="filter-bar">
              <p-iconfield class="filter-search">
                <p-inputicon class="pi pi-search" />
                <input
                  pInputText
                  type="text"
                  placeholder="Search songs, artists, albums"
                  [ngModel]="songSearch()"
                  (ngModelChange)="songSearch.set($event)"
                />
              </p-iconfield>
              <p-select
                class="filter-genre"
                [options]="genreOptions()"
                [ngModel]="songGenre()"
                (ngModelChange)="songGenre.set($event)"
                placeholder="All genres"
                [showClear]="true"
                appendTo="body"
              />
              <p-selectButton
                class="filter-sort"
                [options]="songSortOptions"
                [ngModel]="songSort()"
                (ngModelChange)="songSort.set($event)"
                optionLabel="label"
                optionValue="value"
                [allowEmpty]="false"
              />
            </div>

            @if (filteredSongs().length === 0) {
              <div class="empty">
                @if (library.count() === 0) {
                  Import some music from the Home page to get started.
                } @else {
                  No songs match your filters.
                }
              </div>
            } @else {
              <p-table
                [value]="filteredSongs()"
                [scrollable]="true"
                scrollHeight="flex"
                [virtualScroll]="true"
                [virtualScrollItemSize]="52"
                size="small"
                class="songs-table"
                [rowTrackBy]="trackById"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 3rem"></th>
                    <th>Title</th>
                    <th style="width: 22%">Artist</th>
                    <th style="width: 22%">Album</th>
                    <th style="width: 5rem; text-align: right">Duration</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-track let-i="rowIndex">
                  <tr
                    class="song-row"
                    (dblclick)="onPlaySong(track)"
                    (contextmenu)="onContextTrack($event, track)"
                  >
                    <td>
                      <button
                        type="button"
                        class="row-play"
                        (click)="onPlaySong(track)"
                        [attr.aria-label]="'Play ' + track.title"
                      >
                        <i class="pi pi-play"></i>
                      </button>
                      <span class="row-index">{{ i + 1 }}</span>
                    </td>
                    <td>
                      <div class="row-title">{{ track.title }}</div>
                    </td>
                    <td>
                      <div class="row-secondary">{{ track.artist }}</div>
                    </td>
                    <td>
                      <div class="row-secondary">{{ track.album }}</div>
                    </td>
                    <td class="tabular-nums" style="text-align: right">
                      {{ formatDuration(track.duration) }}
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-tabpanel>

          <p-tabpanel value="albums">
            <div class="tab-header">
              <p-selectButton
                [options]="albumSortOptions"
                [ngModel]="albumSort()"
                (ngModelChange)="albumSort.set($event)"
                optionLabel="label"
                optionValue="value"
                [allowEmpty]="false"
              />
            </div>
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
          </p-tabpanel>

          <p-tabpanel value="artists">
            <div class="tab-header">
              <p-selectButton
                [options]="artistSortOptions"
                [ngModel]="artistSort()"
                (ngModelChange)="artistSort.set($event)"
                optionLabel="label"
                optionValue="value"
                [allowEmpty]="false"
              />
            </div>
            @if (artists().length === 0) {
              <div class="empty">No artists yet.</div>
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

          <p-tabpanel value="playlists">
            <div class="tile-grid">
              <button
                type="button"
                class="create-tile"
                (click)="onOpenCreatePlaylist()"
              >
                <div class="create-cover">
                  <i class="pi pi-plus text-2xl"></i>
                </div>
                <div class="create-meta">
                  <div class="create-title">Create playlist</div>
                  <div class="create-sub">Give it a name and start adding tracks.</div>
                </div>
              </button>
              @for (playlist of playlists(); track playlist.id) {
                <button
                  type="button"
                  class="playlist-tile"
                  (click)="onOpenPlaylist(playlist)"
                >
                  <div class="playlist-cover">
                    <i class="pi pi-heart text-xl"></i>
                  </div>
                  <div class="playlist-meta">
                    <div class="playlist-title">{{ playlist.name }}</div>
                    <div class="playlist-sub">
                      {{ playlist.trackIds.length }}
                      {{ playlist.trackIds.length === 1 ? 'track' : 'tracks' }}
                    </div>
                  </div>
                </button>
              }
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </section>

    <p-contextMenu #ctxMenu [model]="contextMenuItems()" appendTo="body" />

    <p-dialog
      header="New playlist"
      [(visible)]="createDialogVisible"
      [modal]="true"
      [style]="{ width: 'min(480px, 92vw)' }"
      [closable]="true"
      [dismissableMask]="true"
    >
      <form
        [formGroup]="createForm"
        (ngSubmit)="onSubmitCreatePlaylist()"
        class="flex flex-col gap-4"
      >
        <label class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-[var(--echo-muted)]">Name</span>
          <input pInputText formControlName="name" placeholder="Late nights" />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-[var(--echo-muted)]">
            Description
          </span>
          <textarea
            pTextarea
            formControlName="description"
            rows="3"
            placeholder="Optional"
          ></textarea>
        </label>
        <div class="flex justify-end gap-2 pt-2">
          <p-button
            type="button"
            label="Cancel"
            severity="secondary"
            [text]="true"
            (onClick)="createDialogVisible.set(false)"
          />
          <p-button
            type="submit"
            label="Create"
            icon="pi pi-check"
            [disabled]="createForm.invalid"
          />
        </div>
      </form>
    </p-dialog>

  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow: hidden;
      }
      .library-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        padding: 1.5rem 1.5rem 0;
      }
      @media (min-width: 768px) {
        .library-page {
          padding: 2rem 2.5rem 0;
        }
      }
      .library-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .eyebrow {
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 1.875rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--echo-heading);
        margin-top: 0.25rem;
      }
      :host ::ng-deep .library-tabs {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      :host ::ng-deep .library-tabs .p-tabs {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      :host ::ng-deep .library-tabs .p-tabpanels {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding-inline: 0;
        padding: 0;
      }
      :host ::ng-deep .library-tabs .p-tabpanel {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 1rem 1rem 0;
        gap: 1rem;
      }
      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        padding: 0 0.3rem;
        align-items: center;
      }
      .filter-search {
        flex: 1 1 220px;
        min-width: 180px;
      }
      .filter-search input {
        width: 100%;
      }
      .filter-genre {
        min-width: 160px;
      }
      .tab-header {
        display: flex;
        justify-content: flex-end;
      }
      .empty {
        display: grid;
        place-items: center;
        min-height: 240px;
        border-radius: 12px;
        border: 1px dashed var(--echo-border);
        color: var(--echo-muted);
        font-size: 0.875rem;
      }
      .song-row {
        cursor: default;
      }
      .song-row:hover {
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
      .song-row:hover .row-play {
        display: inline-flex;
      }
      .song-row:hover .row-index {
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .row-secondary {
        font-size: 0.8125rem;
        color: var(--echo-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      :host ::ng-deep .songs-table .p-datatable-thead > tr > th {
        background: transparent;
        color: var(--echo-muted);
        border-bottom: 1px solid var(--echo-border);
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      :host ::ng-deep .songs-table .p-datatable-tbody > tr > td {
        border-bottom: 1px solid var(--echo-border);
      }
      .tile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem 1rem;
        padding-bottom: 1rem;
        overflow-y: auto;
      }
      .tile-grid--artists {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
      .create-tile {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        text-align: left;
      }
      .create-cover {
        aspect-ratio: 1 / 1;
        border-radius: 10px;
        border: 2px dashed var(--echo-border);
        background: transparent;
        display: grid;
        place-items: center;
        color: var(--echo-accent);
        transition: border-color 120ms ease, color 120ms ease;
      }
      .create-tile:hover .create-cover {
        border-color: var(--echo-accent);
      }
      .create-meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .create-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--echo-heading);
      }
      .create-sub {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .playlist-tile {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        text-align: left;
      }
      .playlist-cover {
        aspect-ratio: 1 / 1;
        border-radius: 10px;
        background: linear-gradient(
          145deg,
          var(--p-primary-600) 0%,
          var(--p-primary-800) 100%
        );
        display: grid;
        place-items: center;
        color: white;
      }
      .playlist-meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .playlist-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .playlist-sub {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
    `,
  ],
})
export class Library {
  protected readonly library = inject(LibraryService);
  protected readonly playlistService = inject(PlaylistService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  @ViewChild('ctxMenu') ctxMenu?: ContextMenu;

  protected readonly activeTab = signal<'songs' | 'albums' | 'artists' | 'playlists'>('songs');
  protected readonly songSearch = signal('');
  protected readonly songGenre = signal<string | null>(null);
  protected readonly songSort = signal<SongSort>('added');
  protected readonly albumSort = signal<AlbumSort>('added');
  protected readonly artistSort = signal<ArtistSort>('count');
  protected readonly createDialogVisible = signal(false);

  protected readonly songSortOptions = [
    { label: 'Recent', value: 'added' as SongSort },
    { label: 'Title', value: 'title' as SongSort },
    { label: 'Artist', value: 'artist' as SongSort },
    { label: 'Duration', value: 'duration' as SongSort },
  ];
  protected readonly albumSortOptions = [
    { label: 'Recent', value: 'added' as AlbumSort },
    { label: 'Title', value: 'title' as AlbumSort },
    { label: 'Artist', value: 'artist' as AlbumSort },
  ];
  protected readonly artistSortOptions = [
    { label: 'Most tracks', value: 'count' as ArtistSort },
    { label: 'A to Z', value: 'name' as ArtistSort },
  ];

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
    description: ['', [Validators.maxLength(240)]],
  });

  protected readonly headerLabel = computed(() => {
    const count = this.library.count();
    return count === 1 ? '1 track' : `${count} tracks`;
  });

  protected readonly genreOptions = computed(() => {
    const set = new Set<string>();
    for (const t of this.library.tracks()) {
      for (const g of t.genre) set.add(g);
    }
    return [...set].sort().map((g) => ({ label: g, value: g }));
  });

  protected readonly filteredSongs = computed(() => {
    const search = this.songSearch().trim().toLowerCase();
    const genre = this.songGenre();
    const sort = this.songSort();
    const list = this.library.tracks().filter((t) => {
      if (genre && !t.genre.includes(genre)) return false;
      if (!search) return true;
      return (
        t.title.toLowerCase().includes(search) ||
        t.artist.toLowerCase().includes(search) ||
        t.album.toLowerCase().includes(search)
      );
    });
    switch (sort) {
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return list.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'duration':
        return list.sort((a, b) => b.duration - a.duration);
      default:
        return list.sort((a, b) => b.addedAt - a.addedAt);
    }
  });

  protected readonly albums = computed(() => {
    const list = [...this.library.albums()];
    switch (this.albumSort()) {
      case 'title':
        return list.sort((a, b) => a.album.localeCompare(b.album));
      case 'artist':
        return list.sort((a, b) => a.albumArtist.localeCompare(b.albumArtist));
      default:
        return this.library.recentAlbums();
    }
  });

  protected readonly artists = computed(() => {
    const list = [...this.library.artists()];
    switch (this.artistSort()) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => b.trackIds.length - a.trackIds.length);
    }
  });

  protected readonly playlists = this.playlistService.playlists;

  private readonly contextTrack = signal<Track | null>(null);
  protected readonly contextMenuItems = computed<MenuItem[]>(() => {
    const track = this.contextTrack();
    const playlists = this.playlistService.playlists();
    const items: MenuItem[] = [
      {
        label: 'Play',
        icon: 'pi pi-play',
        disabled: !track,
        command: () => track && this.onPlaySong(track),
      },
      {
        label: 'Add to queue',
        icon: 'pi pi-plus',
        disabled: !track,
        command: () => track && this.onAddToQueue(track),
      },
      {
        label: 'Add to playlist',
        icon: 'pi pi-heart',
        disabled: !track || playlists.length === 0,
        items: playlists.map<MenuItem>((p) => ({
          label: p.name,
          icon: 'pi pi-list',
          command: () => track && this.onAddToPlaylist(track, p),
        })),
      },
      { separator: true },
      {
        label: 'Remove from library',
        icon: 'pi pi-trash',
        disabled: !track,
        command: () => track && this.onRemoveFromLibrary(track),
      },
    ];
    return items;
  });

  onContextTrack(event: MouseEvent, track: Track): void {
    this.contextTrack.set(track);
    this.ctxMenu?.show(event);
    event.preventDefault();
  }

  async onPlaySong(track: Track): Promise<void> {
    try {
      await this.player.playTrack(track, this.filteredSongs());
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Playback failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  onAddToQueue(track: Track): void {
    this.player.enqueue([track]);
    this.messages.add({
      severity: 'success',
      summary: 'Added to queue',
      detail: track.title,
      life: 2500,
    });
  }

  async onAddToPlaylist(track: Track, playlist: Playlist): Promise<void> {
    await this.playlistService.addTracks(playlist.id, [track.id]);
    this.messages.add({
      severity: 'success',
      summary: `Added to ${playlist.name}`,
      detail: track.title,
      life: 2500,
    });
  }

  onRemoveFromLibrary(track: Track): void {
    this.confirm.confirm({
      header: 'Remove from library?',
      message: `${track.title} will be removed. Its file blob and cover will also be deleted.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Remove', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      accept: async () => {
        await this.removeTrack(track);
        this.messages.add({
          severity: 'success',
          summary: 'Removed',
          detail: track.title,
          life: 2500,
        });
      },
    });
  }

  onOpenAlbum(album: AlbumSummary): void {
    void this.router.navigate(['/album', encodeURIComponent(album.key)]);
  }

  onOpenArtist(artist: ArtistSummary): void {
    void this.router.navigate(['/artist', encodeURIComponent(artist.name)]);
  }

  async onPlayAlbum(album: AlbumSummary): Promise<void> {
    const tracks = album.trackIds
      .map((id) => this.library.getById(id))
      .filter((t): t is Track => !!t)
      .sort((a, b) => (a.trackNo ?? 0) - (b.trackNo ?? 0));
    if (tracks.length === 0) return;
    await this.player.playTrack(tracks[0], tracks);
  }

  onOpenCreatePlaylist(): void {
    this.createForm.reset({ name: '', description: '' });
    this.createDialogVisible.set(true);
  }

  async onSubmitCreatePlaylist(): Promise<void> {
    if (this.createForm.invalid) return;
    const { name, description } = this.createForm.getRawValue();
    const playlist = await this.playlistService.create(name, description);
    this.createDialogVisible.set(false);
    this.messages.add({
      severity: 'success',
      summary: 'Playlist created',
      detail: playlist.name,
      life: 2500,
    });
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

  trackById = (_index: number, track: Track): string => track.id;

  private async removeTrack(track: Track): Promise<void> {
    const db = await openEchoDb();
    const tx = db.transaction(['tracks', 'blobs', 'covers'], 'readwrite');
    await Promise.all([
      tx.objectStore('tracks').delete(track.id),
      tx.objectStore('blobs').delete(track.id),
      tx.objectStore('covers').delete(track.id),
      tx.done,
    ]);
    await this.library.refresh();
  }
}
