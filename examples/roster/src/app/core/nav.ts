import type { NavSection } from './model';

export const NAV: readonly NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { path: '/',           label: 'Dashboard',  icon: 'dashboard' },
      { path: '/people',     label: 'People',     icon: 'groups',  badge: 204 },
      { path: '/onboarding', label: 'Onboarding', icon: 'route',   badge: 3 },
      { path: '/time-off',   label: 'Time off',   icon: 'event',   badge: 5 },
      { path: '/reviews',    label: 'Reviews',    icon: 'reviews', badge: 12 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];
