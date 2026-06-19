import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard, Roster',
  },
  {
    path: 'people',
    loadComponent: () => import('./pages/people/people').then((m) => m.People),
    title: 'People, Roster',
  },
  {
    path: 'people/:id',
    loadComponent: () =>
      import('./pages/people/employee-detail/employee-detail').then(
        (m) => m.EmployeeDetail,
      ),
    title: 'Employee, Roster',
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding').then((m) => m.Onboarding),
    title: 'Onboarding, Roster',
  },
  {
    path: 'onboarding/new',
    loadComponent: () =>
      import('./pages/onboarding/new-hire/new-hire').then((m) => m.NewHire),
    title: 'New hire, Roster',
  },
  {
    path: 'onboarding/:id',
    loadComponent: () =>
      import('./pages/onboarding/hire-detail/hire-detail').then((m) => m.HireDetail),
    title: 'Onboarding checklist, Roster',
  },
  {
    path: 'time-off',
    loadComponent: () =>
      import('./pages/time-off/time-off').then((m) => m.TimeOff),
    title: 'Time off, Roster',
  },
  {
    path: 'time-off/new',
    loadComponent: () =>
      import('./pages/time-off/new-request/new-request').then((m) => m.NewRequest),
    title: 'New time-off request, Roster',
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./pages/reviews/reviews').then((m) => m.Reviews),
    title: 'Reviews, Roster',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings, Roster',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found, Roster',
  },
];
