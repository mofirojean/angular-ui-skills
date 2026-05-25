import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, PrimeTemplate, TreeNode } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { UIChart } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { Editor } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { Skeleton } from 'primeng/skeleton';
import { Splitter } from 'primeng/splitter';
import { Tabs, Tab, TabList, TabPanel, TabPanels } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';

import { HOLDINGS, Holding, TaxLot } from '../holdings.data';
import {
  ALERTS,
  AlertItem,
  DOCUMENTS,
  DocumentItem,
  Fundamental,
  FUNDAMENTALS,
  PERIOD_SERIES,
  RESEARCH_NOTES,
  ResearchNote,
  RISK_PROFILE,
} from './holding-detail.data';

type Period = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | '5Y';

@Component({
  selector: 'app-holding-detail',
  imports: [
    CommonModule,
    FormsModule,
    Breadcrumb,
    Button,
    UIChart,
    DatePicker,
    Editor,
    FileUploadModule,
    PrimeTemplate,
    Skeleton,
    Splitter,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tag,
    ToggleSwitch,
    Tooltip,
    TreeTableModule,
  ],
  templateUrl: './holding-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingDetail {
  private readonly toast = inject(MessageService);

  readonly ticker = input<string>('');

  protected readonly isLoading = signal(true);

  protected readonly holding = computed<Holding | null>(() => {
    const t = this.ticker();
    return HOLDINGS.find((h) => h.symbol === t) ?? null;
  });

  protected readonly periods: readonly Period[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y'];
  protected readonly period = signal<Period>('1M');
  protected readonly customRange = signal<Date[] | null>(null);

  protected readonly fundamentals: readonly Fundamental[] = FUNDAMENTALS;
  protected readonly documents = signal<DocumentItem[]>([...DOCUMENTS]);
  protected readonly alerts = signal<AlertItem[]>(ALERTS.map((a) => ({ ...a })));
  protected readonly notes: readonly ResearchNote[] = RESEARCH_NOTES;
  protected readonly risk = RISK_PROFILE;

  protected readonly noteDraft = signal('');

  protected readonly activeTab = signal<'overview' | 'taxlots' | 'notes' | 'documents' | 'alerts'>('overview');

  protected readonly chartData = computed(() => {
    const series = PERIOD_SERIES[this.period()];
    return {
      labels: series.labels,
      datasets: [
        {
          label: this.ticker(),
          data: series.values,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
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

  protected readonly taxLotTree = computed<TreeNode[]>(() => {
    const h = this.holding();
    if (!h) return [];

    const groupByTerm = (term: 'Long' | 'Short', lots: TaxLot[]): TreeNode => {
      const totalQty = lots.reduce((s, l) => s + l.qty, 0);
      const totalGain = lots.reduce((s, l) => s + l.gain, 0);
      const totalCost = lots.reduce((s, l) => s + l.costBasis, 0);
      const totalValue = lots.reduce((s, l) => s + l.currentValue, 0);
      return {
        data: {
          label: `${term}-term`,
          isGroup: true,
          qty: totalQty,
          costBasis: totalCost,
          currentValue: totalValue,
          gain: totalGain,
          gainPct: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
          term,
        },
        expanded: true,
        children: lots.map((lot) => ({
          data: {
            label: lot.acquired,
            isGroup: false,
            qty: lot.qty,
            costBasis: lot.costBasis,
            currentValue: lot.currentValue,
            gain: lot.gain,
            gainPct: lot.gainPct,
            term,
          },
        })),
      };
    };

    const longLots = h.taxLots.filter((l) => l.term === 'Long');
    const shortLots = h.taxLots.filter((l) => l.term === 'Short');
    const result: TreeNode[] = [];
    if (longLots.length) result.push(groupByTerm('Long', longLots));
    if (shortLots.length) result.push(groupByTerm('Short', shortLots));
    return result;
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Holdings', routerLink: '/holdings' },
    { label: this.ticker() || 'Detail' },
  ]);
  protected readonly breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }

  protected setPeriod(p: Period): void {
    this.period.set(p);
  }

  protected toggleAlert(id: string, enabled: boolean): void {
    this.alerts.update((list) =>
      list.map((a) => (a.id === id ? { ...a, enabled } : a)),
    );
    this.toast.add({
      severity: enabled ? 'success' : 'info',
      summary: enabled ? 'Alert enabled' : 'Alert paused',
      life: 1500,
    });
  }

  protected docIcon(source: string): string {
    if (source.includes('SEC')) return 'pi pi-file-pdf';
    if (source.includes('Analyst')) return 'pi pi-bookmark';
    if (source.includes('Investor')) return 'pi pi-chart-line';
    return 'pi pi-file';
  }

  protected docIconTone(source: string): string {
    if (source.includes('SEC')) return 'text-rose-500';
    if (source.includes('Analyst')) return 'text-amber-500';
    if (source.includes('Investor')) return 'text-emerald-500';
    return 'text-muted-color';
  }

  protected removeDocument(id: string): void {
    this.documents.update((list) => list.filter((d) => d.id !== id));
    this.toast.add({ severity: 'info', summary: 'Document removed', life: 1500 });
  }

  protected onFilesSelected(event: { files: File[] }): void {
    const count = event.files.length;
    if (!count) return;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newDocs: DocumentItem[] = event.files.map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      title: file.name,
      source: 'Uploaded',
      date: now,
      thumbnail: '',
      preview: '',
    }));
    this.documents.update((list) => [...newDocs, ...list]);
    this.toast.add({
      severity: 'success',
      summary: `${count} file${count === 1 ? '' : 's'} added`,
      life: 1800,
    });
  }

  protected saveNote(): void {
    const value = this.noteDraft();
    if (!value || value === '<p><br></p>') return;
    this.toast.add({ severity: 'success', summary: 'Note saved', life: 1500 });
    this.noteDraft.set('');
  }

  protected formatCurrency(value: number): string {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(2)}`;
  }

  protected formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  protected sentimentSeverity(s: ResearchNote['sentiment']): 'success' | 'secondary' | 'danger' {
    return s === 'bullish' ? 'success' : s === 'bearish' ? 'danger' : 'secondary';
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
