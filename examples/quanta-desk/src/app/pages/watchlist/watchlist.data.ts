export type Sector = 'Technology' | 'Financials' | 'Healthcare' | 'Consumer' | 'Energy' | 'Crypto' | 'Industrials';

export interface Instrument {
  readonly symbol: string;
  readonly name: string;
  readonly sector: Sector;
  readonly price: number;
  readonly change: number;
  readonly volume: string;
  readonly spark: string;
  readonly marketCap: string;
}

export const UNIVERSE: readonly Instrument[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 184.32, change: 1.24, volume: '52.4M', marketCap: '$2.83T', spark: '0,9 7,7 14,8 21,5 28,6 35,3 42,2' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', price: 872.45, change: 4.62, volume: '38.2M', marketCap: '$2.15T', spark: '0,11 7,8 14,9 21,5 28,4 35,2 42,1' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer', price: 248.91, change: -3.12, volume: '94.8M', marketCap: '$789B', spark: '0,3 7,4 14,6 21,5 28,8 35,7 42,10' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', price: 412.78, change: 0.84, volume: '24.1M', marketCap: '$3.07T', spark: '0,9 7,7 14,8 21,6 28,5 35,4 42,3' },
  { symbol: 'GOOGL', name: 'Alphabet (A)', sector: 'Technology', price: 152.34, change: 1.42, volume: '18.7M', marketCap: '$1.92T', spark: '0,8 7,6 14,7 21,5 28,4 35,3 42,2' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer', price: 178.22, change: -0.42, volume: '35.6M', marketCap: '$1.85T', spark: '0,5 7,4 14,5 21,6 28,5 35,7 42,8' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', price: 492.81, change: 2.18, volume: '14.2M', marketCap: '$1.24T', spark: '0,10 7,8 14,7 21,5 28,4 35,3 42,2' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', price: 198.74, change: 0.82, volume: '8.1M', marketCap: '$568B', spark: '0,8 7,7 14,6 21,7 28,5 35,4 42,3' },
  { symbol: 'V', name: 'Visa', sector: 'Financials', price: 278.41, change: 0.62, volume: '6.4M', marketCap: '$553B', spark: '0,7 7,6 14,5 21,6 28,4 35,3 42,2' },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', price: 524.66, change: 0.28, volume: '3.2M', marketCap: '$487B', spark: '0,6 7,5 14,6 21,5 28,4 35,5 42,3' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', price: 762.49, change: 1.04, volume: '2.8M', marketCap: '$724B', spark: '0,9 7,7 14,6 21,5 28,4 35,3 42,2' },
  { symbol: 'XOM', name: 'ExxonMobil', sector: 'Energy', price: 109.42, change: -1.46, volume: '15.7M', marketCap: '$436B', spark: '0,4 7,3 14,5 21,4 28,7 35,6 42,9' },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy', price: 162.41, change: -0.84, volume: '9.2M', marketCap: '$303B', spark: '0,5 7,4 14,6 21,5 28,7 35,6 42,8' },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'Technology', price: 1342.5, change: 3.12, volume: '4.1M', marketCap: '$623B', spark: '0,10 7,8 14,7 21,5 28,4 35,3 42,2' },
  { symbol: 'AMD', name: 'AMD', sector: 'Technology', price: 142.6, change: -2.18, volume: '54.2M', marketCap: '$231B', spark: '0,3 7,5 14,6 21,4 28,7 35,8 42,10' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Consumer', price: 612.4, change: 0.84, volume: '4.6M', marketCap: '$262B', spark: '0,7 7,6 14,5 21,4 28,5 35,3 42,2' },
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Crypto', price: 67432, change: 2.18, volume: '$28B', marketCap: '$1.32T', spark: '0,9 7,7 14,6 21,4 28,3 35,2 42,1' },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Crypto', price: 3284, change: 1.42, volume: '$14B', marketCap: '$394B', spark: '0,8 7,6 14,7 21,5 28,4 35,3 42,2' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials', price: 338.12, change: 0.42, volume: '1.8M', marketCap: '$163B', spark: '0,6 7,5 14,4 21,5 28,4 35,3 42,3' },
  { symbol: 'BA', name: 'Boeing', sector: 'Industrials', price: 184.62, change: -1.84, volume: '8.9M', marketCap: '$112B', spark: '0,4 7,5 14,6 21,5 28,7 35,8 42,9' },
];

export const INITIAL_WATCHLIST: readonly string[] = ['NVDA', 'TSLA', 'BTC', 'META', 'LLY', 'AMD'];
