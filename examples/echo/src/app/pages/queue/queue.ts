import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { OrderList } from 'primeng/orderlist';
import { PlayerService } from '../../audio/player.service';
import { PlaylistService } from '../../data/playlist.service';
import type { Track } from '../../data/types';

@Component({
  selector: 'echo-queue',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    ConfirmDialog,
    Dialog,
    InputText,
    OrderList,
  ],
  template: `
    <section class="queue-page">
      <header class="queue-header">
        <div>
          <span class="eyebrow">Queue</span>
          <h1 class="title">
            {{ tracks().length }}
            {{ tracks().length === 1 ? 'track queued' : 'tracks queued' }}
          </h1>
          <div class="stats">{{ totalDurationLabel() }}</div>
        </div>
        <div class="actions">
          <p-button
            label="Save as playlist"
            icon="pi pi-heart"
            severity="secondary"
            [outlined]="true"
            [disabled]="tracks().length === 0"
            (onClick)="onOpenSaveDialog()"
          />
          <p-button
            label="Clear queue"
            icon="pi pi-times"
            severity="danger"
            [text]="true"
            [disabled]="tracks().length === 0"
            (onClick)="onClearQueue()"
          />
        </div>
      </header>

      @if (tracks().length === 0) {
        <div class="empty">
          <div class="empty-title">Your queue is empty.</div>
          <div class="empty-sub">
            Play a track from your library and it will appear here.
          </div>
        </div>
      } @else {
        <p-orderList
          #queueOrder
          [value]="tracks()"
          (onReorder)="onReorder()"
          [dragdrop]="true"
          [responsive]="true"
          class="queue-order"
        >
          <ng-template #item let-track let-i="index">
            <div class="track-row" [class.is-current]="isCurrent(track)">
              <div class="row-index">
                @if (isCurrent(track)) {
                  <i class="pi pi-volume-up text-[var(--echo-accent)]"></i>
                } @else {
                  <button
                    type="button"
                    class="row-play"
                    (click)="onPlayTrack(track); $event.stopPropagation()"
                    [attr.aria-label]="'Play ' + track.title"
                  >
                    <i class="pi pi-play"></i>
                  </button>
                  <span class="row-number">{{ i + 1 }}</span>
                }
              </div>
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
                (click)="onRemoveAt(i); $event.stopPropagation()"
                aria-label="Remove from queue"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </ng-template>
        </p-orderList>
      }
    </section>

    <p-dialog
      header="Save queue as playlist"
      [(visible)]="saveDialogVisible"
      [modal]="true"
      [style]="{ width: 'min(420px, 92vw)' }"
      [dismissableMask]="true"
    >
      <form
        [formGroup]="saveForm"
        (ngSubmit)="onSubmitSave()"
        class="flex flex-col gap-4"
      >
        <label class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-[var(--echo-muted)]">
            Playlist name
          </span>
          <input pInputText formControlName="name" placeholder="Late nights" />
        </label>
        <div class="flex justify-end gap-2 pt-2">
          <p-button
            type="button"
            label="Cancel"
            severity="secondary"
            [text]="true"
            (onClick)="saveDialogVisible.set(false)"
          />
          <p-button
            type="submit"
            label="Save"
            icon="pi pi-check"
            [disabled]="saveForm.invalid"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .queue-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .queue-page {
          padding: 2rem 2.5rem;
        }
      }
      .queue-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
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
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0.25rem 0 0;
      }
      .stats {
        font-size: 0.8rem;
        color: var(--echo-muted);
        margin-top: 0.25rem;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
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
        gap: 0.5rem;
        align-items: center;
      }
      .empty-title {
        font-size: 1rem;
        color: var(--echo-heading);
        font-weight: 500;
      }
      :host ::ng-deep .queue-order .p-orderlist-controls {
        display: none;
      }
      :host ::ng-deep .queue-order .p-orderlist-list {
        max-height: none;
        background: transparent;
        border: 1px solid var(--echo-border);
        border-radius: 10px;
      }
      :host ::ng-deep .queue-order .p-orderlist-item {
        background: transparent;
      }
      :host ::ng-deep .queue-order .p-orderlist-item:hover {
        background: var(--echo-hover);
      }
      .track-row {
        display: grid;
        grid-template-columns: 2rem 1fr auto 2rem;
        align-items: center;
        gap: 0.75rem;
        padding: 0.35rem 0.25rem;
      }
      .track-row.is-current .row-title {
        color: var(--echo-accent);
        font-weight: 500;
      }
      .row-index {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
      }
      .row-number {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .track-row:hover .row-number {
        display: none;
      }
      .row-play {
        display: none;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--echo-heading);
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .track-row:hover .row-play {
        display: inline-flex;
      }
      .row-remove {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--echo-muted);
        cursor: pointer;
      }
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
    `,
  ],
})
export class Queue {
  private readonly player = inject(PlayerService);
  private readonly playlists = inject(PlaylistService);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  @ViewChild('queueOrder') queueOrder?: OrderList;

  protected readonly tracks = this.player.queue;
  protected readonly currentTrack = this.player.currentTrack;
  protected readonly saveDialogVisible = signal(false);

  protected readonly saveForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(64)]],
  });

  protected readonly totalDurationLabel = computed(() => {
    const total = this.tracks().reduce((sum, t) => sum + (t.duration || 0), 0);
    const minutes = Math.round(total / 60);
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} hr ${m} min`;
  });

  isCurrent(track: Track): boolean {
    return this.currentTrack()?.id === track.id;
  }

  async onPlayTrack(track: Track): Promise<void> {
    await this.player.playTrack(track);
  }

  onReorder(): void {
    const next = (this.queueOrder?.value ?? []) as Track[];
    this.player.reorderQueue(next);
  }

  onRemoveAt(index: number): void {
    this.player.removeFromQueueAt(index);
  }

  onClearQueue(): void {
    this.confirm.confirm({
      header: 'Clear queue?',
      message: 'This removes every track from the current queue.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Clear', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', text: true },
      accept: () => {
        this.player.clearQueue();
      },
    });
  }

  onOpenSaveDialog(): void {
    this.saveForm.reset({ name: '' });
    this.saveDialogVisible.set(true);
  }

  async onSubmitSave(): Promise<void> {
    if (this.saveForm.invalid) return;
    const name = this.saveForm.getRawValue().name.trim();
    const tracks = this.tracks();
    const playlist = await this.playlists.create(name);
    await this.playlists.addTracks(
      playlist.id,
      tracks.map((t) => t.id),
    );
    this.saveDialogVisible.set(false);
    this.messages.add({
      severity: 'success',
      summary: 'Playlist saved',
      detail: `${playlist.name} · ${tracks.length} tracks`,
      life: 2500,
    });
  }

  formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
