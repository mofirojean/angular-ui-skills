export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export const NAV: readonly NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/tickets', label: 'Tickets', icon: 'inbox' },
  { path: '/queues', label: 'Queues', icon: 'appstore' },
  { path: '/kb', label: 'Knowledge', icon: 'book' },
  { path: '/agents', label: 'Agents', icon: 'team' },
  { path: '/settings', label: 'Settings', icon: 'setting' },
];
