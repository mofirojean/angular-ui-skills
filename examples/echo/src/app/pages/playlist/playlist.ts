import {
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Drawer } from 'primeng/drawer';
import { IconField } from 'primeng/iconfield';
import { Inplace } from 'primeng/inplace';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { OrderList } from 'primeng/orderlist';
import { SplitButton } from 'primeng/splitbutton';
import { Textarea } from 'primeng/textarea';
import { PlayerService } from '../../audio/player.service';
import { LibraryService } from '../../data/library.service';
import { PlaylistService } from '../../data/playlist.service';
import type { Track } from '../../data/types';

@Component({
  selector: 'echo-playlist',
  imports: [
    FormsModule,
    Breadcrumb,
    Button,
    ConfirmDialog,
    Drawer,
    IconField,
    Inplace,
    InputIcon,
    InputText,
    OrderList,
    SplitButton,
    Textarea,
  ],
  template: `
    @if (playlist(); as data) {
      <section class="playlist-page">
        <p-breadcrumb [model]="crumbs()" />

        <header class="playlist-hero">
          <div class="cover">
            @if (coverUrl(); as url) {
              <img [src]="url" alt="" />
            } @else {
              <div class="cover-fallback">
                <i class="pi pi-heart text-2xl"></i>
              </div>
            }
          </div>
          <div class="meta">
            <span class="eyebrow">Playlist</span>
            <p-inplace
              [active]="editingTitle()"
              (onActivate)="editingTitle.set(true); startEditTitle()"
              (onDeactivate)="editingTitle.set(false)"
            >
              <ng-template pTemplate="display">
                <h1 class="title">{{ data.name }}</h1>
              </ng-template>
              <ng-template pTemplate="content">
                <input
                  pInputText
                  class="title-input"
                  [ngModel]="titleDraft()"
                  (ngModelChange)="titleDraft.set($event)"
                  (blur)="saveTitle()"
                  (keydown.enter)="saveTitle()"
                  (keydown.escape)="cancelTitle()"
                  autofocus
                />
              </ng-template>
            </p-inplace>
            <p-inplace
              [active]="editingDescription()"
              (onActivate)="editingDescription.set(true); startEditDescription()"
              (onDeactivate)="editingDescription.set(false)"
            >
              <ng-template pTemplate="display">
                <p class="description">
                  {{ data.description || 'Add a description.' }}
                </p>
              </ng-template>
              <ng-template pTemplate="content">
                <textarea
                  pTextarea
                  rows="3"
                  class="description-input"
                  [ngModel]="descriptionDraft()"
                  (ngModelChange)="descriptionDraft.set($event)"
                  (blur)="saveDescription()"
                  (keydown.escape)="cancelDescription()"
                ></textarea>
              </ng-template>
            </p-inplace>
            <div class="stats">
              <span>
                {{ tracks().length }}
                {{ tracks().length === 1 ? 'track' : 'tracks' }}
              </span>
              <span class="dot">·</span>
              <span>{{ totalDurationLabel() }}</span>
            </div>
            <div class="actions">
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
              <p-button
                label="Add tracks"
                icon="pi pi-plus"
                severity="secondary"
                [outlined]="true"
                (onClick)="onOpenAddDrawer()"
              />
              <p-splitButton
                label="More"
                icon="pi pi-ellipsis-h"
                severity="secondary"
                [outlined]="true"
                [model]="moreActions()"
                (onClick)="onOpenAddDrawer()"
              />
            </div>
          </div>
        </header>

        @if (tracks().length === 0) {
          <div class="empty">
            <div class="empty-title">Nothing here yet.</div>
            <div class="empty-sub">
              Add tracks from your library to build this playlist.
            </div>
            <p-button
              label="Add tracks"
              icon="pi pi-plus"
              (onClick)="onOpenAddDrawer()"
            />
          </div>
        } @else {
          <p-orderList
            #playlistOrder
            [value]="tracks()"
            (onReorder)="onReorder()"
            [dragdrop]="true"
            [responsive]="true"
            [stripedRows]="true"
            class="playlist-order"
          >
            <ng-template let-track pTemplate="item">
              <div class="track-row">
                <button
                  type="button"
                  class="row-play"
                  (click)="onPlayTrack(track); $event.stopPropagation()"
                  [attr.aria-label]="'Play ' + track.title"
                >
                  <i class="pi pi-play"></i>
                </button>
                <div class="row-main">
                  <div class="row-title">{{ track.title }}</div>
                  <div class="row-sub">
                    {{ track.artist }} · {{ track.album }}
                  </div>
                </div>
                <div class="row-duration tabular-nums">
                  {{ formatDuration(track.duration) }}
                </div>
                <button
                  type="button"
                  class="row-remove"
                  (click)="onRemove(track); $event.stopPropagation()"
                  aria-label="Remove from playlist"
                >
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </ng-template>
          </p-orderList>
        }
      </section>

      <p-drawer
        [(visible)]="addDrawerOpen"
        header="Add tracks"
        position="right"
        [style]="{ width: 'min(420px, 100vw)' }"
      >
        <div class="drawer-search">
          <p-iconfield>
            <p-inputicon class="pi pi-search" />
            <input
              pInputText
              type="text"
              placeholder="Search library"
              [ngModel]="addSearch()"
              (ngModelChange)="addSearch.set($event)"
            />
          </p-iconfield>
        </div>
        <div class="drawer-list">
          @if (candidateTracks().length === 0) {
            <div class="empty">
              @if (library.count() === 0) {
                Your library is empty. Import music first.
              } @else if (unassignedTracks().length === 0) {
                Every track is already in this playlist.
              } @else {
                No tracks match "{{ addSearch() }}".
              }
            </div>
          }
          @for (track of candidateTracks(); track track.id) {
            <div class="candidate">
              <div class="candidate-main">
                <div class="candidate-title">{{ track.title }}</div>
                <div class="candidate-sub">
                  {{ track.artist }} · {{ track.album }}
                </div>
              </div>
              <p-button
                icon="pi pi-plus"
                [rounded]="true"
                severity="secondary"
                [text]="true"
                size="small"
                ariaLabel="Add to playlist"
                (onClick)="onAddTrack(track)"
              />
            </div>
          }
        </div>
      </p-drawer>

      <p-confirmDialog />
    } @else {
      <section class="playlist-page">
        <div class="empty large">
          Playlist not found. It may have been deleted.
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
      .playlist-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .playlist-page {
          padding: 2rem 2.5rem;
        }
      }
      .playlist-hero {
        display: flex;
        gap: 1.5rem;
        align-items: flex-end;
      }
      .cover {
        flex-shrink: 0;
        width: 200px;
        aspect-ratio: 1 / 1;
        border-radius: 12px;
        overflow: hidden;
        background: linear-gradient(
          145deg,
          var(--p-primary-600) 0%,
          var(--p-primary-800) 100%
        );
      }
      .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cover-fallback {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        color: white;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 0;
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 2rem;
        font-weight: 600;
        color: var(--echo-heading);
        line-height: 1.05;
        margin: 0;
        cursor: text;
      }
      .description {
        font-size: 0.9rem;
        color: var(--echo-muted);
        margin: 0;
        cursor: text;
      }
      .title-input {
        font-size: 2rem;
        font-weight: 600;
        min-width: 320px;
      }
      .description-input {
        width: 100%;
        min-width: 360px;
      }
      .stats {
        display: flex;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: var(--echo-muted);
      }
      .dot {
        opacity: 0.6;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .empty {
        border-radius: 12px;
        border: 1px dashed var(--echo-border);
        color: var(--echo-muted);
        font-size: 0.875rem;
        padding: 3rem 2rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;
      }
      .empty-title {
        font-size: 1rem;
        color: var(--echo-heading);
        font-weight: 500;
      }
      .empty-sub {
        color: var(--echo-muted);
      }
      .empty.large {
        min-height: 320px;
        display: grid;
        place-items: center;
      }
      :host ::ng-deep .playlist-order .p-orderlist-controls {
        display: none;
      }
      :host ::ng-deep .playlist-order .p-orderlist-list {
        max-height: none;
        background: transparent;
        border: 1px solid var(--echo-border);
        border-radius: 10px;
      }
      :host ::ng-deep .playlist-order .p-orderlist-item {
        background: transparent;
      }
      :host ::ng-deep .playlist-order .p-orderlist-item:hover {
        background: var(--echo-hover);
      }
      .track-row {
        display: grid;
        grid-template-columns: 2rem 1fr auto 2rem;
        align-items: center;
        gap: 0.75rem;
        padding: 0.35rem 0.25rem;
      }
      .row-play,
      .row-remove {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--echo-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .row-play:hover,
      .row-remove:hover {
        background: var(--echo-hover);
        color: var(--echo-heading);
      }
      .row-title {
        font-size: 0.875rem;
        color: var(--echo-heading);
      }
      .row-sub {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .row-duration {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .drawer-search {
        margin-bottom: 1rem;
      }
      .drawer-search p-iconfield,
      .drawer-search input {
        width: 100%;
      }
      .drawer-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
      }
      .candidate {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 8px;
      }
      .candidate:hover {
        background: var(--echo-hover);
      }
      .candidate-main {
        flex: 1;
        min-width: 0;
      }
      .candidate-title {
        font-size: 0.875rem;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .candidate-sub {
        font-size: 0.75rem;
        color: var(--echo-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (max-width: 640px) {
        .playlist-hero {
          flex-direction: column;
          align-items: flex-start;
        }
        .cover {
          width: 160px;
        }
      }
    `,
  ],
})
export class Playlist {
  protected readonly library = inject(LibraryService);
  private readonly playlists = inject(PlaylistService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  @ViewChild('playlistOrder') playlistOrder?: OrderList;

  protected readonly playlist = computed(() =>
    this.playlists.playlists().find((p) => p.id === this.id()),
  );
  protected readonly tracks = computed(() => {
    const playlist = this.playlist();
    if (!playlist) return [];
    return playlist.trackIds
      .map((id) => this.library.getById(id))
      .filter((t): t is Track => !!t);
  });

  protected readonly coverUrl = signal<string | null>(null);
  protected readonly addDrawerOpen = signal(false);
  protected readonly addSearch = signal('');
  protected readonly editingTitle = signal(false);
  protected readonly editingDescription = signal(false);
  protected readonly titleDraft = signal('');
  protected readonly descriptionDraft = signal('');

  protected readonly unassignedTracks = computed(() => {
    const playlist = this.playlist();
    if (!playlist) return [];
    const inPlaylist = new Set(playlist.trackIds);
    return this.library.tracks().filter((t) => !inPlaylist.has(t.id));
  });

  protected readonly candidateTracks = computed(() => {
    const search = this.addSearch().trim().toLowerCase();
    const pool = this.unassignedTracks();
    if (!search) return pool.slice(0, 100);
    return pool
      .filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.artist.toLowerCase().includes(search) ||
          t.album.toLowerCase().includes(search),
      )
      .slice(0, 100);
  });

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
    { label: this.playlist()?.name ?? 'Playlist' },
  ]);

  protected readonly moreActions = computed<MenuItem[]>(() => [
    {
      label: 'Rename',
      icon: 'pi pi-pencil',
      command: () => {
        const p = this.playlist();
        if (!p) return;
        this.titleDraft.set(p.name);
        this.editingTitle.set(true);
      },
    },
    {
      label: 'Add to queue',
      icon: 'pi pi-plus',
      command: () => this.onAddAllToQueue(),
    },
    { separator: true },
    {
      label: 'Delete playlist',
      icon: 'pi pi-trash',
      command: () => this.onDeletePlaylist(),
    },
  ]);

  constructor() {
    effect((onCleanup) => {
      const playlist = this.playlist();
      const trackId = playlist?.coverTrackId ?? null;
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
    await this.player.playTrack(track, this.tracks());
  }

  onOpenAddDrawer(): void {
    this.addSearch.set('');
    this.addDrawerOpen.set(true);
  }

  async onAddTrack(track: Track): Promise<void> {
    const playlist = this.playlist();
    if (!playlist) return;
    await this.playlists.addTracks(playlist.id, [track.id]);
    this.messages.add({
      severity: 'success',
      summary: 'Added',
      detail: track.title,
      life: 2000,
    });
  }

  async onRemove(track: Track): Promise<void> {
    const playlist = this.playlist();
    if (!playlist) return;
    await this.playlists.removeTrack(playlist.id, track.id);
    this.messages.add({
      severity: 'success',
      summary: 'Removed',
      detail: track.title,
      life: 2000,
    });
  }

  async onReorder(): Promise<void> {
    const playlist = this.playlist();
    if (!playlist) return;
    const next = (this.playlistOrder?.value ?? []) as Track[];
    await this.playlists.reorder(
      playlist.id,
      next.map((t) => t.id),
    );
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

  onDeletePlaylist(): void {
    const playlist = this.playlist();
    if (!playlist) return;
    this.confirm.confirm({
      header: 'Delete playlist?',
      message: `${playlist.name} will be removed. Tracks stay in your library.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      accept: async () => {
        await this.playlists.delete(playlist.id);
        void this.router.navigate(['/library']);
      },
    });
  }

  startEditTitle(): void {
    const p = this.playlist();
    if (p) this.titleDraft.set(p.name);
  }

  startEditDescription(): void {
    const p = this.playlist();
    if (p) this.descriptionDraft.set(p.description);
  }

  saveTitle(): void {
    const playlist = this.playlist();
    if (!playlist) return;
    const value = this.titleDraft().trim();
    if (value && value !== playlist.name) {
      void this.playlists.rename(playlist.id, value);
    }
    this.editingTitle.set(false);
  }

  cancelTitle(): void {
    this.editingTitle.set(false);
  }

  saveDescription(): void {
    const playlist = this.playlist();
    if (!playlist) return;
    const value = this.descriptionDraft().trim();
    if (value !== playlist.description) {
      void this.playlists.rename(playlist.id, playlist.name, value);
    }
    this.editingDescription.set(false);
  }

  cancelDescription(): void {
    this.editingDescription.set(false);
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
