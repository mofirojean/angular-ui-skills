export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export const NAV: readonly NavItem[] = [
  { path: '/',           label: 'Dashboard',  icon: 'dashboard' },
  { path: '/people',     label: 'People',     icon: 'groups' },
  { path: '/onboarding', label: 'Onboarding', icon: 'route' },
  { path: '/time-off',   label: 'Time off',   icon: 'event' },
  { path: '/reviews',    label: 'Reviews',    icon: 'reviews' },
  { path: '/settings',   label: 'Settings',   icon: 'settings' },
];
