export type Status = 'Long' | 'Short';
export type Sector =
  | 'Technology'
  | 'Financials'
  | 'Healthcare'
  | 'Consumer'
  | 'Energy'
  | 'Industrials'
  | 'Materials'
  | 'Utilities';

export interface TaxLot {
  readonly id: string;
  readonly acquired: string;
  readonly qty: number;
  readonly costBasis: number;
  readonly currentValue: number;
  readonly gain: number;
  readonly gainPct: number;
  readonly term: 'Short' | 'Long';
}

export interface Holding {
  symbol: string;
  name: string;
  sector: Sector;
  status: Status;
  qty: number;
  avgCost: number;
  price: number;
  marketValue: number;
  dayChangePct: number;
  totalPL: number;
  totalPLPct: number;
  targetWeight: number;
  taxLots: TaxLot[];
}

export const SECTORS: readonly Sector[] = [
  'Technology',
  'Financials',
  'Healthcare',
  'Consumer',
  'Energy',
  'Industrials',
  'Materials',
  'Utilities',
];

const computed = (
  symbol: string,
  name: string,
  sector: Sector,
  status: Status,
  qty: number,
  avgCost: number,
  price: number,
  dayChangePct: number,
  targetWeight: number,
  lots: TaxLot[],
): Holding => {
  const marketValue = qty * price;
  const totalPL = (price - avgCost) * qty * (status === 'Short' ? -1 : 1);
  const totalPLPct = ((price - avgCost) / avgCost) * 100 * (status === 'Short' ? -1 : 1);
  return {
    symbol,
    name,
    sector,
    status,
    qty,
    avgCost,
    price,
    marketValue,
    dayChangePct,
    totalPL,
    totalPLPct,
    targetWeight,
    taxLots: lots,
  };
};

const lot = (
  id: string,
  acquired: string,
  qty: number,
  costBasis: number,
  currentValue: number,
  term: 'Short' | 'Long',
): TaxLot => ({
  id,
  acquired,
  qty,
  costBasis,
  currentValue,
  gain: currentValue - costBasis,
  gainPct: ((currentValue - costBasis) / costBasis) * 100,
  term,
});

export const HOLDINGS: Holding[] = [
  computed('AAPL', 'Apple Inc.', 'Technology', 'Long', 1200, 142.5, 184.32, 1.24, 8.5, [
    lot('aapl-1', '2023-04-12', 500, 71250, 92160, 'Long'),
    lot('aapl-2', '2023-09-18', 400, 64200, 73728, 'Long'),
    lot('aapl-3', '2024-02-22', 300, 35100, 55296, 'Short'),
  ]),
  computed('NVDA', 'NVIDIA Corp.', 'Technology', 'Long', 320, 412.18, 872.45, 4.62, 12.0, [
    lot('nvda-1', '2023-01-30', 120, 49461, 104694, 'Long'),
    lot('nvda-2', '2023-07-11', 100, 41218, 87245, 'Long'),
    lot('nvda-3', '2024-03-04', 100, 41218, 87245, 'Short'),
  ]),
  computed('MSFT', 'Microsoft', 'Technology', 'Long', 800, 310.4, 412.78, 0.84, 7.2, [
    lot('msft-1', '2023-02-14', 400, 124160, 165112, 'Long'),
    lot('msft-2', '2023-11-09', 400, 124160, 165112, 'Long'),
  ]),
  computed('TSLA', 'Tesla', 'Consumer', 'Short', 240, 268.5, 248.91, -3.12, 1.8, [
    lot('tsla-1', '2024-01-18', 240, 64440, 59738, 'Short'),
  ]),
  computed('JPM', 'JPMorgan Chase', 'Financials', 'Long', 600, 162.3, 198.74, 0.82, 4.5, [
    lot('jpm-1', '2022-11-04', 300, 48690, 59622, 'Long'),
    lot('jpm-2', '2023-08-21', 300, 48690, 59622, 'Long'),
  ]),
  computed('GOOGL', 'Alphabet (Class A)', 'Technology', 'Long', 480, 125.9, 152.34, 1.42, 5.6, [
    lot('googl-1', '2023-03-10', 240, 30216, 36562, 'Long'),
    lot('googl-2', '2023-12-01', 240, 30216, 36562, 'Long'),
  ]),
  computed('AMZN', 'Amazon', 'Consumer', 'Long', 350, 138.7, 178.22, -0.42, 4.8, [
    lot('amzn-1', '2023-05-22', 350, 48545, 62377, 'Long'),
  ]),
  computed('META', 'Meta Platforms', 'Technology', 'Long', 200, 310.0, 492.81, 2.18, 4.1, [
    lot('meta-1', '2023-06-15', 200, 62000, 98562, 'Long'),
  ]),
  computed('XOM', 'ExxonMobil', 'Energy', 'Long', 800, 96.4, 109.42, -1.46, 3.2, [
    lot('xom-1', '2023-02-08', 400, 38560, 43768, 'Long'),
    lot('xom-2', '2023-10-19', 400, 38560, 43768, 'Long'),
  ]),
  computed('UNH', 'UnitedHealth', 'Healthcare', 'Long', 180, 488.0, 524.66, 0.28, 3.6, [
    lot('unh-1', '2023-09-04', 180, 87840, 94439, 'Long'),
  ]),
  computed('BRK.B', 'Berkshire B', 'Financials', 'Long', 250, 332.0, 414.72, 0.16, 3.5, [
    lot('brkb-1', '2023-01-12', 250, 83000, 103680, 'Long'),
  ]),
  computed('LLY', 'Eli Lilly', 'Healthcare', 'Long', 100, 612.0, 762.49, 1.04, 2.8, [
    lot('lly-1', '2023-08-30', 100, 61200, 76249, 'Long'),
  ]),
  computed('V', 'Visa', 'Financials', 'Long', 400, 232.0, 278.41, 0.62, 3.4, [
    lot('v-1', '2023-04-20', 400, 92800, 111364, 'Long'),
  ]),
  computed('MA', 'Mastercard', 'Financials', 'Long', 300, 372.0, 462.18, 0.48, 3.0, [
    lot('ma-1', '2023-05-11', 300, 111600, 138654, 'Long'),
  ]),
  computed('AVGO', 'Broadcom', 'Technology', 'Long', 150, 612.0, 1342.5, 3.12, 4.2, [
    lot('avgo-1', '2023-07-07', 150, 91800, 201375, 'Long'),
  ]),
  computed('AMD', 'AMD', 'Technology', 'Short', 400, 158.2, 142.6, -2.18, 1.2, [
    lot('amd-1', '2024-02-12', 400, 63280, 57040, 'Short'),
  ]),
  computed('NFLX', 'Netflix', 'Consumer', 'Long', 90, 412.0, 612.4, 0.84, 1.4, [
    lot('nflx-1', '2023-11-22', 90, 37080, 55116, 'Long'),
  ]),
  computed('CRM', 'Salesforce', 'Technology', 'Long', 250, 198.4, 312.5, 1.62, 2.1, [
    lot('crm-1', '2023-06-30', 250, 49600, 78125, 'Long'),
  ]),
  computed('ORCL', 'Oracle', 'Technology', 'Long', 380, 102.0, 142.87, 0.42, 2.3, [
    lot('orcl-1', '2023-09-14', 380, 38760, 54291, 'Long'),
  ]),
  computed('CVX', 'Chevron', 'Energy', 'Long', 280, 152.0, 162.41, -0.84, 2.2, [
    lot('cvx-1', '2023-03-28', 280, 42560, 45475, 'Long'),
  ]),
  computed('PFE', 'Pfizer', 'Healthcare', 'Short', 1200, 36.4, 28.42, -1.62, 0.7, [
    lot('pfe-1', '2024-01-05', 1200, 43680, 34104, 'Short'),
  ]),
  computed('KO', 'Coca-Cola', 'Consumer', 'Long', 700, 58.2, 62.41, 0.12, 1.8, [
    lot('ko-1', '2022-12-08', 700, 40740, 43687, 'Long'),
  ]),
  computed('PG', 'Procter & Gamble', 'Consumer', 'Long', 350, 148.0, 162.5, 0.18, 1.4, [
    lot('pg-1', '2023-02-20', 350, 51800, 56875, 'Long'),
  ]),
  computed('HD', 'Home Depot', 'Consumer', 'Long', 180, 312.0, 358.42, 0.94, 1.6, [
    lot('hd-1', '2023-04-04', 180, 56160, 64516, 'Long'),
  ]),
];

export const TICKER_INDEX: { symbol: string; name: string }[] = HOLDINGS.map((h) => ({
  symbol: h.symbol,
  name: h.name,
}));
