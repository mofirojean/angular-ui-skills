import type { NavSection } from './model';

export const NAV: readonly NavSection[] = [
  {
    label: 'Reviews',
    items: [
      { path: '/',         label: 'Inbox',     icon: 'lucideInbox',               badge: 12, urgent: true, shortcut: 'g i' },
      { path: '/authored', label: 'Authored',  icon: 'lucideGitPullRequestArrow', badge: 4,  shortcut: 'g a' },
      { path: '/reviews',  label: 'Reviewing', icon: 'lucideEye',                 badge: 7,  shortcut: 'g r' },
      { path: '/drafts',   label: 'Drafts',    icon: 'lucideFilePen',             shortcut: 'g d' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/repos',    label: 'Repositories', icon: 'lucideFolderGit2', shortcut: 'g p' },
      { path: '/settings', label: 'Settings',     icon: 'lucideSettings',   shortcut: 'g s' },
    ],
  },
];
