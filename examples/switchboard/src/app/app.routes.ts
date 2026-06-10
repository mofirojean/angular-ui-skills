import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    pathMatch: 'full',
    title: 'Dashboard, Switchboard',
  },
  {
    path: 'tickets',
    loadComponent: () => import('./pages/tickets/tickets').then((m) => m.Tickets),
    title: 'Tickets, Switchboard',
  },
  {
    path: 'tickets/:id',
    loadComponent: () =>
      import('./pages/tickets/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
    title: 'Ticket, Switchboard',
  },
  {
    path: 'queues',
    loadComponent: () => import('./pages/queues/queues').then((m) => m.Queues),
    title: 'Queues, Switchboard',
  },
  {
    path: 'kb',
    loadComponent: () => import('./pages/kb/kb').then((m) => m.Kb),
    title: 'Knowledge base, Switchboard',
  },
  {
    path: 'agents',
    loadComponent: () => import('./pages/agents/agents').then((m) => m.Agents),
    title: 'Agents, Switchboard',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings, Switchboard',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found, Switchboard',
  },
];
