import {
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { PlayerService } from '../audio/player.service';
import { LibraryService } from '../data/library.service';
import type { Track } from '../data/types';

interface Command {
  id: string;
  label: string;
  detail: string;
  icon: string;
  keywords: string;
  run: () => void | Promise<void>;
}

const PAGES: Array<{ label: string; path: string; icon: string }> = [
  { label: 'Home', path: '/', icon: 'pi-home' },
  { label: 'Search', path: '/search', icon: 'pi-search' },
  { label: 'Library', path: '/library', icon: 'pi-book' },
  { label: 'Browse', path: '/browse', icon: 'pi-th-large' },
  { label: 'Import', path: '/import', icon: 'pi-upload' },
  { label: 'Queue', path: '/queue', icon: 'pi-list' },
  { label: 'Now Playing', path: '/now-playing', icon: 'pi-play-circle' },
  { label: 'Settings', path: '/settings', icon: 'pi-cog' },
];

@Component({
  selector: 'echo-command-palette',
  imports: [FormsModule, Dialog, InputText],
  template: `
    <p-dialog
      [(visible)]="open"
      [modal]="true"
      [showHeader]="false"
      [dismissableMask]="true"
      [style]="{ width: 'min(560px, 94vw)' }"
      class="command-palette-dialog"
      (onShow)="onShown()"
      (onHide)="onHidden()"
    >
      <div class="palette">
        <input
          #paletteInput
          pInputText
          class="palette-input"
          placeholder="Type a command or search…"
          [ngModel]="query()"
          (ngModelChange)="onQuery($event)"
          (keydown)="onInputKey($event)"
          autocomplete="off"
        />
        <div class="palette-list">
          @if (results().length === 0) {
            <div class="palette-empty">No matches.</div>
          }
          @for (cmd of results(); track cmd.id; let i = $index) {
            <button
              type="button"
              class="palette-row"
              [class.is-active]="i === activeIndex()"
              (mouseenter)="activeIndex.set(i)"
              (click)="run(cmd)"
            >
              <i class="pi {{ cmd.icon }}"></i>
              <span class="row-label">{{ cmd.label }}</span>
              <span class="row-detail">{{ cmd.detail }}</span>
            </button>
          }
        </div>
        <div class="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> run</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      :host ::ng-deep .command-palette-dialog .p-dialog-content {
        padding: 0;
        border-radius: 12px;
        overflow: hidden;
      }
      .palette {
        display: flex;
        flex-direction: column;
      }
      .palette-input {
        border: none;
        border-bottom: 1px solid var(--echo-border);
        border-radius: 0;
        padding: 1rem 1.25rem;
        font-size: 1rem;
        background: transparent;
        box-shadow: none;
      }
      .palette-input:focus {
        outline: none;
        box-shadow: none;
      }
      .palette-list {
        max-height: 320px;
        overflow-y: auto;
        padding: 0.4rem;
      }
      .palette-empty {
        padding: 1.5rem;
        text-align: center;
        font-size: 0.875rem;
        color: var(--echo-muted);
      }
      .palette-row {
        display: grid;
        grid-template-columns: 1.5rem 1fr auto;
        gap: 0.6rem;
        align-items: center;
        width: 100%;
        padding: 0.55rem 0.75rem;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--echo-text);
        text-align: left;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .palette-row i {
        color: var(--echo-muted);
      }
      .palette-row.is-active {
        background: var(--echo-hover);
        color: var(--echo-heading);
      }
      .row-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .row-detail {
        font-size: 0.7rem;
        color: var(--echo-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .palette-footer {
        display: flex;
        gap: 1rem;
        padding: 0.6rem 1.25rem;
        border-top: 1px solid var(--echo-border);
        font-size: 0.7rem;
        color: var(--echo-muted);
      }
      kbd {
        display: inline-block;
        padding: 0.05rem 0.35rem;
        margin-right: 0.2rem;
        border: 1px solid var(--echo-border);
        border-radius: 4px;
        font-size: 0.65rem;
        font-family: inherit;
      }
    `,
  ],
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly results = computed<Command[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const commands = this.allCommands();
    const pool = needle
      ? commands.filter(
          (c) =>
            c.label.toLowerCase().includes(needle) ||
            c.keywords.includes(needle),
        )
      : commands;
    return pool.slice(0, 12);
  });

  private readonly allCommands = computed<Command[]>(() => {
    const commands: Command[] = PAGES.map((page) => ({
      id: `nav:${page.path}`,
      label: `Go to ${page.label}`,
      detail: 'Navigate',
      icon: page.icon,
      keywords: `go open navigate page ${page.label.toLowerCase()}`,
      run: () => void this.router.navigate([page.path]),
    }));

    commands.push(
      {
        id: 'action:play-pause',
        label: this.player.isPlaying() ? 'Pause' : 'Play',
        detail: 'Playback',
        icon: this.player.isPlaying() ? 'pi-pause' : 'pi-play',
        keywords: 'play pause toggle playback',
        run: () => void this.player.togglePlay(),
      },
      {
        id: 'action:next',
        label: 'Next track',
        detail: 'Playback',
        icon: 'pi-step-forward',
        keywords: 'next skip forward track',
        run: () => void this.player.next(),
      },
      {
        id: 'action:shuffle',
        label: this.player.shuffle() ? 'Disable shuffle' : 'Enable shuffle',
        detail: 'Playback',
        icon: 'pi-refresh',
        keywords: 'shuffle random order toggle',
        run: () => this.player.toggleShuffle(),
      },
      {
        id: 'action:play-random',
        label: 'Play something random',
        detail: 'Playback',
        icon: 'pi-bolt',
        keywords: 'random surprise play anything',
        run: () => void this.playRandom(),
      },
    );

    for (const track of this.library.tracks().slice(0, 200)) {
      commands.push({
        id: `track:${track.id}`,
        label: track.title,
        detail: `Song · ${track.artist}`,
        icon: 'pi-play-circle',
        keywords: `play song track ${track.title.toLowerCase()} ${track.artist.toLowerCase()} ${track.album.toLowerCase()}`,
        run: () => void this.player.playTrack(track, this.library.tracks()),
      });
    }
    for (const album of this.library.albums()) {
      commands.push({
        id: `album:${album.key}`,
        label: album.album,
        detail: `Album · ${album.albumArtist}`,
        icon: 'pi-th-large',
        keywords: `play open album ${album.album.toLowerCase()} ${album.albumArtist.toLowerCase()}`,
        run: () =>
          void this.router.navigate([
            '/album',
            encodeURIComponent(album.key),
          ]),
      });
    }
    for (const artist of this.library.artists()) {
      commands.push({
        id: `artist:${artist.name}`,
        label: artist.name,
        detail: 'Artist',
        icon: 'pi-user',
        keywords: `open artist ${artist.name.toLowerCase()}`,
        run: () =>
          void this.router.navigate([
            '/artist',
            encodeURIComponent(artist.name),
          ]),
      });
    }
    return commands;
  });

  @HostListener('window:keydown', ['$event'])
  onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.open.update((v) => !v);
    }
  }

  onShown(): void {
    this.query.set('');
    this.activeIndex.set(0);
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.palette-input');
      input?.focus();
    });
  }

  onHidden(): void {
    this.query.set('');
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onInputKey(event: KeyboardEvent): void {
    const results = this.results();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = results[this.activeIndex()];
      if (cmd) this.run(cmd);
    }
  }

  run(cmd: Command): void {
    this.open.set(false);
    void cmd.run();
  }

  private async playRandom(): Promise<void> {
    const tracks = this.library.tracks();
    if (tracks.length === 0) {
      this.messages.add({
        severity: 'warn',
        summary: 'Library is empty',
        detail: 'Import some music first.',
        life: 2500,
      });
      return;
    }
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    await this.player.playTrack(track, tracks);
  }
}
