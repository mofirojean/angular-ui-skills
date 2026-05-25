export type Sentiment = 'bullish' | 'neutral' | 'bearish';
export type Theme = 'AI' | 'Energy transition' | 'Macro' | 'Earnings' | 'Crypto' | 'Geo' | 'M&A';

export interface ResearchNote {
  readonly id: string;
  readonly title: string;
  readonly snippet: string;
  readonly author: string;
  readonly authorInitials: string;
  readonly date: string;
  readonly sentiment: Sentiment;
  readonly theme: Theme;
  readonly tags: string[];
  readonly attachments: number;
  readonly tickers: string[];
  readonly cover: string;
}

export const NOTES: readonly ResearchNote[] = [
  {
    id: 'n1',
    title: 'AI capex cycle: who actually monetizes the picks-and-shovels',
    snippet: 'Hyperscaler capex is rerating semiconductor names but the second-order winners (power, cooling, networking) are still under-owned. Initiating with overweight on AVGO and CRWV.',
    author: 'Sarah Chen',
    authorInitials: 'SC',
    date: 'May 22, 2025',
    sentiment: 'bullish',
    theme: 'AI',
    tags: ['Semi', 'Hyperscale', 'Power'],
    attachments: 3,
    tickers: ['NVDA', 'AVGO', 'AMD'],
    cover: 'https://picsum.photos/seed/ai-capex/600/200',
  },
  {
    id: 'n2',
    title: 'Fed path: pricing in three cuts vs. consensus two',
    snippet: 'Latest dot plot diverges from terminal-rate pricing. Long-duration trade still has room, especially TLT and quality growth. Risk: sticky services CPI.',
    author: 'Marcus Lee',
    authorInitials: 'ML',
    date: 'May 18, 2025',
    sentiment: 'neutral',
    theme: 'Macro',
    tags: ['Rates', 'Fed', 'Duration'],
    attachments: 2,
    tickers: ['TLT', 'IWM'],
    cover: 'https://picsum.photos/seed/fed-path/600/200',
  },
  {
    id: 'n3',
    title: 'TSLA Q1 deep-dive: margin floor or another leg down?',
    snippet: 'Auto gross margin troughed at 17.4% but FSD attach rates surprised. Energy storage now 14% of revenue. Maintaining underweight; PT $220.',
    author: 'Ayana Patel',
    authorInitials: 'AP',
    date: 'May 14, 2025',
    sentiment: 'bearish',
    theme: 'Earnings',
    tags: ['Auto', 'FSD', 'Margins'],
    attachments: 5,
    tickers: ['TSLA'],
    cover: 'https://picsum.photos/seed/tsla-q1/600/200',
  },
  {
    id: 'n4',
    title: 'Bitcoin spot ETF flows: the second wave is institutional',
    snippet: 'RIA + pension allocations now 60% of net inflows. Watching the 90-day cohort retention, sticky money supports a structurally higher floor around $58K.',
    author: 'Leo Tanaka',
    authorInitials: 'LT',
    date: 'May 09, 2025',
    sentiment: 'bullish',
    theme: 'Crypto',
    tags: ['BTC', 'ETF', 'Allocations'],
    attachments: 1,
    tickers: ['BTC', 'IBIT'],
    cover: 'https://picsum.photos/seed/btc-etf/600/200',
  },
  {
    id: 'n5',
    title: 'Energy transition: utilities are the next AI infrastructure',
    snippet: 'Data center demand requires 100+ GW new capacity by 2030. Regulated utilities in PJM territory benefit asymmetrically. Top picks: VST, CEG, NEE.',
    author: 'Mofiro Jean',
    authorInitials: 'MJ',
    date: 'May 02, 2025',
    sentiment: 'bullish',
    theme: 'Energy transition',
    tags: ['Utilities', 'Datacenter', 'Grid'],
    attachments: 4,
    tickers: ['VST', 'CEG', 'NEE'],
    cover: 'https://picsum.photos/seed/energy/600/200',
  },
  {
    id: 'n6',
    title: 'EU geopolitical risk: tail hedges revisit',
    snippet: 'Election cycle + Ukraine reconstruction puts EUR/USD in play. VIX-of-VIX still cheap relative to historical regime. Recommend small put-spread allocation.',
    author: 'Nia Martin',
    authorInitials: 'NM',
    date: 'Apr 28, 2025',
    sentiment: 'bearish',
    theme: 'Geo',
    tags: ['Hedge', 'Forex', 'Vol'],
    attachments: 2,
    tickers: ['VIX', 'EURUSD'],
    cover: 'https://picsum.photos/seed/eu-risk/600/200',
  },
  {
    id: 'n7',
    title: 'NVDA earnings preview: setting the buy-side bar',
    snippet: 'Whisper $32B data center, consensus $30.4B. Sovereign AI orders are the swing factor; non-China hyperscaler builds remain robust through Q4.',
    author: 'Otis Kim',
    authorInitials: 'OK',
    date: 'Apr 22, 2025',
    sentiment: 'bullish',
    theme: 'Earnings',
    tags: ['NVDA', 'AI', 'Preview'],
    attachments: 3,
    tickers: ['NVDA'],
    cover: 'https://picsum.photos/seed/nvda-preview/600/200',
  },
  {
    id: 'n8',
    title: 'Tech M&A wave: software targets at 4x ARR are back',
    snippet: 'Private equity has $480B dry powder. Several mid-cap SaaS names trading below 5x revenue look acquisition-friendly. Watchlist: HCP, FROG, GTLB.',
    author: 'Sarah Chen',
    authorInitials: 'SC',
    date: 'Apr 16, 2025',
    sentiment: 'neutral',
    theme: 'M&A',
    tags: ['SaaS', 'PE', 'Mid-cap'],
    attachments: 2,
    tickers: ['HCP', 'FROG', 'GTLB'],
    cover: 'https://picsum.photos/seed/saas-ma/600/200',
  },
];

export const THEMES: readonly Theme[] = ['AI', 'Energy transition', 'Macro', 'Earnings', 'Crypto', 'Geo', 'M&A'];
