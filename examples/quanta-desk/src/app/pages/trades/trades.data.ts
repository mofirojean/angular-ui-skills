import { UNIVERSE } from '../watchlist/watchlist.data';

export type Side = 'Buy' | 'Sell';
export type OrderType = 'market' | 'limit' | 'stop';
export type Status = 'Filled' | 'Partial' | 'Pending' | 'Cancelled' | 'Rejected';

export interface Trade {
  readonly id: string;
  readonly date: Date;
  readonly symbol: string;
  readonly name: string;
  readonly side: Side;
  readonly orderType: OrderType;
  readonly qty: number;
  readonly filledQty: number;
  readonly price: number;
  readonly total: number;
  readonly fees: number;
  readonly status: Status;
  readonly venue: string;
  readonly account: string;
}

const VENUES = ['NYSE', 'NASDAQ', 'ARCA', 'BATS', 'CBOE'];
const ACCOUNTS = ['Main', 'Roth IRA', 'Trading'];
const STATUSES: Status[] = ['Filled', 'Filled', 'Filled', 'Filled', 'Partial', 'Pending', 'Cancelled', 'Rejected'];

const seedRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const rng = seedRandom(2026);

const buildTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const universe = UNIVERSE[Math.floor(rng() * UNIVERSE.length)];
    const side: Side = rng() > 0.5 ? 'Buy' : 'Sell';
    const ot: OrderType = (['market', 'limit', 'stop'] as const)[Math.floor(rng() * 3)];
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];
    const qty = Math.floor(rng() * 480) + 20;
    const filledQty =
      status === 'Filled' ? qty :
      status === 'Partial' ? Math.floor(qty * (0.3 + rng() * 0.4)) :
      0;
    const price = +(universe.price * (0.96 + rng() * 0.08)).toFixed(2);
    const total = +(price * (filledQty || qty)).toFixed(2);
    const fees = +(total * 0.00035).toFixed(2);
    const daysAgo = Math.floor(rng() * 30);
    const minutesAgo = Math.floor(rng() * 60 * 12);
    trades.push({
      id: `T-${String(100000 + i).slice(1)}`,
      date: new Date(now - daysAgo * 86_400_000 - minutesAgo * 60_000),
      symbol: universe.symbol,
      name: universe.name,
      side,
      orderType: ot,
      qty,
      filledQty,
      price,
      total,
      fees,
      status,
      venue: VENUES[Math.floor(rng() * VENUES.length)],
      account: ACCOUNTS[Math.floor(rng() * ACCOUNTS.length)],
    });
  }
  return trades.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const TRADES: Trade[] = buildTrades(120);

export const TRADE_STATUSES: { label: string; value: Status }[] = [
  { label: 'Filled', value: 'Filled' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Rejected', value: 'Rejected' },
];

export const TRADE_SIDES: { label: string; value: Side | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Buy', value: 'Buy' },
  { label: 'Sell', value: 'Sell' },
];
