import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/inbox/inbox').then((m) => m.Inbox),
    title: 'Inbox, Forge',
  },
  {
    path: 'authored',
    loadComponent: () => import('./pages/authored/authored').then((m) => m.Authored),
    title: 'Authored, Forge',
  },
  {
    path: 'reviews',
    loadComponent: () => import('./pages/reviewing/reviewing').then((m) => m.Reviewing),
    title: 'Reviewing, Forge',
  },
  {
    path: 'drafts',
    loadComponent: () => import('./pages/drafts/drafts').then((m) => m.Drafts),
    title: 'Drafts, Forge',
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
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found, Forge',
  },
];
