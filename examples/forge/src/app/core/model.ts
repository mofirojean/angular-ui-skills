export type ThemeMode = 'light' | 'dark';

export interface Reviewer {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly role: string;
  readonly avatarUrl: string | null;
}

export interface Author {
  readonly name: string;
  readonly initials: string;
  readonly tone?: string;
}

export interface MiniAvatar {
  readonly initials: string;
  readonly tone: string;
}

export interface Label {
  readonly name: string;
  readonly tone: string;
}

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

export type PrStatus = 'open' | 'draft' | 'approved' | 'changes-requested';

export interface PrRow {
  id: string;
  title: string;
  repo: string;
  branch: string;
  author: Author;
  reviewers: MiniAvatar[];
  labels: Label[];
  status: PrStatus;
  added: number;
  removed: number;
  updatedAgo: string;
}

export type PrDetailTab = 'conversation' | 'files' | 'commits' | 'checks';

export type TimelineKind = 'description' | 'comment' | 'event' | 'review';

export interface Reaction {
  readonly emoji: string;
  readonly count: number;
  readonly mine?: boolean;
}

export interface TimelineItem {
  kind: TimelineKind;
  author?: Author;
  ago: string;
  body?: string;
  icon?: string;
  label?: string;
  verdict?: string;
  reactions?: readonly Reaction[];
  fileComments?: number;
}

export type FileStatus = 'modified' | 'added' | 'deleted' | 'renamed';

export interface ChangedFile {
  path: string;
  status: FileStatus;
  added: number;
  removed: number;
}

export type DiffLineKind = 'add' | 'del' | 'ctx';

export interface DiffLine {
  kind: DiffLineKind;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  language: string;
  added: number;
  removed: number;
  hunks: DiffHunk[];
}

export interface TreeFolder {
  readonly kind: 'folder';
  readonly path: string;
  readonly name: string;
  readonly depth: number;
  readonly added: number;
  readonly removed: number;
  readonly fileCount: number;
}

export interface TreeFile {
  readonly kind: 'file';
  readonly path: string;
  readonly name: string;
  readonly depth: number;
  readonly status: FileStatus;
  readonly added: number;
  readonly removed: number;
}

export type TreeNode = TreeFolder | TreeFile;

export type CommitStatus = 'pass' | 'fail' | 'pending';

export interface CommitRow {
  sha: string;
  message: string;
  author: Author;
  ago: string;
  status: CommitStatus;
}

export type CheckStatus = 'pass' | 'fail' | 'pending' | 'skipped';

export interface CheckRow {
  name: string;
  suite: string;
  duration: string;
  status: CheckStatus;
  progress?: number;
  detail: string;
}

export interface SettingsSection {
  key: string;
  label: string;
  icon: string;
  sub: string;
}

export type RepoStatus = 'pass' | 'build' | 'fail';

export interface PinnedRepo {
  readonly name: string;
  readonly openPrs: number;
  readonly status: RepoStatus;
}

export interface CommandEntry {
  readonly label: string;
  readonly hint: string;
  readonly icon: string;
  readonly action: () => void;
}
