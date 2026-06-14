import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DailyVolume } from '../../data/mock-data';

interface SeriesPath {
  readonly line: string;
  readonly area: string;
}

@Component({
  selector: 'app-sparkline',
  template: `
    <svg
      class="chart"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      <defs>
        <linearGradient id="sparkline-opened" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(37, 99, 235, 0.32)" />
          <stop offset="100%" stop-color="rgba(37, 99, 235, 0)" />
        </linearGradient>
        <linearGradient id="sparkline-resolved" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(16, 185, 129, 0.28)" />
          <stop offset="100%" stop-color="rgba(16, 185, 129, 0)" />
        </linearGradient>
      </defs>

      <path class="area area--opened" [attr.d]="opened().area" />
      <path class="area area--resolved" [attr.d]="resolved().area" />
      <path class="line line--opened" [attr.d]="opened().line" />
      <path class="line line--resolved" [attr.d]="resolved().line" />
    </svg>

    <ul class="axis" aria-hidden="true">
      @for (d of axisDays(); track d) { <li>{{ d }}</li> }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .chart {
      width: 100%;
      height: 180px;
      display: block;
    }
    .line {
      fill: none;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }
    .line--opened { stroke: #2563eb; }
    .line--resolved { stroke: #10b981; }
    .area--opened { fill: url(#sparkline-opened); }
    .area--resolved { fill: url(#sparkline-resolved); }
    .axis {
      list-style: none;
      margin: 6px 0 0;
      padding: 0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #71717a;
      font-variant-numeric: tabular-nums;
    }
    :host-context(.theme-dark) .axis { color: rgba(255, 255, 255, 0.5); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sparkline {
  readonly data = input.required<readonly DailyVolume[]>();

  private readonly W = 800;
  private readonly H = 200;
  private readonly PAD = 8;

  readonly viewBox = computed(() => `0 0 ${this.W} ${this.H}`);

  private readonly maxValue = computed(() => {
    const rows = this.data();
    let max = 0;
    for (const r of rows) {
      if (r.opened > max) max = r.opened;
      if (r.resolved > max) max = r.resolved;
    }
    return Math.max(max, 1);
  });

  readonly opened = computed<SeriesPath>(() => this.toPath((d) => d.opened));
  readonly resolved = computed<SeriesPath>(() => this.toPath((d) => d.resolved));

  readonly axisDays = computed(() => {
    const rows = this.data();
    // Show first, midpoint, last so the strip stays readable on narrow viewports.
    return rows.length <= 5
      ? rows.map((r) => r.day)
      : [rows[0].day, rows[Math.floor(rows.length / 2)].day, rows[rows.length - 1].day];
  });

  readonly ariaLabel = computed(() => {
    const rows = this.data();
    return `${rows.length} day ticket volume: ${rows[0]?.day ?? ''} to ${rows.at(-1)?.day ?? ''}.`;
  });

  private toPath(pick: (d: DailyVolume) => number): SeriesPath {
    const rows = this.data();
    if (!rows.length) return { line: '', area: '' };

    const step = (this.W - this.PAD * 2) / Math.max(rows.length - 1, 1);
    const max = this.maxValue();
    const points = rows.map((row, i) => {
      const x = this.PAD + i * step;
      const y = this.H - this.PAD - (pick(row) / max) * (this.H - this.PAD * 2);
      return { x, y };
    });

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L ${last.x.toFixed(2)} ${this.H - this.PAD} L ${first.x.toFixed(2)} ${this.H - this.PAD} Z`;

    return { line, area };
  }
}
