import { Injectable, computed, inject, signal } from '@angular/core';
import { LibraryService } from '../data/library.service';
import type { Track } from '../data/types';
import { EqService } from './eq.service';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioGraph {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
  analyser: AnalyserNode;
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly library = inject(LibraryService);
  private readonly eq = inject(EqService);

  private readonly _currentTrack = signal<Track | null>(null);
  private readonly _isPlaying = signal(false);
  private readonly _progress = signal(0);
  private readonly _duration = signal(0);
  private readonly _volume = signal(0.8);
  private readonly _muted = signal(false);
  private readonly _queue = signal<Track[]>([]);
  private readonly _queueIndex = signal(-1);
  private readonly _history = signal<Track[]>([]);
  private readonly _shuffle = signal(false);
  private readonly _repeat = signal<RepeatMode>('off');
  private readonly _buffering = signal(false);
  private readonly _coverUrl = signal<string | null>(null);

  readonly currentTrack = this._currentTrack.asReadonly();
  readonly coverUrl = this._coverUrl.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly progress = this._progress.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly muted = this._muted.asReadonly();
  readonly queue = this._queue.asReadonly();
  readonly queueIndex = this._queueIndex.asReadonly();
  readonly history = this._history.asReadonly();
  readonly shuffle = this._shuffle.asReadonly();
  readonly repeat = this._repeat.asReadonly();
  readonly buffering = this._buffering.asReadonly();

  readonly hasNext = computed(() => {
    if (this._repeat() !== 'off') return this._queue().length > 0;
    return this._queueIndex() < this._queue().length - 1;
  });
  readonly hasPrevious = computed(() => this._history().length > 0 || this._progress() > 3);
  readonly progressPercent = computed(() => {
    const d = this._duration();
    return d > 0 ? (this._progress() / d) * 100 : 0;
  });

  readonly audioElement: HTMLAudioElement;
  private graph: AudioGraph | null = null;
  private currentObjectUrl: string | null = null;
  private tickHandle: number | null = null;
  private currentCoverUrl: string | null = null;

  constructor() {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = this._volume();

    audio.addEventListener('play', () => this._isPlaying.set(true));
    audio.addEventListener('pause', () => this._isPlaying.set(false));
    audio.addEventListener('playing', () => this._buffering.set(false));
    audio.addEventListener('waiting', () => this._buffering.set(true));
    audio.addEventListener('loadedmetadata', () => {
      this._duration.set(audio.duration || this._currentTrack()?.duration || 0);
    });
    audio.addEventListener('durationchange', () => {
      this._duration.set(audio.duration || this._currentTrack()?.duration || 0);
    });
    audio.addEventListener('ended', () => this.onTrackEnded());
    audio.addEventListener('timeupdate', () => this._progress.set(audio.currentTime));

    this.audioElement = audio;
    this.startTicker();
    this.wireMediaSession();
  }

  async playTrack(track: Track, list?: Track[]): Promise<void> {
    if (list && list.length > 0) {
      const startIndex = list.findIndex((t) => t.id === track.id);
      this._queue.set([...list]);
      this._queueIndex.set(startIndex >= 0 ? startIndex : 0);
    } else if (this._queue().length === 0) {
      this._queue.set([track]);
      this._queueIndex.set(0);
    } else {
      const idx = this._queue().findIndex((t) => t.id === track.id);
      if (idx >= 0) {
        this._queueIndex.set(idx);
      } else {
        const q = [...this._queue(), track];
        this._queue.set(q);
        this._queueIndex.set(q.length - 1);
      }
    }
    await this.loadCurrent();
    await this.play();
  }

  async play(): Promise<void> {
    if (!this._currentTrack()) {
      const q = this._queue();
      if (q.length === 0) return;
      const idx = this._queueIndex() >= 0 ? this._queueIndex() : 0;
      this._queueIndex.set(idx);
      await this.loadCurrent();
    }
    await this.ensureGraph();
    try {
      await this.audioElement.play();
    } catch (err) {
      this._isPlaying.set(false);
      throw err;
    }
  }

  pause(): void {
    this.audioElement.pause();
  }

  async togglePlay(): Promise<void> {
    if (this._isPlaying()) {
      this.pause();
    } else {
      await this.play();
    }
  }

  async next(): Promise<void> {
    const q = this._queue();
    if (q.length === 0) return;
    const current = this._currentTrack();
    if (current) {
      this._history.update((h) => [current, ...h].slice(0, 100));
    }
    const idx = this._queueIndex();
    if (this._repeat() === 'one' && current) {
      this.audioElement.currentTime = 0;
      await this.play();
      return;
    }
    let nextIndex: number;
    if (this._shuffle()) {
      nextIndex = q.length === 1 ? 0 : this.pickRandomExcept(idx, q.length);
    } else if (idx < q.length - 1) {
      nextIndex = idx + 1;
    } else if (this._repeat() === 'all') {
      nextIndex = 0;
    } else {
      this.pause();
      this.audioElement.currentTime = 0;
      return;
    }
    this._queueIndex.set(nextIndex);
    await this.loadCurrent();
    await this.play();
  }

  async previous(): Promise<void> {
    if (this._progress() > 3) {
      this.audioElement.currentTime = 0;
      return;
    }
    const history = this._history();
    if (history.length > 0) {
      const [prev, ...rest] = history;
      this._history.set(rest);
      const q = this._queue();
      const idx = q.findIndex((t) => t.id === prev.id);
      if (idx >= 0) {
        this._queueIndex.set(idx);
      } else {
        this._queue.set([prev, ...q]);
        this._queueIndex.set(0);
      }
      await this.loadCurrent();
      await this.play();
      return;
    }
    const idx = this._queueIndex();
    if (idx > 0) {
      this._queueIndex.set(idx - 1);
      await this.loadCurrent();
      await this.play();
    } else {
      this.audioElement.currentTime = 0;
    }
  }

  seek(seconds: number): void {
    const clamped = Math.max(0, Math.min(this._duration(), seconds));
    this.audioElement.currentTime = clamped;
    this._progress.set(clamped);
  }

  seekPercent(percent: number): void {
    this.seek((percent / 100) * this._duration());
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this._volume.set(clamped);
    this.audioElement.volume = this._muted() ? 0 : clamped;
    if (this.graph) {
      this.graph.gain.gain.value = this._muted() ? 0 : clamped;
    }
  }

  toggleMute(): void {
    const next = !this._muted();
    this._muted.set(next);
    this.audioElement.volume = next ? 0 : this._volume();
    if (this.graph) {
      this.graph.gain.gain.value = next ? 0 : this._volume();
    }
  }

  toggleShuffle(): void {
    this._shuffle.update((v) => !v);
  }

  cycleRepeat(): void {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    const nextIndex = (order.indexOf(this._repeat()) + 1) % order.length;
    this._repeat.set(order[nextIndex]);
  }

  enqueue(tracks: Track[]): void {
    if (tracks.length === 0) return;
    this._queue.update((q) => [...q, ...tracks]);
  }

  reorderQueue(tracks: Track[]): void {
    const current = this._currentTrack();
    this._queue.set([...tracks]);
    if (!current) {
      this._queueIndex.set(-1);
      return;
    }
    const nextIndex = tracks.findIndex((t) => t.id === current.id);
    this._queueIndex.set(nextIndex);
  }

  removeFromQueueAt(index: number): void {
    const queue = this._queue();
    if (index < 0 || index >= queue.length) return;
    const currentIndex = this._queueIndex();
    const removingCurrent = index === currentIndex;
    const next = [...queue.slice(0, index), ...queue.slice(index + 1)];
    this._queue.set(next);
    if (removingCurrent) {
      if (next.length === 0) {
        this.pause();
        this._queueIndex.set(-1);
        this._currentTrack.set(null);
        this._progress.set(0);
        this._duration.set(0);
        this.audioElement.removeAttribute('src');
        this.audioElement.load();
      } else {
        const nextIndex = Math.min(index, next.length - 1);
        this._queueIndex.set(nextIndex);
        void this.loadCurrent().then(() => this.play());
      }
      return;
    }
    if (index < currentIndex) {
      this._queueIndex.set(currentIndex - 1);
    }
  }

  moveInQueue(from: number, to: number): void {
    const queue = [...this._queue()];
    if (from < 0 || from >= queue.length || to < 0 || to >= queue.length) return;
    const [moved] = queue.splice(from, 1);
    queue.splice(to, 0, moved);
    this.reorderQueue(queue);
  }

  clearQueue(): void {
    this.pause();
    this._queue.set([]);
    this._queueIndex.set(-1);
    this._currentTrack.set(null);
    this._progress.set(0);
    this._duration.set(0);
    this.audioElement.removeAttribute('src');
    this.audioElement.load();
    this.releaseObjectUrl();
    this.releaseCoverUrl();
  }

  getAnalyser(): AnalyserNode | null {
    return this.graph?.analyser ?? null;
  }

  getContextDiagnostics(): { state: string; sampleRate: number } | null {
    if (!this.graph) return null;
    return {
      state: this.graph.context.state,
      sampleRate: this.graph.context.sampleRate,
    };
  }

  private async loadCurrent(): Promise<void> {
    const q = this._queue();
    const idx = this._queueIndex();
    if (idx < 0 || idx >= q.length) {
      this._currentTrack.set(null);
      return;
    }
    const track = q[idx];
    this._currentTrack.set(track);
    this._progress.set(0);
    this._duration.set(track.duration);
    this._buffering.set(true);

    const blob = await this.library.loadAudioBlob(track.id);
    if (!blob) {
      this._buffering.set(false);
      return;
    }
    this.releaseObjectUrl();
    const url = URL.createObjectURL(blob);
    this.currentObjectUrl = url;
    this.audioElement.src = url;
    this.audioElement.load();

    void this.updateMediaSessionMetadata(track);
  }

  private async ensureGraph(): Promise<void> {
    if (this.graph) {
      if (this.graph.context.state === 'suspended') {
        await this.graph.context.resume();
      }
      return;
    }
    const Ctx =
      (globalThis as { AudioContext?: typeof AudioContext }).AudioContext ??
      (globalThis as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const context = new Ctx();
    const source = context.createMediaElementSource(this.audioElement);
    const gain = context.createGain();
    gain.gain.value = this._muted() ? 0 : this._volume();
    const { input: eqIn, output: eqOut } = this.eq.attach(context);
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(gain);
    gain.connect(eqIn);
    eqOut.connect(analyser);
    analyser.connect(context.destination);

    this.graph = { context, source, gain, analyser };
    if (context.state === 'suspended') {
      await context.resume();
    }
  }

  private async onTrackEnded(): Promise<void> {
    if (this._repeat() === 'one') {
      this.audioElement.currentTime = 0;
      await this.play();
      return;
    }
    await this.next();
  }

  private startTicker(): void {
    if (this.tickHandle !== null) return;
    this.tickHandle = window.setInterval(() => {
      if (this._isPlaying() && !this.audioElement.paused) {
        this._progress.set(this.audioElement.currentTime);
      }
    }, 100);
  }

  private pickRandomExcept(current: number, total: number): number {
    if (total <= 1) return 0;
    let next = current;
    while (next === current) {
      next = Math.floor(Math.random() * total);
    }
    return next;
  }

  private releaseObjectUrl(): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  private releaseCoverUrl(): void {
    if (this.currentCoverUrl) {
      URL.revokeObjectURL(this.currentCoverUrl);
      this.currentCoverUrl = null;
      this._coverUrl.set(null);
    }
  }

  private wireMediaSession(): void {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    session.setActionHandler('play', () => void this.play());
    session.setActionHandler('pause', () => this.pause());
    session.setActionHandler('previoustrack', () => void this.previous());
    session.setActionHandler('nexttrack', () => void this.next());
    session.setActionHandler('seekto', (event) => {
      if (typeof event.seekTime === 'number') this.seek(event.seekTime);
    });
  }

  private async updateMediaSessionMetadata(track: Track): Promise<void> {
    if (!('mediaSession' in navigator)) return;
    this.releaseCoverUrl();
    let artwork: MediaImage[] = [];
    if (track.hasCover) {
      const cover = await this.library.loadCoverBlob(track.id);
      if (cover) {
        const url = URL.createObjectURL(cover);
        this.currentCoverUrl = url;
        this._coverUrl.set(url);
        artwork = [{ src: url, sizes: '512x512', type: cover.type }];
      }
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork,
    });
  }
}