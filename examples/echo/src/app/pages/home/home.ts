import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { FileUpload, type FileUploadHandlerEvent } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { PlayerService } from '../../audio/player.service';
import { ImportService } from '../../data/import.service';
import { LibraryService, type AlbumSummary } from '../../data/library.service';
import { pickAudioDirectory, supportsDirectoryPicker } from '../../data/pick-files';
import { AlbumTile } from '../../shared/album-tile/album-tile';
import { ArtistTile } from '../../shared/artist-tile/artist-tile';

@Component({
  selector: 'echo-home',
  imports: [Button, FileUpload, AlbumTile, ArtistTile],
  template: `
    <section class="flex h-full flex-col gap-10 px-6 py-8 md:px-10">
      @if (library.loading()) {
        <div class="grid flex-1 place-items-center text-sm text-[var(--echo-muted)]">
          <div class="flex items-center gap-3">
            <i class="pi pi-spin pi-spinner"></i>
            Loading library
          </div>
        </div>
      } @else if (library.count() === 0) {
        <div class="grid flex-1 place-items-center">
          <div class="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <span
              class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--echo-accent)]"
            >
              Welcome to Echo
            </span>
            <h1
              class="text-3xl font-semibold tracking-tight text-[var(--echo-heading)] md:text-4xl"
            >
              Your library is empty.
            </h1>
            <p class="max-w-lg text-sm leading-relaxed text-[var(--echo-text)]">
              Drop audio files here, or choose a folder on your machine. Echo
              parses tags, decodes waveform peaks, and stores everything
              locally in your browser.
            </p>
            <p-fileUpload
              #uploader
              mode="advanced"
              [auto]="true"
              [multiple]="true"
              accept="audio/*,.flac,.mp3,.wav,.ogg,.m4a,.aac"
              [customUpload]="true"
              [showUploadButton]="false"
              [showCancelButton]="false"
              chooseLabel="Choose files"
              chooseIcon="pi pi-cloud-upload"
              (uploadHandler)="onUploadHandler($event, uploader)"
              styleClass="w-full echo-hero-upload"
            >
              <ng-template pTemplate="content">
                <div class="hero-drop">
                  <i class="pi pi-cloud-upload text-3xl text-[var(--echo-accent)]"></i>
                  <div class="mt-2 text-sm text-[var(--echo-muted)]">
                    Drop files here or use the button above.
                  </div>
                </div>
              </ng-template>
            </p-fileUpload>
            @if (canPickFolder()) {
              <p-button
                label="Choose folder"
                icon="pi pi-folder-open"
                severity="secondary"
                [outlined]="true"
                (onClick)="onPickFolder()"
              />
            }
            <div class="text-xs text-[var(--echo-muted)]">
              Supported: MP3, FLAC, WAV, OGG, M4A, AAC
            </div>
          </div>
        </div>
      } @else {
        <header class="flex items-baseline justify-between">
          <div>
            <span
              class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--echo-accent)]"
            >
              Home
            </span>
            <h1 class="mt-1 text-3xl font-semibold tracking-tight text-[var(--echo-heading)]">
              {{ greeting() }}
            </h1>
          </div>
          <p-button
            label="Import more"
            icon="pi pi-plus"
            severity="secondary"
            [text]="true"
            size="small"
            (onClick)="router.navigate(['/import'])"
          />
        </header>

        @if (recentAlbums().length > 0) {
          <section class="flex flex-col gap-4">
            <div class="flex items-baseline justify-between">
              <h2 class="text-lg font-semibold text-[var(--echo-heading)]">
                Recently added
              </h2>
              <a
                class="text-xs text-[var(--echo-muted)] hover:text-[var(--echo-heading)]"
                href="javascript:void(0)"
                (click)="router.navigate(['/library'])"
              >
                See all
              </a>
            </div>
            <div class="album-grid">
              @for (album of recentAlbums(); track album.key) {
                <echo-album-tile
                  [album]="album"
                  (play)="onPlayAlbum($event)"
                  (open)="onPlayAlbum($event)"
                />
              }
            </div>
          </section>
        }

        @if (topArtists().length > 0) {
          <section class="flex flex-col gap-4">
            <div class="flex items-baseline justify-between">
              <h2 class="text-lg font-semibold text-[var(--echo-heading)]">
                Your artists
              </h2>
              <a
                class="text-xs text-[var(--echo-muted)] hover:text-[var(--echo-heading)]"
                href="javascript:void(0)"
                (click)="router.navigate(['/library'])"
              >
                See all
              </a>
            </div>
            <div class="artist-grid">
              @for (artist of topArtists(); track artist.name) {
                <echo-artist-tile [artist]="artist" />
              }
            </div>
          </section>
        }
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
      .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.25rem 1rem;
      }
      .artist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1.5rem 1rem;
      }
      :host ::ng-deep .echo-hero-upload.p-fileupload {
        background: transparent;
        border: 2px dashed var(--echo-border);
        border-radius: 14px;
        padding: 0.75rem;
      }
      :host ::ng-deep .echo-hero-upload .p-fileupload-header {
        justify-content: center;
        background: transparent;
        border: none;
        padding-bottom: 0;
      }
      :host ::ng-deep .echo-hero-upload .p-fileupload-content {
        background: transparent;
        border: none;
        padding: 1rem 0 0.5rem;
      }
      .hero-drop {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
    `,
  ],
})
export class Home {
  protected readonly library = inject(LibraryService);
  private readonly importer = inject(ImportService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);
  protected readonly router = inject(Router);

  protected readonly canPickFolder = signal(supportsDirectoryPicker());
  protected readonly recentAlbums = computed(() =>
    this.library.recentAlbums().slice(0, 12),
  );
  protected readonly topArtists = computed(() =>
    [...this.library.artists()]
      .sort((a, b) => b.trackIds.length - a.trackIds.length)
      .slice(0, 8),
  );
  protected readonly greeting = computed(() => {
    const count = this.library.count();
    if (count === 1) return 'One track in your library.';
    return `${count} tracks in your library.`;
  });

  async onUploadHandler(event: FileUploadHandlerEvent, uploader: FileUpload): Promise<void> {
    const files = event.files as File[];
    uploader.clear();
    if (!files.length) return;
    await this.dispatch(files);
  }

  async onPickFolder(): Promise<void> {
    try {
      const files = await pickAudioDirectory();
      if (!files || files.length === 0) {
        this.messages.add({
          severity: 'info',
          summary: 'No audio found',
          detail: 'The selected folder had no audio files.',
        });
        return;
      }
      await this.dispatch(files);
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Folder pick failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async onPlayAlbum(album: AlbumSummary): Promise<void> {
    const tracks = album.trackIds
      .map((id) => this.library.getById(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .sort((a, b) => (a.trackNo ?? 0) - (b.trackNo ?? 0));
    if (tracks.length === 0) return;
    try {
      await this.player.playTrack(tracks[0], tracks);
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Playback failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async dispatch(files: File[]): Promise<void> {
    try {
      await this.importer.import(files);
      this.messages.add({
        severity: 'success',
        summary: 'Import complete',
        detail: `${this.importer.counts().done} added.`,
        life: 3500,
      });
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Import failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
}