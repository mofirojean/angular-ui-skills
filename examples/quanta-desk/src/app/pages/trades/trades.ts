import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MultiSelect } from 'primeng/multiselect';
import { Paginator } from 'primeng/paginator';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { Side, Status, Trade, TRADE_SIDES, TRADE_STATUSES, TRADES } from './trades.data';
import { TradeDetail } from './trade-detail';
import { UNIVERSE } from '../watchlist/watchlist.data';

@Component({
  selector: 'app-trades',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    AutoComplete,
    Button,
    DatePicker,
    DynamicDialogModule,
    MultiSelect,
    Paginator,
    PrimeTemplate,
    SelectButton,
    Skeleton,
    TableModule,
    Tag,
    Tooltip,
  ],
  providers: [DialogService],
  templateUrl: './trades.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trades {
  private readonly dialog = inject(DialogService);

  protected readonly isLoading = signal(true);
  protected readonly all = signal<Trade[]>([...TRADES]);

  // filters
  protected readonly dateRange = signal<Date[] | null>(null);
  protected readonly statusFilter = signal<Status[]>([]);
  protected readonly sideFilter = signal<Side | 'All'>('All');
  protected readonly instrument = signal<{ symbol: string; name: string } | null>(null);

  protected readonly tickerIndex = UNIVERSE.map((u) => ({ symbol: u.symbol, name: u.name }));
  protected readonly tickerSuggestions = signal<typeof this.tickerIndex>([]);

  protected readonly statusOptions = TRADE_STATUSES;
  protected readonly sideOptions = TRADE_SIDES;

  // pagination
  protected readonly first = signal(0);
  protected readonly rows = signal(20);

  protected readonly filtered = computed(() => {
    const dr = this.dateRange();
    const statuses = this.statusFilter();
    const side = this.sideFilter();
    const ins = this.instrument();
    return this.all().filter((t) => {
      if (dr && dr[0] && dr[1]) {
        const ts = t.date.getTime();
        if (ts < dr[0].getTime() || ts > dr[1].getTime() + 86_400_000) return false;
      }
      if (statuses.length > 0 && !statuses.includes(t.status)) return false;
      if (side !== 'All' && t.side !== side) return false;
      if (ins && t.symbol !== ins.symbol) return false;
      return true;
    });
  });

  protected readonly pageRows = computed(() => {
    const start = this.first();
    return this.filtered().slice(start, start + this.rows());
  });

  protected readonly stats = computed(() => {
    const rows = this.filtered();
    const total = rows.reduce((s, t) => s + t.total, 0);
    const buys = rows.filter((t) => t.side === 'Buy').length;
    const sells = rows.filter((t) => t.side === 'Sell').length;
    const filled = rows.filter((t) => t.status === 'Filled').length;
    return { total, buys, sells, filled, count: rows.length };
  });

  constructor() {
    setTimeout(() => this.isLoading.set(false), 300);
  }

  protected searchTicker(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.tickerSuggestions.set(
      this.tickerIndex.filter(
        (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
      ),
    );
  }

  protected onPageChange(event: { first?: number; rows?: number }): void {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.rows.set(event.rows);
  }

  protected clearFilters(): void {
    this.dateRange.set(null);
    this.statusFilter.set([]);
    this.sideFilter.set('All');
    this.instrument.set(null);
    this.first.set(0);
  }

  protected openDetail(trade: Trade): void {
    this.dialog.open(TradeDetail, {
      header: `${trade.side} ${trade.symbol}`,
      data: trade,
      width: '32rem',
      modal: true,
      closable: true,
      dismissableMask: true,
    });
  }

  protected statusSeverity(status: Status): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    switch (status) {
      case 'Filled':
        return 'success';
      case 'Partial':
        return 'warn';
      case 'Pending':
        return 'info';
      case 'Cancelled':
        return 'secondary';
      case 'Rejected':
        return 'danger';
    }
  }

  protected formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  protected hasFilters = computed(
    () =>
      this.dateRange() !== null ||
      this.statusFilter().length > 0 ||
      this.sideFilter() !== 'All' ||
      this.instrument() !== null,
  );
}
