import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { InitialsPipe } from 'ngx-transforms';
import type { ArtistSummary } from '../../data/library.service';

@Component({
  selector: 'echo-artist-tile',
  imports: [InitialsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="tile"
      (click)="open.emit(artist())"
    >
      <div class="avatar">
        <span>{{ artist().name | initials }}</span>
      </div>
      <div class="meta">
        <div class="name" [title]="artist().name">{{ artist().name }}</div>
        <div class="count">
          {{ artist().trackIds.length }}
          {{ artist().trackIds.length === 1 ? 'track' : 'tracks' }}
        </div>
      </div>
    </button>
  `,
  styles: [
    `
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .avatar {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 999px;
        background: linear-gradient(
          145deg,
          var(--p-primary-500) 0%,
          var(--p-primary-700) 100%
        );
        display: grid;
        place-items: center;
        color: white;
        font-weight: 600;
        font-size: 1.75rem;
        letter-spacing: 0.05em;
        transition: transform 200ms ease;
      }
      .tile:hover .avatar {
        transform: translateY(-2px);
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        text-align: center;
      }
      .name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--echo-heading);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      .count {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
    `,
  ],
})
export class ArtistTile {
  readonly artist = input.required<ArtistSummary>();
  readonly open = output<ArtistSummary>();
}