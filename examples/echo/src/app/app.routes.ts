import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Echo',
  },
  {
    path: 'import',
    loadComponent: () => import('./pages/import/import').then((m) => m.Import),
    title: 'Import · Echo',
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library').then((m) => m.Library),
    title: 'Library · Echo',
  },
  {
    path: 'browse',
    loadComponent: () => import('./pages/browse/browse').then((m) => m.Browse),
    title: 'Browse · Echo',
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
    title: 'Search · Echo',
  },
  {
    path: 'queue',
    loadComponent: () => import('./pages/queue/queue').then((m) => m.Queue),
    title: 'Queue · Echo',
  },
  {
    path: 'now-playing',
    loadComponent: () =>
      import('./pages/now-playing/now-playing').then((m) => m.NowPlaying),
    title: 'Now Playing · Echo',
  },
  {
    path: 'album/:id',
    loadComponent: () => import('./pages/album/album').then((m) => m.Album),
    title: 'Album · Echo',
  },
  {
    path: 'artist/:id',
    loadComponent: () => import('./pages/artist/artist').then((m) => m.Artist),
    title: 'Artist · Echo',
  },
  {
    path: 'playlist/:id',
    loadComponent: () =>
      import('./pages/playlist/playlist').then((m) => m.Playlist),
    title: 'Playlist · Echo',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · Echo',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · Echo',
  },
];
