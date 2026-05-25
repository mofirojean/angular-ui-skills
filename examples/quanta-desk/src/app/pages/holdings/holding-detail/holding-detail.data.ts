export interface Fundamental {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}

export interface DocumentItem {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly date: string;
  readonly thumbnail: string;
  readonly preview: string;
}

export interface AlertItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export interface ResearchNote {
  readonly id: string;
  readonly author: string;
  readonly date: string;
  readonly title: string;
  readonly snippet: string;
  readonly sentiment: 'bullish' | 'neutral' | 'bearish';
}

export interface PeriodSeries {
  readonly labels: string[];
  readonly values: number[];
}

export const FUNDAMENTALS: readonly Fundamental[] = [
  { label: 'Market cap', value: '$2.83T', hint: 'Large cap' },
  { label: 'P/E ratio', value: '28.4', hint: 'TTM' },
  { label: 'EPS', value: '$6.48', hint: 'TTM' },
  { label: 'Dividend yield', value: '0.52%', hint: 'Quarterly' },
  { label: 'Beta', value: '1.21', hint: '5y monthly' },
  { label: '52w high', value: '$199.62' },
  { label: '52w low', value: '$164.08' },
  { label: 'Avg volume', value: '52.4M' },
];

export const DOCUMENTS: readonly DocumentItem[] = [
  {
    id: 'doc-10k',
    title: '10-K Annual report 2024',
    source: 'SEC filing',
    date: 'Oct 28, 2024',
    thumbnail: 'https://picsum.photos/seed/aapl-10k/200/280',
    preview: 'https://picsum.photos/seed/aapl-10k/900/1200',
  },
  {
    id: 'doc-10q',
    title: '10-Q Q4 2024',
    source: 'SEC filing',
    date: 'Jan 30, 2025',
    thumbnail: 'https://picsum.photos/seed/aapl-10q/200/280',
    preview: 'https://picsum.photos/seed/aapl-10q/900/1200',
  },
  {
    id: 'doc-earnings',
    title: 'Q4 earnings deck',
    source: 'Investor relations',
    date: 'Feb 02, 2025',
    thumbnail: 'https://picsum.photos/seed/aapl-deck/200/280',
    preview: 'https://picsum.photos/seed/aapl-deck/900/1200',
  },
  {
    id: 'doc-analyst-gs',
    title: 'Goldman Sachs initiation',
    source: 'Analyst note',
    date: 'Mar 14, 2025',
    thumbnail: 'https://picsum.photos/seed/aapl-gs/200/280',
    preview: 'https://picsum.photos/seed/aapl-gs/900/1200',
  },
  {
    id: 'doc-analyst-ms',
    title: 'Morgan Stanley AI thesis',
    source: 'Analyst note',
    date: 'Apr 02, 2025',
    thumbnail: 'https://picsum.photos/seed/aapl-ms/200/280',
    preview: 'https://picsum.photos/seed/aapl-ms/900/1200',
  },
  {
    id: 'doc-proxy',
    title: '2024 Proxy statement',
    source: 'SEC filing',
    date: 'Dec 12, 2024',
    thumbnail: 'https://picsum.photos/seed/aapl-proxy/200/280',
    preview: 'https://picsum.photos/seed/aapl-proxy/900/1200',
  },
];

export const ALERTS: AlertItem[] = [
  {
    id: 'alert-target',
    label: 'Hit target price',
    description: 'Notify when price crosses your target ($210)',
    enabled: true,
    icon: 'pi pi-flag',
  },
  {
    id: 'alert-stop',
    label: 'Stop-loss breach',
    description: 'Notify when price drops below $165',
    enabled: true,
    icon: 'pi pi-shield',
  },
  {
    id: 'alert-volume',
    label: 'Unusual volume',
    description: 'Volume exceeds 3x 30-day average',
    enabled: false,
    icon: 'pi pi-chart-bar',
  },
  {
    id: 'alert-news',
    label: 'Material news',
    description: 'High-impact headlines tagged to this position',
    enabled: true,
    icon: 'pi pi-megaphone',
  },
  {
    id: 'alert-earnings',
    label: 'Earnings reminders',
    description: '48 hours before each earnings release',
    enabled: true,
    icon: 'pi pi-calendar',
  },
  {
    id: 'alert-dividend',
    label: 'Dividend ex-date',
    description: '5 days before the dividend ex-date',
    enabled: false,
    icon: 'pi pi-money-bill',
  },
];

export const RESEARCH_NOTES: readonly ResearchNote[] = [
  {
    id: 'note-1',
    author: 'Mofiro Jean',
    date: 'May 18, 2025',
    title: 'Adding on Services momentum',
    snippet:
      'Services hit 24% YoY growth, App Store gross margins still expanding. Vision Pro ramp doesn\'t hurt the thesis, optionality is free here.',
    sentiment: 'bullish',
  },
  {
    id: 'note-2',
    author: 'Sarah Chen',
    date: 'Apr 02, 2025',
    title: 'iPhone cycle risk into FY26',
    snippet:
      'Carrier promotions softening, Pro mix peaked. Watch ASPs through next two quarters. Trimming to neutral until inventory clears.',
    sentiment: 'neutral',
  },
  {
    id: 'note-3',
    author: 'Marcus Lee',
    date: 'Feb 14, 2025',
    title: 'AI hardware refresh thesis',
    snippet:
      'Edge inference on A19 expected to drive a meaningful upgrade cycle. Sees $250 PT on multiple expansion + 8% topline lift.',
    sentiment: 'bullish',
  },
];

const range = (n: number, start: number, vol: number, drift: number) =>
  Array.from({ length: n }, (_, i) => +(start + drift * i + (Math.sin(i / 2) + Math.cos(i / 3.7)) * vol).toFixed(2));

export const PERIOD_SERIES: Record<string, PeriodSeries> = {
  '1D': {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    values: range(24, 183, 0.45, 0.06),
  },
  '1W': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: range(7, 180, 1.2, 0.6),
  },
  '1M': {
    labels: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
    values: range(30, 172, 1.8, 0.4),
  },
  '3M': {
    labels: Array.from({ length: 13 }, (_, i) => `W${i + 1}`),
    values: range(13, 165, 3.4, 1.4),
  },
  YTD: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    values: range(5, 155, 4, 6.4),
  },
  '1Y': {
    labels: ['M-12', 'M-10', 'M-8', 'M-6', 'M-4', 'M-2', 'Now'],
    values: range(7, 148, 6, 5.2),
  },
  '5Y': {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    values: [72, 142, 138, 168, 184, 196],
  },
};

export const RISK_PROFILE = {
  beta: 1.21,
  volatility: 'Moderate',
  drawdown: '14.2%',
  sharpe: 1.42,
  rating: 'BUY',
};
