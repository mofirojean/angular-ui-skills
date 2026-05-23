import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview/overview').then((m) => m.Overview),
    pathMatch: 'full',
    title: 'Overview · Mission Control',
  },
  {
    path: 'agents',
    loadComponent: () => import('./pages/agents/agents').then((m) => m.Agents),
    title: 'Agents · Mission Control',
  },
  {
    path: 'agents/:id',
    loadComponent: () => import('./pages/agents/agent-detail/agent-detail').then((m) => m.AgentDetail),
    title: 'Agent detail · Mission Control',
  },
  {
    path: 'runs',
    loadComponent: () => import('./pages/runs/runs').then((m) => m.Runs),
    title: 'Runs · Mission Control',
  },
  {
    path: 'schedules',
    loadComponent: () => import('./pages/schedules/schedules').then((m) => m.Schedules),
    title: 'Schedules · Mission Control',
  },
  {
    path: 'marketplace',
    loadComponent: () => import('./pages/marketplace/marketplace').then((m) => m.Marketplace),
    title: 'Marketplace · Mission Control',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · Mission Control',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · Mission Control',
  },
];
