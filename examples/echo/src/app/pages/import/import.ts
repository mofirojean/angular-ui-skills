import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { FileUpload, type FileUploadHandlerEvent } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { PlayerService } from '../../audio/player.service';
import { ImportService } from '../../data/import.service';
import { LibraryService } from '../../data/library.service';
import {
  pickAudioDirectory,
  supportsDirectoryPicker,
} from '../../data/pick-files';
import type { ImportEntry, ImportStatus } from '../../data/types';

@Component({
  selector: 'echo-import',
  imports: [Button, ProgressBar, Tag, TableModule, FileUpload],
  template: `
    <section class="flex h-full flex-col gap-6 px-6 py-8 md:px-10">
      <header class="flex flex-col gap-2">
        <span
          class="text-xs font-medium uppercase tracking-[0.24em] text-[var(--echo-accent)]"
        >
          Import
        </span>
        <h1
          class="text-3xl font-semibold tracking-tight text-[var(--echo-heading)]"
        >
          Add music to your library
        </h1>
        <p class="max-w-2xl text-sm text-[var(--echo-text)]">
          Drop MP3, FLAC, WAV, OGG, M4A, or AAC files here. Echo parses tags,
          decodes PCM to compute waveform peaks, and stores everything locally
          in IndexedDB. Concurrency is capped at three.
        </p>
      </header>

      <div class="flex flex-col gap-3">
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
          class="echo-import-upload"
        >
          <ng-template pTemplate="content">
            <div class="drop-inner">
              <i class="pi pi-cloud-upload text-3xl text-[var(--echo-accent)]"></i>
              <div class="mt-2 text-sm text-[var(--echo-muted)]">
                Or drag files into this area.
              </div>
            </div>
          </ng-template>
        </p-fileUpload>
        @if (canPickFolder) {
          <div>
            <p-button
              label="Choose folder"
              icon="pi pi-folder-open"
              severity="secondary"
              [outlined]="true"
              size="small"
              (onClick)="onPickFolder()"
            />
          </div>
        }
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="pill">
          Total <strong>{{ counts().total }}</strong>
        </span>
        <span class="pill pill--ok">
          Done <strong>{{ counts().done }}</strong>
        </span>
        <span class="pill pill--warn">
          In flight <strong>{{ counts().inFlight }}</strong>
        </span>
        <span class="pill pill--err">
          Failed <strong>{{ counts().failed }}</strong>
        </span>
        <div class="ml-auto flex flex-wrap gap-2">
          <p-button
            label="Play imported"
            icon="pi pi-play"
            severity="primary"
            size="small"
            [disabled]="!canPlay()"
            (onClick)="onPlayImported()"
          />
          <p-button
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            [text]="true"
            size="small"
            [disabled]="!running()"
            (onClick)="onCancel()"
          />
          <p-button
            label="Clear finished"
            icon="pi pi-eraser"
            severity="secondary"
            [text]="true"
            size="small"
            [disabled]="counts().total === 0"
            (onClick)="onClearFinished()"
          />
        </div>
      </div>

      @if (entries().length > 0) {
        <p-table
          [value]="entries()"
          [scrollable]="true"
          scrollHeight="flex"
          size="small"
          class="import-table"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 28%">File</th>
              <th style="width: 25%">Detected</th>
              <th style="width: 10%">Size</th>
              <th style="width: 22%">Progress</th>
              <th style="width: 10%">Status</th>
              <th style="width: 5%" class="text-right">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-entry>
            <tr>
              <td>
                <div class="truncate text-sm text-[var(--echo-heading)]">
                  {{ entry.fileName }}
                </div>
                @if (entry.error) {
                  <div class="mt-1 truncate text-xs text-red-400">
                    {{ entry.error }}
                  </div>
                }
              </td>
              <td>
                @if (entry.title || entry.artist) {
                  <div class="truncate text-sm text-[var(--echo-text)]">
                    {{ entry.title || '—' }}
                  </div>
                  <div class="truncate text-xs text-[var(--echo-muted)]">
                    {{ entry.artist }} · {{ entry.album }}
                  </div>
                } @else {
                  <span class="text-xs text-[var(--echo-muted)]">Pending</span>
                }
              </td>
              <td>
                <span class="text-xs tabular-nums text-[var(--echo-muted)]">
                  {{ formatSize(entry.fileSize) }}
                </span>
              </td>
              <td>
                <p-progressBar
                  [value]="progressPercent(entry)"
                  [showValue]="false"
                  class="import-progress"
                />
              </td>
              <td>
                <p-tag
                  [value]="entry.status"
                  [severity]="statusSeverity(entry.status)"
                />
              </td>
              <td class="text-right">
                <p-button
                  icon="pi pi-times"
                  [rounded]="true"
                  severity="secondary"
                  [text]="true"
                  size="small"
                  ariaLabel="Remove"
                  [disabled]="isEntryInFlight(entry.status)"
                  (onClick)="onRemove(entry.id)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <div
          class="grid h-40 place-items-center rounded-md border border-dashed border-[var(--echo-border)] text-sm text-[var(--echo-muted)]"
        >
          No imports yet. Drop a file above to try the pipeline.
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
      :host ::ng-deep .echo-import-upload.p-fileupload {
        background: transparent;
        border: 2px dashed var(--echo-border);
        border-radius: 12px;
        padding: 0.75rem;
      }
      :host ::ng-deep .echo-import-upload .p-fileupload-header {
        background: transparent;
        border: none;
        padding-bottom: 0;
      }
      :host ::ng-deep .echo-import-upload .p-fileupload-content {
        background: transparent;
        border: none;
        padding: 0.75rem 0;
      }
      .drop-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        border: 1px solid var(--echo-border);
        background: var(--echo-chrome-bg);
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .pill strong {
        color: var(--echo-heading);
        font-weight: 600;
      }
      .pill--ok {
        border-color: rgba(34, 197, 94, 0.4);
      }
      .pill--warn {
        border-color: rgba(234, 179, 8, 0.4);
      }
      .pill--err {
        border-color: rgba(239, 68, 68, 0.4);
      }
      :host ::ng-deep .import-progress .p-progressbar {
        height: 6px;
      }
    `,
  ],
})
export class Import {
  private readonly importer = inject(ImportService);
  private readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);

  protected readonly entries = this.importer.entries;
  protected readonly counts = this.importer.counts;
  protected readonly running = this.importer.running;
  protected readonly canPickFolder = supportsDirectoryPicker();
  protected readonly canPlay = computed(
    () => !this.running() && this.doneTrackIds().length > 0,
  );

  private readonly doneTrackIds = computed(() =>
    this.entries()
      .filter((e) => e.status === 'done' && e.trackId)
      .map((e) => e.trackId!)
      .reverse(),
  );

  async onUploadHandler(
    event: FileUploadHandlerEvent,
    uploader: FileUpload,
  ): Promise<void> {
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

  onCancel(): void {
    this.importer.cancel();
  }

  onClearFinished(): void {
    this.importer.clearFinished();
  }

  onRemove(id: string): void {
    this.importer.remove(id);
  }

  async onPlayImported(): Promise<void> {
    await this.library.refresh();
    const ids = this.doneTrackIds();
    const tracks = ids
      .map((id) => this.library.getById(id))
      .filter((t): t is NonNullable<typeof t> => !!t);
    if (tracks.length === 0) {
      this.messages.add({
        severity: 'warn',
        summary: 'Nothing to play',
        detail: 'Import at least one track first.',
      });
      return;
    }
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

  progressPercent(entry: ImportEntry): number {
    return Math.round(entry.progress * 100);
  }

  statusSeverity(
    status: ImportStatus,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'done':
        return 'success';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'warn';
      case 'queued':
        return 'secondary';
      default:
        return 'info';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  isEntryInFlight(status: ImportStatus): boolean {
    return (
      status === 'parsing' || status === 'decoding' || status === 'storing'
    );
  }

  private async dispatch(files: File[]): Promise<void> {
    try {
      await this.importer.import(files);
      this.messages.add({
        severity: 'success',
        summary: 'Import finished',
        detail: `${this.counts().done} added, ${this.counts().failed} failed.`,
        life: 4000,
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
