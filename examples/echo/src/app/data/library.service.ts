import { Injectable, computed, effect, signal } from '@angular/core';
import { openEchoDb } from './db';
import { ImportService } from './import.service';
import type { Track } from './types';

export interface AlbumSummary {
  key: string;
  album: string;
  albumArtist: string;
  year: number | null;
  trackIds: string[];
  coverTrackId: string | null;
}

export interface ArtistSummary {
  name: string;
  trackIds: string[];
  albumKeys: string[];
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly _tracks = signal<Track[]>([]);
  private readonly _loading = signal(true);

  readonly tracks = this._tracks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count = computed(() => this._tracks().length);

  readonly albums = computed<AlbumSummary[]>(() => {
    const byKey = new Map<string, AlbumSummary>();
    for (const track of this._tracks()) {
      const key = `${track.albumArtist}::${track.album}`;
      let summary = byKey.get(key);
      if (!summary) {
        summary = {
          key,
          album: track.album,
          albumArtist: track.albumArtist,
          year: track.year,
          trackIds: [],
          coverTrackId: null,
        };
        byKey.set(key, summary);
      }
      summary.trackIds.push(track.id);
      if (!summary.coverTrackId && track.hasCover) {
        summary.coverTrackId = track.id;
      }
    }
    return Array.from(byKey.values()).sort((a, b) =>
      a.album.localeCompare(b.album),
    );
  });

  readonly recentAlbums = computed<AlbumSummary[]>(() => {
    const tracks = this._tracks();
    const latestByKey = new Map<string, number>();
    for (const t of tracks) {
      const key = `${t.albumArtist}::${t.album}`;
      const current = latestByKey.get(key) ?? 0;
      if (t.addedAt > current) latestByKey.set(key, t.addedAt);
    }
    return [...this.albums()].sort(
      (a, b) => (latestByKey.get(b.key) ?? 0) - (latestByKey.get(a.key) ?? 0),
    );
  });

  readonly artists = computed<ArtistSummary[]>(() => {
    const byName = new Map<string, ArtistSummary>();
    for (const track of this._tracks()) {
      let summary = byName.get(track.artist);
      if (!summary) {
        summary = { name: track.artist, trackIds: [], albumKeys: [] };
        byName.set(track.artist, summary);
      }
      summary.trackIds.push(track.id);
      const albumKey = `${track.albumArtist}::${track.album}`;
      if (!summary.albumKeys.includes(albumKey)) {
        summary.albumKeys.push(albumKey);
      }
    }
    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  constructor(importer: ImportService) {
    void this.refresh();
    effect(() => {
      const running = importer.running();
      if (!running && importer.counts().done > 0) {
        void this.refresh();
      }
    });
  }

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const db = await openEchoDb();
      const tracks = await db.getAll('tracks');
      tracks.sort((a, b) => b.addedAt - a.addedAt);
      this._tracks.set(tracks);
    } finally {
      this._loading.set(false);
    }
  }

  getById(id: string): Track | undefined {
    return this._tracks().find((t) => t.id === id);
  }

  getAlbum(key: string): AlbumSummary | undefined {
    return this.albums().find((a) => a.key === key);
  }

  getArtist(name: string): ArtistSummary | undefined {
    return this.artists().find((a) => a.name === name);
  }

  tracksInAlbum(key: string): Track[] {
    const album = this.getAlbum(key);
    if (!album) return [];
    return album.trackIds
      .map((id) => this.getById(id))
      .filter((t): t is Track => !!t)
      .sort(
        (a, b) =>
          (a.discNo ?? 0) - (b.discNo ?? 0) ||
          (a.trackNo ?? 0) - (b.trackNo ?? 0),
      );
  }

  tracksByArtist(name: string): Track[] {
    return this._tracks().filter(
      (t) => t.artist === name || t.albumArtist === name,
    );
  }

  albumsByArtist(name: string): AlbumSummary[] {
    return this.albums().filter((a) => a.albumArtist === name);
  }

  async loadAudioBlob(trackId: string): Promise<Blob | null> {
    const db = await openEchoDb();
    const record = await db.get('blobs', trackId);
    return record ? record.blob : null;
  }

  async loadCoverBlob(trackId: string): Promise<Blob | null> {
    const db = await openEchoDb();
    const record = await db.get('covers', trackId);
    return record ? record.blob : null;
  }
}
