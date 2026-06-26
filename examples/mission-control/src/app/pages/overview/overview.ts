import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmItemImports } from '@spartan-ng/helm/item';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';

import {
  AgentUsage,
  BadgeVariant,
  BarSegment,
  DONUT_CIRCUMFERENCE,
  DonutSegment,
  PAGE_SIZE,
  Run,
  RunStatus,
  SortDirection,
  SortKey,
} from './overview.model';
import { ACTIVITY_ENTRIES, AGENT_USAGE, KPIS, RECENT_RUNS, RUNS_TREND, STATUS_BREAKDOWN } from './overview.data';

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmIcon,
    HlmItemImports,
    HlmSkeletonImports,
    HlmTableImports,
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  protected readonly isLoading = signal(true);
  protected readonly range = signal<'today' | '7d' | '30d'>('7d');
  protected readonly lastRefreshed = signal<string>('12s ago');

  protected readonly ranges: { key: 'today' | '7d' | '30d'; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '7d',    label: '7d' },
    { key: '30d',   label: '30d' },
  ];

  protected setRange(r: 'today' | '7d' | '30d'): void {
    this.range.set(r);
    this.refresh();
  }

  protected refresh(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.lastRefreshed.set('just now');
    setTimeout(() => this.isLoading.set(false), 600);
  }

  protected readonly kpis = KPIS;
  protected readonly runsTrend = RUNS_TREND;
  protected readonly statusBreakdown = STATUS_BREAKDOWN;
  protected readonly agentUsage: readonly AgentUsage[] = AGENT_USAGE;
  protected readonly activity = ACTIVITY_ENTRIES;
  private readonly runs = RECENT_RUNS;

  protected readonly trendTotal = computed(() =>
    this.runsTrend.reduce((s, p) => s + p.count, 0),
  );

  protected agentBarTone(rate: number): string {
    if (rate >= 95) return 'from-emerald-500 to-emerald-500/60';
    if (rate >= 90) return 'from-amber-500 to-amber-500/60';
    return 'from-red-500 to-red-500/60';
  }

  protected readonly maxDuration = Math.max(...this.runs.map((r) => r.durationSeconds));

  protected readonly kpiSkeletons = [0, 1, 2, 3];
  protected readonly rowSkeletons = [0, 1, 2, 3, 4];

  protected readonly statusTotal = computed(() =>
    this.statusBreakdown.reduce((sum, s) => sum + s.value, 0),
  );

  protected readonly donutSegments = computed<readonly DonutSegment[]>(() => {
    const total = this.statusTotal();
    let offset = 0;
    return this.statusBreakdown.map((slice) => {
      const length = (slice.value / total) * DONUT_CIRCUMFERENCE;
      const seg: DonutSegment = {
        ...slice,
        dashArray: `${length.toFixed(2)} ${(DONUT_CIRCUMFERENCE - length).toFixed(2)}`,
        dashOffset: `${(-offset).toFixed(2)}`,
        percent: `${Math.round((slice.value / total) * 100)}%`,
      };
      offset += length;
      return seg;
    });
  });

  protected readonly agentBars = computed<readonly BarSegment[]>(() => {
    const max = Math.max(...this.agentUsage.map((a) => a.runs));
    return this.agentUsage.map((a) => ({
      ...a,
      widthPercent: `${((a.runs / max) * 100).toFixed(1)}%`,
    }));
  });

  protected readonly topAgentBars = computed<readonly BarSegment[]>(() => this.agentBars().slice(0, 6));

  protected activityClass(first: boolean): string {
    const base =
      'animate-in fade-in-50 slide-in-from-top-1 group relative flex items-start gap-2.5 rounded-md p-2 transition-colors duration-500';
    return first ? `${base} bg-primary/5 ring-1 ring-primary/15` : base;
  }

  protected readonly sortKey = signal<SortKey>('startedAt');
  protected readonly sortDir = signal<SortDirection>('desc');
  protected readonly page = signal(1);

  protected readonly sortedRuns = computed<readonly Run[]>(() => {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.runs].sort((a, b) => {
      const av =
        key === 'startedAt' ? a.startedMinutes : key === 'duration' ? a.durationSeconds : key === 'cost' ? a.cost : a.agent;
      const bv =
        key === 'startedAt' ? b.startedMinutes : key === 'duration' ? b.durationSeconds : key === 'cost' ? b.cost : b.agent;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.runs.length / PAGE_SIZE)));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  protected readonly paginatedRuns = computed<readonly Run[]>(() => {
    const all = this.sortedRuns();
    const start = (this.page() - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  protected readonly visibleRange = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, this.runs.length);
    return { start, end, total: this.runs.length };
  });

  protected readonly trendWidth = 720;
  protected readonly trendHeight = 200;
  protected readonly trendPad = { top: 18, right: 16, bottom: 24, left: 36 };

  protected readonly trendInner = computed(() => ({
    w: this.trendWidth - this.trendPad.left - this.trendPad.right,
    h: this.trendHeight - this.trendPad.top - this.trendPad.bottom,
  }));

  protected readonly trendMax = computed(() => Math.max(...this.runsTrend.map((p) => p.count)) * 1.15);

  protected readonly trendPoints = computed(() => {
    const { w, h } = this.trendInner();
    const max = this.trendMax();
    return this.runsTrend.map((p, i) => ({
      day: p.day,
      count: p.count,
      x: this.trendPad.left + (i / (this.runsTrend.length - 1)) * w,
      y: this.trendPad.top + h - (p.count / max) * h,
    }));
  });

  protected readonly trendLinePath = computed(() => {
    const pts = this.trendPoints();
    if (pts.length === 0) return '';
    return pts.reduce((path, p, i) => path + `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `, '').trim();
  });

  protected readonly trendAreaPath = computed(() => {
    const pts = this.trendPoints();
    if (pts.length === 0) return '';
    const baseline = this.trendPad.top + this.trendInner().h;
    const line = pts.reduce((path, p, i) => path + `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)} `, '');
    return `${line}L${pts[pts.length - 1].x.toFixed(1)},${baseline} L${pts[0].x.toFixed(1)},${baseline} Z`;
  });

  protected readonly trendYTicks = computed(() => {
    const max = this.trendMax();
    const steps = 4;
    const { h } = this.trendInner();
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = Math.round((max * i) / steps);
      const y = this.trendPad.top + h - (i / steps) * h;
      return { value, y };
    });
  });

  protected readonly hoveredIndex = signal<number | null>(null);

  protected readonly hoveredPoint = computed(() => {
    const idx = this.hoveredIndex();
    return idx === null ? null : this.trendPoints()[idx];
  });

  protected readonly trendSvg = viewChild<ElementRef<SVGSVGElement>>('trendSvg');

  private sparkPoints(series: readonly number[]): ReadonlyArray<readonly [number, number]> {
    if (series.length === 0) return [];
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    return series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return [x, y] as const;
    });
  }

  protected sparkPath(series: readonly number[]): string {
    const pts = this.sparkPoints(series);
    if (pts.length === 0) return '';
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  }

  protected sparkAreaPath(series: readonly number[]): string {
    const pts = this.sparkPoints(series);
    if (pts.length === 0) return '';
    const baseline = 28;
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return `${line} L${pts[pts.length - 1][0].toFixed(1)},${baseline} L${pts[0][0].toFixed(1)},${baseline} Z`;
  }

  protected statusVariant(status: RunStatus): BadgeVariant {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'outline';
    }
  }

  protected statusIcon(status: RunStatus): string {
    switch (status) {
      case 'success':
        return 'lucideCircleCheck';
      case 'failed':
        return 'lucideCircleX';
      case 'running':
        return 'lucideClock';
    }
  }

  protected durationBarWidth(seconds: number): string {
    return seconds === 0 ? '8%' : `${Math.min(100, (seconds / this.maxDuration) * 100).toFixed(0)}%`;
  }

  protected onTrendMove(event: MouseEvent): void {
    const svg = this.trendSvg()?.nativeElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xInChart = ((event.clientX - rect.left) / rect.width) * this.trendWidth;
    const pts = this.trendPoints();
    let nearest = 0;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - xInChart);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    this.hoveredIndex.set(nearest);
  }

  protected onTrendLeave(): void {
    this.hoveredIndex.set(null);
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
    this.page.set(1);
  }

  protected goToPage(target: number): void {
    const clamped = Math.max(1, Math.min(target, this.totalPages()));
    this.page.set(clamped);
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 400);
  }
}
