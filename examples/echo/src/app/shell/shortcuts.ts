import { Component, HostListener, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { PlayerService } from '../audio/player.service';
import { LibraryService } from '../data/library.service';

interface Binding {
  keys: string[];
  action: string;
}

const BINDINGS: Binding[] = [
  { keys: ['Space'], action: 'Play or pause' },
  { keys: ['→'], action: 'Next track' },
  { keys: ['←'], action: 'Previous track / restart' },
  { keys: ['↑', '↓'], action: 'Volume up / down' },
  { keys: ['L'], action: 'Like the current track' },
  { keys: ['Ctrl', 'K'], action: 'Command palette' },
  { keys: ['?'], action: 'This cheat sheet' },
];

@Component({
  selector: 'echo-shortcuts',
  imports: [Dialog],
  template: `
    <p-dialog
      header="Keyboard shortcuts"
      [(visible)]="cheatSheetOpen"
      [modal]="true"
      [dismissableMask]="true"
      [style]="{ width: 'min(400px, 92vw)' }"
    >
      <ul class="binding-list">
        @for (binding of bindings; track binding.action) {
          <li class="binding">
            <span class="binding-keys">
              @for (key of binding.keys; track key) {
                <kbd>{{ key }}</kbd>
              }
            </span>
            <span class="binding-action">{{ binding.action }}</span>
          </li>
        }
      </ul>
    </p-dialog>
  `,
  styles: [
    `
      .binding-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .binding {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .binding-keys {
        display: flex;
        gap: 0.25rem;
        min-width: 96px;
      }
      kbd {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        border: 1px solid var(--echo-border);
        border-radius: 5px;
        background: var(--echo-hover);
        color: var(--echo-heading);
        font-size: 0.75rem;
        font-family: inherit;
      }
      .binding-action {
        font-size: 0.875rem;
        color: var(--echo-text);
      }
    `,
  ],
})
export class Shortcuts {
  private readonly player = inject(PlayerService);
  private readonly library = inject(LibraryService);
  private readonly messages = inject(MessageService);

  protected readonly cheatSheetOpen = signal(false);
  protected readonly bindings = BINDINGS;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'input, textarea, select, [contenteditable], .p-slider, button',
      )
    ) {
      return;
    }

    switch (event.key) {
      case ' ':
        event.preventDefault();
        void this.player.togglePlay();
        break;
      case 'ArrowRight':
        event.preventDefault();
        void this.player.next();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        void this.player.previous();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.player.setVolume(this.player.volume() + 0.05);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.player.setVolume(this.player.volume() - 0.05);
        break;
      case 'l':
      case 'L':
        void this.onToggleLike();
        break;
      case '?':
        event.preventDefault();
        this.cheatSheetOpen.update((v) => !v);
        break;
    }
  }

  private async onToggleLike(): Promise<void> {
    const track = this.player.currentTrack();
    if (!track) return;
    const liked = await this.library.toggleLiked(track.id);
    this.messages.add({
      severity: 'success',
      summary: liked ? 'Liked' : 'Unliked',
      detail: track.title,
      life: 1800,
    });
  }
}
