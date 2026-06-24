export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  readonly badge?: number | string;
}

export interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

export const NAV: readonly NavSection[] = [
  {
    label: 'Reviews',
    items: [
      { path: '/',         label: 'Inbox',     icon: 'lucideInbox',       badge: 12 },
      { path: '/authored', label: 'Authored',  icon: 'lucideGitPullRequestArrow', badge: 4 },
      { path: '/reviews',  label: 'Reviewing', icon: 'lucideEye',         badge: 7 },
      { path: '/drafts',   label: 'Drafts',    icon: 'lucideFilePen' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/repos',    label: 'Repositories', icon: 'lucideFolderGit2' },
      { path: '/settings', label: 'Settings',     icon: 'lucideSettings' },
    ],
  },
];
