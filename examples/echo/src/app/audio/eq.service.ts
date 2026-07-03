import { Injectable, signal } from '@angular/core';

export const EQ_BANDS = [
  { frequency: 60, label: '60 Hz' },
  { frequency: 250, label: '250 Hz' },
  { frequency: 1000, label: '1 kHz' },
  { frequency: 4000, label: '4 kHz' },
  { frequency: 12000, label: '12 kHz' },
] as const;

export const EQ_MIN_GAIN = -12;
export const EQ_MAX_GAIN = 12;

export type EqPresetKey =
  | 'flat'
  | 'rock'
  | 'jazz'
  | 'classical'
  | 'bass-boost'
  | 'vocal'
  | 'custom';

export const EQ_PRESETS: Record<Exclude<EqPresetKey, 'custom'>, number[]> = {
  flat: [0, 0, 0, 0, 0],
  rock: [5, 3, -1, 2, 4],
  jazz: [3, 2, -1, 2, 3],
  classical: [4, 2, 0, 2, 3],
  'bass-boost': [8, 5, 0, 0, 0],
  vocal: [-2, 0, 4, 3, 1],
};

@Injectable({ providedIn: 'root' })
export class EqService {
  private readonly _gains = signal<number[]>([0, 0, 0, 0, 0]);
  private readonly _preset = signal<EqPresetKey>('flat');
  private filters: BiquadFilterNode[] = [];

  readonly gains = this._gains.asReadonly();
  readonly preset = this._preset.asReadonly();
  readonly bands = EQ_BANDS;

  attach(context: AudioContext): { input: AudioNode; output: AudioNode } {
    if (this.filters.length > 0) {
      return {
        input: this.filters[0],
        output: this.filters[this.filters.length - 1],
      };
    }
    const filters: BiquadFilterNode[] = [];
    for (let i = 0; i < EQ_BANDS.length; i++) {
      const filter = context.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = EQ_BANDS[i].frequency;
      filter.Q.value = 1;
      filter.gain.value = this._gains()[i];
      filters.push(filter);
    }
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
    this.filters = filters;
    return { input: filters[0], output: filters[filters.length - 1] };
  }

  setBand(index: number, gainDb: number): void {
    if (index < 0 || index >= EQ_BANDS.length) return;
    const clamped = Math.max(EQ_MIN_GAIN, Math.min(EQ_MAX_GAIN, gainDb));
    const next = [...this._gains()];
    next[index] = clamped;
    this._gains.set(next);
    if (this.filters[index]) {
      this.filters[index].gain.value = clamped;
    }
    if (this._preset() !== 'custom') {
      this._preset.set('custom');
    }
  }

  setPreset(preset: EqPresetKey): void {
    this._preset.set(preset);
    if (preset === 'custom') return;
    const values = EQ_PRESETS[preset];
    this._gains.set([...values]);
    for (let i = 0; i < this.filters.length; i++) {
      this.filters[i].gain.value = values[i];
    }
  }

  reset(): void {
    this.setPreset('flat');
  }
}