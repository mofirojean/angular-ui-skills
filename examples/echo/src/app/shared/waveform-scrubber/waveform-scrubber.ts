import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { Peaks } from '../../data/types';

@Component({
  selector: 'echo-waveform-scrubber',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="wrap"
      (click)="onSeek($event)"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerCancel()"
    >
      <canvas #canvas></canvas>
      @if (hoverPercent(); as pct) {
        <div class="hover-marker" [style.left.%]="pct"></div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 64px;
      }
      .wrap {
        position: relative;
        width: 100%;
        height: 100%;
        cursor: pointer;
        touch-action: none;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
      .hover-marker {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--echo-heading);
        opacity: 0.6;
        pointer-events: none;
      }
    `,
  ],
})
export class WaveformScrubber {
  readonly peaks = input<Peaks | null>(null);
  readonly progress = input(0);
  readonly duration = input(0);
  readonly seek = output<number>();

  protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly hoverPercent = signal<number | null>(null);
  private dragging = false;

  private readonly progressPercent = computed(() => {
    const d = this.duration();
    return d > 0 ? Math.min(1, this.progress() / d) : 0;
  });

  constructor() {
    afterRenderEffect(() => {
      const el = this.canvas().nativeElement;
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = Math.max(1, Math.floor(rect.width));
      const cssHeight = Math.max(1, Math.floor(rect.height));
      if (
        el.width !== cssWidth * dpr ||
        el.height !== cssHeight * dpr
      ) {
        el.width = cssWidth * dpr;
        el.height = cssHeight * dpr;
      }
    });

    effect(() => {
      const el = this.canvas().nativeElement;
      const peaks = this.peaks();
      const pct = this.progressPercent();
      this.draw(el, peaks, pct);
    });
  }

  onSeek(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.seek.emit(ratio * this.duration());
  }

  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updateHover(event);
  }

  onPointerMove(event: PointerEvent): void {
    this.updateHover(event);
    if (this.dragging) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      this.seek.emit(ratio * this.duration());
    }
  }

  onPointerUp(event: PointerEvent): void {
    this.dragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  onPointerCancel(): void {
    this.dragging = false;
    this.hoverPercent.set(null);
  }

  private updateHover(event: PointerEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.hoverPercent.set(ratio * 100);
  }

  private draw(canvas: HTMLCanvasElement, peaks: Peaks | null, progress: number): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const style = getComputedStyle(canvas);
    const heading =
      style.getPropertyValue('--echo-heading').trim() || '#e5e7eb';
    const muted = style.getPropertyValue('--echo-muted').trim() || '#6b7280';
    const accent = style.getPropertyValue('--echo-accent').trim() || '#a78bfa';

    const mid = height / 2;
    const playedX = progress * width;

    if (!peaks || peaks.samples === 0) {
      ctx.fillStyle = withAlpha(muted, 0.3);
      ctx.fillRect(0, mid - dpr, width, dpr * 2);
      if (playedX > 0) {
        ctx.fillStyle = accent;
        ctx.fillRect(0, mid - dpr, playedX, dpr * 2);
      }
      return;
    }

    const barWidth = Math.max(dpr, width / peaks.samples);
    const gap = Math.max(0, dpr * 0.5);
    const step = width / peaks.samples;
    const amp = height / 2;

    for (let i = 0; i < peaks.samples; i++) {
      const x = i * step;
      const hi = peaks.max[i] || 0;
      const lo = peaks.min[i] || 0;
      const top = mid - hi * amp;
      const bottom = mid - lo * amp;
      const barH = Math.max(dpr, bottom - top);
      const drawX = x + gap / 2;
      const drawW = Math.max(dpr, barWidth - gap);
      ctx.fillStyle = x < playedX ? accent : withAlpha(heading, 0.35);
      ctx.fillRect(drawX, top, drawW, barH);
    }
  }
}

function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const r = parseInt(trimmed.slice(1, 3), 16);
    const g = parseInt(trimmed.slice(3, 5), 16);
    const b = parseInt(trimmed.slice(5, 7), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return trimmed || `rgba(255, 255, 255, ${alpha})`;
}
