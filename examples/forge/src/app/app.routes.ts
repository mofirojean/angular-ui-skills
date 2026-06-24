import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/inbox/inbox').then((m) => m.Inbox),
    title: 'Inbox, Forge',
  },
  {
    path: 'pr/:id',
    loadComponent: () => import('./pages/pr-detail/pr-detail').then((m) => m.PrDetail),
    title: 'Pull request, Forge',
  },
  {
    path: 'author/:handle',
    loadComponent: () => import('./pages/author/author').then((m) => m.Author),
    title: 'Author, Forge',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings, Forge',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found, Forge',
  },
];
