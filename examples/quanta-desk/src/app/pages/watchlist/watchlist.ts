import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { PickList } from 'primeng/picklist';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { INITIAL_WATCHLIST, Instrument, UNIVERSE } from './watchlist.data';

type Layout = 'grid' | 'list';

@Component({
  selector: 'app-watchlist',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button,
    PickList,
    PrimeTemplate,
    Skeleton,
    Tag,
    Tooltip,
  ],
  templateUrl: './watchlist.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Watchlist {
  private readonly toast = inject(MessageService);

  protected readonly isLoading = signal(true);
  protected readonly layout = signal<Layout>('grid');

  protected readonly universe: Instrument[] = UNIVERSE.filter(
    (i) => !INITIAL_WATCHLIST.includes(i.symbol),
  );
  protected readonly watched: Instrument[] = UNIVERSE.filter((i) =>
    INITIAL_WATCHLIST.includes(i.symbol),
  );

  protected readonly watchedSignal = signal<Instrument[]>([...this.watched]);

  protected readonly stats = computed(() => {
    const list = this.watchedSignal();
    const gainers = list.filter((i) => i.change > 0).length;
    const losers = list.filter((i) => i.change < 0).length;
    const avgChange =
      list.length > 0 ? list.reduce((s, i) => s + i.change, 0) / list.length : 0;
    return { gainers, losers, count: list.length, avgChange };
  });

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }

  protected setLayout(l: Layout): void {
    this.layout.set(l);
  }

  protected onMove(direction: 'toTarget' | 'toSource'): void {
    this.watchedSignal.set([...this.watched]);
    this.toast.add({
      severity: direction === 'toTarget' ? 'success' : 'info',
      summary: direction === 'toTarget' ? 'Added to watchlist' : 'Removed from watchlist',
      life: 1500,
    });
  }

  protected formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  protected formatPrice(value: number): string {
    if (value >= 10000) return value.toLocaleString();
    return value.toFixed(2);
  }

  protected sectorSeverity(sector: string): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    switch (sector) {
      case 'Technology':
        return 'info';
      case 'Financials':
        return 'success';
      case 'Energy':
        return 'danger';
      case 'Consumer':
        return 'warn';
      default:
        return 'secondary';
    }
  }
}
