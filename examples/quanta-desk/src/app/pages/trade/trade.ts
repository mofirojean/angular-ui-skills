import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { UIChart } from 'primeng/chart';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import { Splitter } from 'primeng/splitter';

import { UNIVERSE } from '../watchlist/watchlist.data';

type Side = 'Buy' | 'Sell';
type OrderType = 'market' | 'limit' | 'stop';

interface TickerOption {
  symbol: string;
  name: string;
  price: number;
  sector: string;
  change: number;
  spark: string;
}

@Component({
  selector: 'app-trade',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoComplete,
    Button,
    UIChart,
    InputNumber,
    SelectButton,
    Slider,
    Splitter,
  ],
  templateUrl: './trade.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trade {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly confirmer = inject(ConfirmationService);
  private readonly router = inject(Router);

  protected readonly cashAvailable = 4_320_000;

  protected readonly tickerIndex: TickerOption[] = UNIVERSE.map((u) => ({
    symbol: u.symbol,
    name: u.name,
    price: u.price,
    sector: u.sector,
    change: u.change,
    spark: u.spark,
  }));
  protected readonly tickerSuggestions = signal<TickerOption[]>([]);
  protected readonly ticker = signal<TickerOption | null>(this.tickerIndex[0] ?? null);

  protected readonly sideOptions: { label: string; value: Side }[] = [
    { label: 'Buy', value: 'Buy' },
    { label: 'Sell', value: 'Sell' },
  ];

  protected readonly orderTypeOptions: { label: string; value: OrderType }[] = [
    { label: 'Market', value: 'market' },
    { label: 'Limit', value: 'limit' },
    { label: 'Stop', value: 'stop' },
  ];

  protected readonly side = signal<Side>('Buy');
  protected readonly orderType = signal<OrderType>('market');
  protected readonly limitPrice = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    qty: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(1)]),
    sliderPct: this.fb.nonNullable.control(10),
    timeInForce: this.fb.nonNullable.control<'day' | 'gtc'>('day'),
  });

  protected readonly timeInForceOptions = [
    { label: 'Day', value: 'day' },
    { label: 'GTC', value: 'gtc' },
  ];

  protected readonly submitting = signal(false);

  protected readonly quickPercents: readonly number[] = [10, 25, 50, 75, 100];

  protected readonly estimatedTotal = computed(() => {
    const t = this.ticker();
    const q = this.form.controls.qty.value;
    if (!t || !q) return 0;
    const px = this.orderType() === 'market' ? t.price : (this.limitPrice() ?? t.price);
    return q * px;
  });

  protected readonly costPctOfCash = computed(() => {
    const c = this.estimatedTotal();
    if (!c) return 0;
    return Math.min(100, (c / this.cashAvailable) * 100);
  });

  protected readonly chartData = computed(() => {
    const t = this.ticker();
    if (!t) return null;
    const len = 60;
    const base = t.price;
    const arr = Array.from({ length: len }, (_, i) => {
      const noise = Math.sin(i / 4.2) * (base * 0.005) + Math.cos(i / 7.3) * (base * 0.003);
      const drift = (t.change / 100) * base * (i / len);
      return +(base - drift * 0.6 + noise).toFixed(2);
    });
    arr[len - 1] = base;
    const sideTone = t.change >= 0 ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)';
    const sideFill = t.change >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)';
    return {
      labels: Array.from({ length: len }, (_, i) => `${i}`),
      datasets: [
        {
          label: t.symbol,
          data: arr,
          borderColor: sideTone,
          backgroundColor: sideFill,
          borderWidth: 1.5,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
        },
      ],
    };
  });

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
      },
    },
    scales: {
      x: { display: false },
      y: {
        ticks: { color: 'rgb(113, 113, 122)', font: { size: 9 } },
        grid: { color: 'rgba(63, 63, 70, 0.2)' },
        border: { display: false },
      },
    },
  };

  protected readonly bid = computed(() => {
    const t = this.ticker();
    if (!t) return 0;
    return +(t.price - 0.02).toFixed(2);
  });

  protected readonly ask = computed(() => {
    const t = this.ticker();
    if (!t) return 0;
    return +(t.price + 0.02).toFixed(2);
  });

  protected readonly dayRange = computed(() => {
    const t = this.ticker();
    if (!t) return { low: 0, high: 0 };
    return { low: +(t.price * 0.985).toFixed(2), high: +(t.price * 1.014).toFixed(2) };
  });

  protected searchTicker(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.tickerSuggestions.set(
      this.tickerIndex.filter(
        (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
      ),
    );
  }

  protected onTickerChange(value: TickerOption | null): void {
    this.ticker.set(value);
    this.limitPrice.set(value?.price ?? null);
  }

  protected setSide(s: Side): void {
    this.side.set(s);
  }

  protected setOrderType(o: OrderType): void {
    this.orderType.set(o);
  }

  protected setQuickPct(pct: number): void {
    this.form.controls.sliderPct.setValue(pct);
    const t = this.ticker();
    if (!t) return;
    const amount = (this.cashAvailable * pct) / 100;
    const calc = Math.floor(amount / t.price);
    if (calc > 0) {
      this.form.controls.qty.setValue(calc);
    }
  }

  protected onSliderChange(pct: number): void {
    this.setQuickPct(pct);
  }

  protected get canPlace(): boolean {
    return this.form.valid && !!this.ticker();
  }

  protected confirmPlace(): void {
    if (!this.canPlace) {
      this.form.markAllAsTouched();
      return;
    }
    const t = this.ticker()!;
    const q = this.form.controls.qty.value!;
    const total = this.estimatedTotal();
    const ot = this.orderType();
    const sd = this.side();
    this.confirmer.confirm({
      header: `${sd} ${q} ${t.symbol}?`,
      message: `${ot.toUpperCase()} order, estimated total ${this.formatCurrency(total)}. Confirm to place.`,
      icon: 'pi pi-check-circle',
      acceptLabel: 'Place order',
      rejectLabel: 'Cancel',
      acceptButtonProps: {
        severity: sd === 'Buy' ? 'success' : 'danger',
        size: 'small',
      },
      rejectButtonProps: { variant: 'text', size: 'small' },
      accept: () => this.execute(),
    });
  }

  private execute(): void {
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      const t = this.ticker()!;
      const q = this.form.controls.qty.value!;
      this.toast.add({
        severity: 'success',
        summary: `${this.side()} order placed`,
        detail: `${q} ${t.symbol} · ${this.orderType()} · ${this.formatCurrency(this.estimatedTotal())}`,
        life: 2500,
      });
      this.router.navigateByUrl('/trades');
    }, 900);
  }

  protected formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  }

  protected formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
}
