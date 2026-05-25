import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService, PrimeTemplate } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { Drawer } from 'primeng/drawer';
import { InputNumber } from 'primeng/inputnumber';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Slider } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { HOLDINGS, Holding, SECTORS, Sector, Status, TICKER_INDEX } from './holdings.data';

type StatusFilter = 'All' | Status;

@Component({
  selector: 'app-holdings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AutoComplete,
    Button,
    ContextMenu,
    Drawer,
    InputNumber,
    Menu,
    PrimeTemplate,
    Select,
    SelectButton,
    Skeleton,
    Slider,
    TableModule,
    Tag,
    Tooltip,
  ],
  templateUrl: './holdings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Holdings {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly confirmer = inject(ConfirmationService);

  protected readonly isLoading = signal(true);

  protected readonly holdings = signal<Holding[]>([...HOLDINGS]);
  protected readonly tickerIndex = TICKER_INDEX;
  protected readonly tickerSuggestions = signal<typeof TICKER_INDEX>([]);

  protected readonly searchSymbol = signal<{ symbol: string; name: string } | null>(null);
  protected readonly sectorOptions = [
    { label: 'All sectors', value: null as Sector | null },
    ...SECTORS.map((s) => ({ label: s, value: s as Sector | null })),
  ];
  protected readonly selectedSector = signal<Sector | null>(null);
  protected readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'All' },
    { label: 'Long', value: 'Long' },
    { label: 'Short', value: 'Short' },
  ];
  protected readonly statusFilter = signal<StatusFilter>('All');

  protected readonly selection = signal<Holding[]>([]);
  protected expandedRowKeys: Record<string, boolean> = {};
  protected readonly activeRow = signal<Holding | null>(null);

  protected readonly drawerOpen = signal(false);
  protected readonly addForm = this.fb.nonNullable.group({
    ticker: this.fb.nonNullable.control<{ symbol: string; name: string } | null>(null, Validators.required),
    qty: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(1)]),
    avgCost: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    status: this.fb.nonNullable.control<Status>('Long', Validators.required),
    targetWeight: this.fb.nonNullable.control(1, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  protected readonly formQty = toSignal(this.addForm.controls.qty.valueChanges, { initialValue: null });
  protected readonly formCost = toSignal(this.addForm.controls.avgCost.valueChanges, { initialValue: null });
  protected readonly formTicker = toSignal(this.addForm.controls.ticker.valueChanges, { initialValue: null });
  protected readonly formStatus = toSignal(this.addForm.controls.status.valueChanges, { initialValue: 'Long' as Status });
  protected readonly estimatedCost = computed(() => {
    const q = this.formQty();
    const c = this.formCost();
    if (!q || !c) return null;
    return q * c;
  });

  protected readonly filtered = computed(() => {
    const q = this.searchSymbol();
    const sec = this.selectedSector();
    const status = this.statusFilter();
    return this.holdings().filter((h) => {
      if (q && h.symbol !== q.symbol) return false;
      if (sec && h.sector !== sec) return false;
      return !(status !== 'All' && h.status !== status);
    });
  });

  protected readonly totals = computed(() => {
    const rows = this.filtered();
    const marketValue = rows.reduce((sum, h) => sum + h.marketValue, 0);
    const totalPL = rows.reduce((sum, h) => sum + h.totalPL, 0);
    const longCount = rows.filter((h) => h.status === 'Long').length;
    const shortCount = rows.filter((h) => h.status === 'Short').length;
    return { marketValue, totalPL, longCount, shortCount };
  });

  protected readonly rowMenuItems: MenuItem[] = [
    { label: 'Buy more', icon: 'pi pi-plus', command: () => this.fireToast('Open buy ticket', 'info') },
    { label: 'Sell', icon: 'pi pi-minus', command: () => this.fireToast('Open sell ticket', 'info') },
    { label: 'Set price alert', icon: 'pi pi-bell', command: () => this.fireToast('Alert created', 'success') },
    { label: 'Add note', icon: 'pi pi-pencil', command: () => this.fireToast('Note opened', 'info') },
    { separator: true },
    {
      label: 'Close position',
      icon: 'pi pi-times',
      styleClass: 'p-menu-item-danger',
      command: () => this.confirmClose(),
    },
  ];

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }

  protected searchTicker(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.tickerSuggestions.set(
      this.tickerIndex.filter(
        (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
      ),
    );
  }

  protected clearFilters(): void {
    this.searchSymbol.set(null);
    this.selectedSector.set(null);
    this.statusFilter.set('All');
  }

  protected onSearchChange(value: unknown): void {
    if (value && typeof value === 'object' && 'symbol' in value) {
      this.searchSymbol.set(value as { symbol: string; name: string });
    } else if (!value) {
      this.searchSymbol.set(null);
    }
  }

  protected onRowContextMenu(event: { data: Holding }): void {
    this.activeRow.set(event.data);
  }

  protected openRowMenu(menu: Menu, event: MouseEvent, row: Holding): void {
    this.activeRow.set(row);
    menu.toggle(event);
  }

  protected sectorSeverity(sector: Sector): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
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

  protected statusSeverity(status: Status): 'success' | 'danger' {
    return status === 'Long' ? 'success' : 'danger';
  }

  protected formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  protected formatCurrency(value: number): string {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(2)}`;
  }

  protected bulkAction(action: 'sell' | 'tag' | 'export'): void {
    const count = this.selection().length;
    this.fireToast(`${action} on ${count} position${count === 1 ? '' : 's'}`, 'info');
    this.selection.set([]);
  }

  protected onWeightChange(row: Holding, value: unknown): void {
    if (typeof value === 'number') {
      row.targetWeight = value;
    }
  }

  protected submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.fireToast(`Added ${v.ticker?.symbol} (${v.qty} @ $${v.avgCost})`, 'success');
    this.addForm.reset({ ticker: null, qty: null, avgCost: null, status: 'Long', targetWeight: 1 });
    this.drawerOpen.set(false);
  }

  private confirmClose(): void {
    const row = this.activeRow();
    if (!row) return;
    this.confirmer.confirm({
      header: `Close ${row.symbol}`,
      message: `Closing this position will sell all ${row.qty} shares. Continue?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Close position',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { variant: 'text' },
      accept: () => {
        this.holdings.update((list) => list.filter((h) => h.symbol !== row.symbol));
        this.fireToast(`${row.symbol} closed`, 'success');
      },
    });
  }

  private fireToast(detail: string, severity: 'success' | 'info' | 'warn' | 'error'): void {
    this.toast.add({ severity, summary: detail, life: 2000 });
  }
}
