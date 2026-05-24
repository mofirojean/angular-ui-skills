import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { CommonModule } from '@angular/common';

import {
  KPIS,
  Kpi,
  Mover,
  NEWS,
  NewsItem,
  PERFORMANCE,
  SECTORS,
  SectorSlice,
  TOP_MOVERS,
} from './dashboard.data';

type Period = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    Button,
    Carousel,
    UIChart,
    PrimeTemplate,
    Skeleton,
    TableModule,
    Tag,
    Tooltip,
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly isLoading = signal(true);

  protected readonly kpis: readonly Kpi[] = KPIS;
  protected readonly movers: Mover[] = [...TOP_MOVERS];
  protected readonly sectors: readonly SectorSlice[] = SECTORS;
  protected readonly news: NewsItem[] = [...NEWS];

  protected readonly periods: readonly Period[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];
  protected readonly period = signal<Period>('1M');

  protected readonly meterValue = computed(() =>
    this.sectors.map((s) => ({ label: s.label, value: s.value, color: s.color })),
  );

  protected readonly chartData = computed(() => ({
    labels: PERFORMANCE.labels,
    datasets: [
      {
        label: 'Portfolio',
        data: PERFORMANCE.portfolio,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 1.5,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: 'S&P 500',
        data: PERFORMANCE.benchmark,
        borderColor: 'rgb(113, 113, 122)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [3, 3],
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }));

  protected readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#fafafa',
        bodyColor: '#d4d4d8',
        borderColor: 'rgba(63, 63, 70, 0.5)',
        borderWidth: 1,
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgb(113, 113, 122)', font: { size: 9 }, maxRotation: 0 },
        grid: { display: false },
        border: { color: 'rgba(63, 63, 70, 0.3)' },
      },
      y: {
        ticks: { color: 'rgb(113, 113, 122)', font: { size: 9 } },
        grid: { color: 'rgba(63, 63, 70, 0.2)', drawBorder: false },
        border: { display: false },
      },
    },
  };

  protected readonly sectorChartData = computed(() => ({
    labels: this.sectors.map((s) => s.label),
    datasets: [
      {
        data: this.sectors.map((s) => s.value),
        backgroundColor: this.sectors.map((s) => s.color),
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }));

  protected readonly sectorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#fafafa',
        bodyColor: '#d4d4d8',
        borderColor: 'rgba(63, 63, 70, 0.5)',
        borderWidth: 1,
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  protected readonly carouselResponsive = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '960px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 },
  ];

  constructor() {
    // Simulated load, lets Skeleton placeholders show briefly
    setTimeout(() => this.isLoading.set(false), 450);
  }

  protected setPeriod(p: Period): void {
    this.period.set(p);
  }

  protected formatChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  protected sectorSeverity(sector: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (sector) {
      case 'Tech':
      case 'Technology':
        return 'info';
      case 'Finance':
      case 'Financials':
        return 'success';
      case 'Energy':
        return 'danger';
      case 'Auto':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  protected impactSeverity(impact: NewsItem['impact']): 'danger' | 'warn' | 'secondary' {
    switch (impact) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warn';
      case 'low':
        return 'secondary';
    }
  }
}
