import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    pathMatch: 'full',
    title: 'Dashboard, Quanta Desk',
  },
  {
    path: 'holdings',
    loadComponent: () => import('./pages/holdings/holdings').then((m) => m.Holdings),
    title: 'Holdings, Quanta Desk',
  },
  {
    path: 'holdings/:ticker',
    loadComponent: () =>
      import('./pages/holdings/holding-detail/holding-detail').then((m) => m.HoldingDetail),
    title: 'Holding, Quanta Desk',
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./pages/watchlist/watchlist').then((m) => m.Watchlist),
    title: 'Watchlist, Quanta Desk',
  },
  {
    path: 'trade',
    loadComponent: () => import('./pages/trade/trade').then((m) => m.Trade),
    title: 'Trade, Quanta Desk',
  },
  {
    path: 'trades',
    loadComponent: () => import('./pages/trades/trades').then((m) => m.Trades),
    title: 'Trades, Quanta Desk',
  },
  {
    path: 'research',
    loadComponent: () => import('./pages/research/research').then((m) => m.Research),
    title: 'Research, Quanta Desk',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings, Quanta Desk',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found, Quanta Desk',
  },
];
