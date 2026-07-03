import { Injectable, computed, signal } from '@angular/core';
import { parseBlob, selectCover } from 'music-metadata';
import { CancelToken, CancelledError } from './cancel';
import { openEchoDb } from './db';
import { runWithConcurrency } from './pool';
import type { ImportEntry, ImportStatus, Peaks, Track } from './types';

const PEAK_SAMPLES = 2000;
const CONCURRENCY = 3;

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly _entries = signal<ReadonlyMap<string, ImportEntry>>(
    new Map(),
  );
  private readonly _running = signal(false);
  private currentToken: CancelToken | null = null;

  readonly entries = computed(() =>
    Array.from(this._entries().values()).sort(
      (a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0) || a.fileName.localeCompare(b.fileName),
    ),
  );

  readonly running = this._running.asReadonly();

  readonly counts = computed(() => {
    const entries = this._entries();
    let total = 0;
    let done = 0;
    let failed = 0;
    let inFlight = 0;
    for (const e of entries.values()) {
      total++;
      if (e.status === 'done') done++;
      else if (e.status === 'failed') failed++;
      else if (
        e.status === 'parsing' ||
        e.status === 'decoding' ||
        e.status === 'storing'
      ) {
        inFlight++;
      }
    }
    return { total, done, failed, inFlight };
  });

  async import(files: File[], token = new CancelToken()): Promise<void> {
    if (files.length === 0) return;
    if (this._running()) {
      throw new Error('Import already in progress. Cancel first.');
    }

    this.currentToken = token;
    this._running.set(true);

    const initial = new Map(this._entries());
    const queued: { entry: ImportEntry; file: File }[] = [];
    const now = Date.now();
    for (const file of files) {
      const entryId = crypto.randomUUID();
      const entry: ImportEntry = {
        id: entryId,
        fileName: file.name,
        fileSize: file.size,
        status: 'queued',
        progress: 0,
        title: '',
        artist: '',
        album: '',
        trackId: null,
        error: null,
        startedAt: now,
        finishedAt: null,
      };
      initial.set(entryId, entry);
      queued.push({ entry, file });
    }
    this._entries.set(initial);

    try {
      await runWithConcurrency(queued, CONCURRENCY, async ({ entry, file }) => {
        if (token.cancelled) {
          this.patch(entry.id, { status: 'cancelled', finishedAt: Date.now() });
          return;
        }
        await this.processFile(entry.id, file, token);
      });
    } finally {
      this._running.set(false);
      this.currentToken = null;
    }
  }

  cancel(): void {
    this.currentToken?.cancel();
  }

  clearFinished(): void {
    const next = new Map<string, ImportEntry>();
    for (const [id, entry] of this._entries()) {
      if (
        entry.status !== 'done' &&
        entry.status !== 'failed' &&
        entry.status !== 'cancelled'
      ) {
        next.set(id, entry);
      }
    }
    this._entries.set(next);
  }

  clearAll(): void {
    this._entries.set(new Map());
  }

  remove(id: string): void {
    const next = new Map(this._entries());
    if (next.delete(id)) this._entries.set(next);
  }

  private patch(id: string, patch: Partial<ImportEntry>): void {
    const next = new Map(this._entries());
    const current = next.get(id);
    if (!current) return;
    next.set(id, { ...current, ...patch });
    this._entries.set(next);
  }

  private async processFile(
    entryId: string,
    file: File,
    token: CancelToken,
  ): Promise<void> {
    try {
      this.patch(entryId, { status: 'parsing', progress: 0.05 });
      token.throwIfCancelled();

      const metadata = await parseBlob(file);
      token.throwIfCancelled();

      const trackId = await computeTrackId(file);
      const cover = selectCover(metadata.common.picture);
      const title = metadata.common.title?.trim() || stripExtension(file.name);
      const artist =
        metadata.common.artist?.trim() ||
        metadata.common.albumartist?.trim() ||
        'Unknown artist';
      const album = metadata.common.album?.trim() || 'Unknown album';

      this.patch(entryId, {
        progress: 0.2,
        title,
        artist,
        album,
        trackId,
      });

      this.patch(entryId, { status: 'decoding', progress: 0.25 });
      const peaks = await computePeaks(file, token, (fraction) => {
        this.patch(entryId, { progress: 0.25 + fraction * 0.6 });
      });
      token.throwIfCancelled();

      this.patch(entryId, { status: 'storing', progress: 0.9 });

      const track: Track = {
        id: trackId,
        title,
        artist,
        album,
        albumArtist: metadata.common.albumartist?.trim() || artist,
        year: metadata.common.year ?? null,
        genre: metadata.common.genre ?? [],
        trackNo: metadata.common.track?.no ?? null,
        discNo: metadata.common.disk?.no ?? null,
        duration: metadata.format.duration ?? 0,
        bitrate: metadata.format.bitrate ?? null,
        sampleRate: metadata.format.sampleRate ?? null,
        channels: metadata.format.numberOfChannels ?? null,
        format: metadata.format.container ?? '',
        codec: metadata.format.codec ?? '',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'audio/*',
        addedAt: Date.now(),
        playCount: 0,
        lastPlayedAt: null,
        liked: false,
        rating: 0,
        hasCover: !!cover,
        peaks,
      };

      const db = await openEchoDb();
      const tx = db.transaction(['tracks', 'blobs', 'covers'], 'readwrite');
      await Promise.all([
        tx.objectStore('tracks').put(track),
        tx.objectStore('blobs').put({
          id: trackId,
          blob: file,
          mimeType: file.type || 'audio/*',
        }),
        cover
          ? tx.objectStore('covers').put({
              id: trackId,
              blob: new Blob([new Uint8Array(cover.data)], {
                type: cover.format || 'image/jpeg',
              }),
              mimeType: cover.format || 'image/jpeg',
            })
          : Promise.resolve(),
        tx.done,
      ]);

      this.patch(entryId, {
        status: 'done',
        progress: 1,
        finishedAt: Date.now(),
      });
    } catch (err) {
      const status: ImportStatus =
        err instanceof CancelledError ? 'cancelled' : 'failed';
      this.patch(entryId, {
        status,
        error: err instanceof Error ? err.message : String(err),
        finishedAt: Date.now(),
      });
    }
  }
}

async function computeTrackId(file: File): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(`${file.name}:${file.size}:${file.lastModified}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 32);
}

function stripExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
}

async function computePeaks(
  file: File,
  token: CancelToken,
  onProgress: (fraction: number) => void,
): Promise<Peaks | null> {
  try {
    const buffer = await file.arrayBuffer();
    token.throwIfCancelled();
    onProgress(0.2);

    const OfflineCtx =
      (globalThis as { OfflineAudioContext?: typeof OfflineAudioContext })
        .OfflineAudioContext ??
      (globalThis as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
        .webkitOfflineAudioContext;
    if (!OfflineCtx) return null;

    const decoder = new OfflineCtx(1, 44100, 44100);
    const decoded = await decoder.decodeAudioData(buffer.slice(0));
    token.throwIfCancelled();
    onProgress(0.6);

    const channelCount = decoded.numberOfChannels;
    const length = decoded.length;
    const min = new Float32Array(PEAK_SAMPLES);
    const max = new Float32Array(PEAK_SAMPLES);
    const step = length / PEAK_SAMPLES;

    const channels: Float32Array[] = [];
    for (let c = 0; c < channelCount; c++) {
      channels.push(decoded.getChannelData(c));
    }

    for (let i = 0; i < PEAK_SAMPLES; i++) {
      const start = Math.floor(i * step);
      const end = Math.min(length, Math.floor((i + 1) * step));
      let lo = Infinity;
      let hi = -Infinity;
      for (let j = start; j < end; j++) {
        let sum = 0;
        for (let c = 0; c < channelCount; c++) sum += channels[c][j];
        const sample = sum / channelCount;
        if (sample < lo) lo = sample;
        if (sample > hi) hi = sample;
      }
      min[i] = lo === Infinity ? 0 : lo;
      max[i] = hi === -Infinity ? 0 : hi;
    }

    onProgress(1);
    return { version: 1, samples: PEAK_SAMPLES, min, max };
  } catch (err) {
    if (err instanceof CancelledError) throw err;
    return null;
  }
}
