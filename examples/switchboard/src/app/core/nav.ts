export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  /** Key into App's computed badge map. Items without a key never render a badge. */
  readonly badgeKey?: 'tickets' | 'queues';
}

export interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

export const NAV: readonly NavSection[] = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: 'dashboard' },
      { path: '/tickets', label: 'Tickets', icon: 'inbox', badgeKey: 'tickets' },
      { path: '/queues', label: 'Queues', icon: 'appstore', badgeKey: 'queues' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { path: '/kb', label: 'Knowledge', icon: 'book' },
      { path: '/agents', label: 'Agents', icon: 'team' },
    ],
  },
  {
    label: 'System',
    items: [{ path: '/settings', label: 'Settings', icon: 'setting' }],
  },
];
