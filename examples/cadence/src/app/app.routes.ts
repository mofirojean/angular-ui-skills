import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'calendar' },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/calendar/calendar').then((m) => m.Calendar),
    title: 'Calendar · Cadence',
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./pages/resources/resources').then((m) => m.Resources),
    title: 'Resources · Cadence',
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/bookings/bookings').then((m) => m.Bookings),
    title: 'Bookings · Cadence',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · Cadence',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · Cadence',
  },
];
