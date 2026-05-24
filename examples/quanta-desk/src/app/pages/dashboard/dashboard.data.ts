export interface Kpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: number;
  readonly deltaLabel: string;
  readonly icon: string;
  readonly spark: string;
  readonly tone: 'positive' | 'negative' | 'neutral';
}

export interface Mover {
  readonly symbol: string;
  readonly name: string;
  readonly sector: string;
  readonly price: number;
  readonly change: number;
  readonly volume: string;
  readonly spark: string;
}

export interface SectorSlice {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

export interface NewsItem {
  readonly id: string;
  readonly category: 'Markets' | 'Macro' | 'Earnings' | 'Crypto' | 'Tech';
  readonly title: string;
  readonly source: string;
  readonly time: string;
  readonly impact: 'high' | 'medium' | 'low';
}

export const KPIS: readonly Kpi[] = [
  {
    id: 'portfolio',
    label: 'Portfolio value',
    value: '$48.21M',
    delta: 0.59,
    deltaLabel: '+$284.3K',
    icon: 'pi pi-wallet',
    spark: '0,18 6,16 12,17 18,12 24,14 30,10 36,8 42,5 48,7 54,3 60,1',
    tone: 'positive',
  },
  {
    id: 'day-pl',
    label: 'Day P/L',
    value: '+$284,312',
    delta: 0.59,
    deltaLabel: '+0.59%',
    icon: 'pi pi-chart-line',
    spark: '0,15 6,12 12,14 18,10 24,11 30,9 36,7 42,8 48,4 54,5 60,2',
    tone: 'positive',
  },
  {
    id: 'cash',
    label: 'Cash & equivalents',
    value: '$2.14M',
    delta: -2.4,
    deltaLabel: '-$52.8K',
    icon: 'pi pi-money-bill',
    spark: '0,4 6,5 12,7 18,8 24,9 30,11 36,12 42,10 48,13 54,12 60,15',
    tone: 'negative',
  },
  {
    id: 'buying-power',
    label: 'Buying power',
    value: '$4.32M',
    delta: 1.18,
    deltaLabel: '+$50.2K',
    icon: 'pi pi-bolt',
    spark: '0,14 6,11 12,10 18,12 24,8 30,9 36,6 42,7 48,5 54,4 60,3',
    tone: 'positive',
  },
];

export const TOP_MOVERS: readonly Mover[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    sector: 'Tech',
    price: 872.45,
    change: 4.62,
    volume: '38.2M',
    spark: '0,11 7,8 14,9 21,5 28,4 35,2 42,1',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Tech',
    price: 184.32,
    change: 1.24,
    volume: '52.4M',
    spark: '0,9 7,7 14,8 21,5 28,6 35,3 42,2',
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan',
    sector: 'Finance',
    price: 198.74,
    change: 0.82,
    volume: '8.1M',
    spark: '0,8 7,7 14,6 21,7 28,5 35,4 42,3',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    sector: 'Auto',
    price: 248.91,
    change: -3.12,
    volume: '94.8M',
    spark: '0,3 7,4 14,6 21,5 28,8 35,7 42,10',
  },
  {
    symbol: 'XOM',
    name: 'ExxonMobil',
    sector: 'Energy',
    price: 109.42,
    change: -1.46,
    volume: '15.7M',
    spark: '0,4 7,3 14,5 21,4 28,7 35,6 42,9',
  },
];

export const SECTORS: readonly SectorSlice[] = [
  { label: 'Technology', value: 38, color: 'var(--p-primary-color)' },
  { label: 'Financials', value: 22, color: '#3b82f6' },
  { label: 'Healthcare', value: 14, color: '#10b981' },
  { label: 'Consumer', value: 12, color: '#f59e0b' },
  { label: 'Energy', value: 8, color: '#ef4444' },
  { label: 'Other', value: 6, color: '#71717a' },
];

export const NEWS: readonly NewsItem[] = [
  {
    id: 'n1',
    category: 'Markets',
    title: 'Fed signals slower rate path, dollar dips to two-month low',
    source: 'Reuters',
    time: '6m ago',
    impact: 'high',
  },
  {
    id: 'n2',
    category: 'Earnings',
    title: 'NVIDIA crushes Q2 estimates, raises FY guidance on AI demand',
    source: 'Bloomberg',
    time: '24m ago',
    impact: 'high',
  },
  {
    id: 'n3',
    category: 'Crypto',
    title: 'Bitcoin breaks $68K as spot ETF inflows hit fresh weekly high',
    source: 'CoinDesk',
    time: '1h ago',
    impact: 'medium',
  },
  {
    id: 'n4',
    category: 'Macro',
    title: 'EU inflation prints below consensus, ECB cut now fully priced',
    source: 'Financial Times',
    time: '2h ago',
    impact: 'medium',
  },
  {
    id: 'n5',
    category: 'Tech',
    title: 'Anthropic raises Series E at $200B valuation, targets enterprise',
    source: 'The Information',
    time: '3h ago',
    impact: 'medium',
  },
  {
    id: 'n6',
    category: 'Markets',
    title: 'Brent crude steady near $82 as OPEC+ extends voluntary cuts',
    source: 'WSJ',
    time: '4h ago',
    impact: 'low',
  },
];

// 30-day performance series, portfolio vs S&P 500 benchmark
const days = Array.from({ length: 30 }, (_, i) => i + 1);
const portfolioBase = 100;
const portfolioSeries = [
  100, 100.4, 99.8, 100.6, 101.2, 100.9, 101.7, 102.3, 101.8, 102.5,
  103.1, 102.6, 103.4, 104.2, 103.8, 104.6, 105.2, 104.8, 105.6, 106.3,
  106.0, 106.9, 107.4, 106.8, 107.6, 108.3, 108.0, 108.7, 109.2, 109.6,
];
const benchmarkSeries = [
  100, 100.2, 99.9, 100.3, 100.7, 100.5, 100.9, 101.2, 100.9, 101.3,
  101.6, 101.4, 101.8, 102.2, 101.9, 102.4, 102.7, 102.5, 102.9, 103.2,
  103.0, 103.4, 103.7, 103.4, 103.8, 104.2, 104.0, 104.4, 104.7, 105.0,
];

export const PERFORMANCE = {
  labels: days.map((d) => `D${d}`),
  portfolio: portfolioSeries,
  benchmark: benchmarkSeries,
  base: portfolioBase,
};
