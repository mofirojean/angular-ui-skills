import { Injectable, computed, signal } from '@angular/core';
import { openEchoDb } from './db';
import type { Playlist } from './types';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly _playlists = signal<Playlist[]>([]);
  private readonly _loading = signal(true);

  readonly playlists = this._playlists.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count = computed(() => this._playlists().length);

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const db = await openEchoDb();
      const all = await db.getAll('playlists');
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      this._playlists.set(all);
    } finally {
      this._loading.set(false);
    }
  }

  async create(name: string, description = ''): Promise<Playlist> {
    const now = Date.now();
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name: name.trim() || 'New playlist',
      description: description.trim(),
      trackIds: [],
      createdAt: now,
      updatedAt: now,
      coverTrackId: null,
    };
    const db = await openEchoDb();
    await db.put('playlists', playlist);
    this._playlists.update((list) => [playlist, ...list]);
    return playlist;
  }

  async rename(id: string, name: string, description?: string): Promise<void> {
    const current = this._playlists().find((p) => p.id === id);
    if (!current) return;
    const next: Playlist = {
      ...current,
      name: name.trim() || current.name,
      description: description !== undefined ? description.trim() : current.description,
      updatedAt: Date.now(),
    };
    const db = await openEchoDb();
    await db.put('playlists', next);
    this.replace(next);
  }

  async delete(id: string): Promise<void> {
    const db = await openEchoDb();
    await db.delete('playlists', id);
    this._playlists.update((list) => list.filter((p) => p.id !== id));
  }

  async addTracks(id: string, trackIds: string[]): Promise<void> {
    const current = this._playlists().find((p) => p.id === id);
    if (!current) return;
    const merged = [...current.trackIds];
    for (const trackId of trackIds) {
      if (!merged.includes(trackId)) merged.push(trackId);
    }
    const next: Playlist = {
      ...current,
      trackIds: merged,
      coverTrackId: current.coverTrackId ?? merged[0] ?? null,
      updatedAt: Date.now(),
    };
    const db = await openEchoDb();
    await db.put('playlists', next);
    this.replace(next);
  }

  async removeTrack(id: string, trackId: string): Promise<void> {
    const current = this._playlists().find((p) => p.id === id);
    if (!current) return;
    const next: Playlist = {
      ...current,
      trackIds: current.trackIds.filter((t) => t !== trackId),
      coverTrackId:
        current.coverTrackId === trackId
          ? current.trackIds.find((t) => t !== trackId) ?? null
          : current.coverTrackId,
      updatedAt: Date.now(),
    };
    const db = await openEchoDb();
    await db.put('playlists', next);
    this.replace(next);
  }

  async reorder(id: string, trackIds: string[]): Promise<void> {
    const current = this._playlists().find((p) => p.id === id);
    if (!current) return;
    const next: Playlist = {
      ...current,
      trackIds: [...trackIds],
      updatedAt: Date.now(),
    };
    const db = await openEchoDb();
    await db.put('playlists', next);
    this.replace(next);
  }

  getById(id: string): Playlist | undefined {
    return this._playlists().find((p) => p.id === id);
  }

  private replace(playlist: Playlist): void {
    this._playlists.update((list) =>
      list.map((p) => (p.id === playlist.id ? playlist : p)),
    );
  }
}