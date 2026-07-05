import { Component, computed, inject } from '@angular/core';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { MegaMenu } from 'primeng/megamenu';
import { PlayerService } from '../../audio/player.service';
import { LibraryService } from '../../data/library.service';
import type { Track } from '../../data/types';

interface Station {
  key: string;
  label: string;
  count: number;
  tone: number;
  matcher: (track: Track) => boolean;
}

interface Facet {
  id: string;
  label: string;
  icon: string;
  stations: Station[];
}

const BITRATE_BUCKETS: Array<{
  label: string;
  min: number;
  max: number;
}> = [
  { label: '< 128 kbps', min: 0, max: 128_000 },
  { label: '128 to 192 kbps', min: 128_000, max: 192_000 },
  { label: '192 to 256 kbps', min: 192_000, max: 256_000 },
  { label: '256 to 320 kbps', min: 256_000, max: 320_000 },
  { label: '> 320 kbps', min: 320_000, max: Number.POSITIVE_INFINITY },
];

@Component({
  selector: 'echo-browse',
  imports: [MegaMenu],
  template: `
    <section class="browse-page">
      <header class="browse-header">
        <div>
          <span class="eyebrow">Browse</span>
          <h1 class="title">Filter your library</h1>
        </div>
      </header>

      @if (library.count() === 0) {
        <div class="empty large">
          Import some music from the Home page to see browse facets appear.
        </div>
      } @else {
        <p-megaMenu
          [model]="megaMenuModel()"
          class="browse-menu"
        />

        <div class="facets">
          @for (facet of facets(); track facet.id) {
            <section [id]="facet.id" class="facet">
              <header class="facet-header">
                <i class="pi {{ facet.icon }} text-[var(--echo-accent)]"></i>
                <h2>{{ facet.label }}</h2>
                <span class="facet-count">
                  {{ facet.stations.length }}
                  {{ facet.stations.length === 1 ? 'station' : 'stations' }}
                </span>
              </header>
              @if (facet.stations.length === 0) {
                <div class="empty">
                  No matching tracks in your library.
                </div>
              } @else {
                <div class="station-grid">
                  @for (station of facet.stations; track station.key) {
                    <button
                      type="button"
                      class="station"
                      [style.--tone]="station.tone"
                      (click)="onPlayStation(station)"
                    >
                      <div class="station-label">{{ station.label }}</div>
                      <div class="station-count">
                        {{ station.count }}
                        {{ station.count === 1 ? 'track' : 'tracks' }}
                      </div>
                    </button>
                  }
                </div>
              }
            </section>
          }
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
      .browse-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        min-height: 100%;
      }
      @media (min-width: 768px) {
        .browse-page {
          padding: 2rem 2.5rem;
        }
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 1.875rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0.25rem 0 0;
      }
      :host ::ng-deep .browse-menu .p-megamenu {
        background: var(--echo-chrome-bg);
        border: 1px solid var(--echo-border);
      }
      .facets {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      .facet-header {
        display: flex;
        align-items: baseline;
        gap: 0.6rem;
        margin-bottom: 0.75rem;
      }
      .facet-header h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
      }
      .facet-count {
        margin-left: auto;
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .station-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 0.9rem;
      }
      .station {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem;
        min-height: 130px;
        border: none;
        border-radius: 12px;
        color: white;
        text-align: left;
        cursor: pointer;
        background: linear-gradient(
          145deg,
          hsl(var(--tone), 65%, 42%) 0%,
          hsl(calc(var(--tone) + 40), 60%, 22%) 100%
        );
        transition: transform 150ms ease, box-shadow 150ms ease;
      }
      .station:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
      }
      .station-label {
        font-size: 1.05rem;
        font-weight: 600;
        line-height: 1.2;
      }
      .station-count {
        font-size: 0.75rem;
        opacity: 0.85;
      }
      .empty {
        border-radius: 12px;
        border: 1px dashed var(--echo-border);
        color: var(--echo-muted);
        font-size: 0.875rem;
        padding: 1.5rem;
        text-align: center;
      }
      .empty.large {
        min-height: 240px;
        display: grid;
        place-items: center;
      }
    `,
  ],
})
export class Browse {
  protected readonly library = inject(LibraryService);
  private readonly player = inject(PlayerService);
  private readonly messages = inject(MessageService);

  protected readonly facets = computed<Facet[]>(() => {
    const tracks = this.library.tracks();
    return [
      { id: 'genre', label: 'By genre', icon: 'pi-tag', stations: buildGenreStations(tracks) },
      { id: 'decade', label: 'By decade', icon: 'pi-calendar', stations: buildDecadeStations(tracks) },
      { id: 'format', label: 'By format', icon: 'pi-file', stations: buildFormatStations(tracks) },
      { id: 'bitrate', label: 'By bit rate', icon: 'pi-bolt', stations: buildBitrateStations(tracks) },
    ];
  });

  protected readonly megaMenuModel = computed<MegaMenuItem[]>(() =>
    this.facets().map<MegaMenuItem>((facet) => ({
      label: facet.label,
      icon: `pi ${facet.icon}`,
      items: buildMegaMenuColumns(facet, (s) => this.onPlayStation(s)),
    })),
  );

  async onPlayStation(station: Station): Promise<void> {
    const tracks = this.library.tracks().filter((t) => station.matcher(t));
    if (tracks.length === 0) {
      this.messages.add({
        severity: 'warn',
        summary: 'No tracks match this station',
        life: 2500,
      });
      return;
    }
    const shuffled = shuffleTracks(tracks);
    try {
      await this.player.playTrack(shuffled[0], shuffled);
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Playback failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

function shuffleTracks(tracks: Track[]): Track[] {
  const out = [...tracks];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashTone(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function buildGenreStations(tracks: Track[]): Station[] {
  const counts = new Map<string, number>();
  for (const t of tracks) {
    for (const g of t.genre) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      key: `genre:${label}`,
      label,
      count,
      tone: hashTone(label),
      matcher: (t: Track) => t.genre.includes(label),
    }));
}

function buildDecadeStations(tracks: Track[]): Station[] {
  const counts = new Map<number, number>();
  for (const t of tracks) {
    if (t.year == null) continue;
    const decade = Math.floor(t.year / 10) * 10;
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([decade, count]) => ({
      key: `decade:${decade}`,
      label: `${decade}s`,
      count,
      tone: (decade % 360) * 2,
      matcher: (t: Track) => t.year != null && Math.floor(t.year / 10) * 10 === decade,
    }));
}

function buildFormatStations(tracks: Track[]): Station[] {
  const counts = new Map<string, number>();
  for (const t of tracks) {
    const format = (t.format || t.codec || 'Unknown').toUpperCase();
    counts.set(format, (counts.get(format) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      key: `format:${label}`,
      label,
      count,
      tone: hashTone(label),
      matcher: (t: Track) => {
        const current = (t.format || t.codec || 'Unknown').toUpperCase();
        return current === label;
      },
    }));
}

function buildBitrateStations(tracks: Track[]): Station[] {
  return BITRATE_BUCKETS.map((bucket) => {
    const count = tracks.filter(
      (t) => t.bitrate != null && t.bitrate >= bucket.min && t.bitrate < bucket.max,
    ).length;
    return {
      key: `bitrate:${bucket.label}`,
      label: bucket.label,
      count,
      tone: hashTone(bucket.label),
      matcher: (t: Track) =>
        t.bitrate != null && t.bitrate >= bucket.min && t.bitrate < bucket.max,
    };
  }).filter((s) => s.count > 0);
}

function buildMegaMenuColumns(
  facet: Facet,
  onSelect: (station: Station) => void,
): MegaMenuItem[][] {
  const perColumn = 6;
  const columns: MegaMenuItem[][] = [];
  for (let i = 0; i < facet.stations.length; i += perColumn) {
    columns.push(
      facet.stations.slice(i, i + perColumn).map<MegaMenuItem>((s) => ({
        label: `${s.label} (${s.count})`,
        command: () => onSelect(s),
      })),
    );
  }
  if (columns.length === 0) {
    columns.push([{ label: 'No stations', disabled: true }]);
  }
  return columns;
}
