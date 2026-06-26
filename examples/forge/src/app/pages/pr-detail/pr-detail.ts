import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';

import type {
  Author,
  ChangedFile,
  CheckRow,
  CheckStatus,
  CommitRow,
  CommitStatus,
  FileDiff,
  FileStatus,
  Label,
  PrDetailTab,
  TimelineItem,
  TreeNode,
} from '../../core/model';
import {
  type Token,
  type LangMeta,
  detectLang,
  langMeta,
  tokenize,
  tokenClass,
} from '../../core/highlight';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface PrReviewer {
  readonly author: Author;
  readonly approved: boolean;
}

@Component({
  selector: 'app-pr-detail',
  imports: [NgClass, RouterLink, NgIcon, HlmButtonImports, HlmAvatarImports, HlmTooltip],
  templateUrl: './pr-detail.html',
  styleUrl: './pr-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrDetail {
  private readonly sanitizer = inject(DomSanitizer);
  readonly id = input<string>('');

  protected readonly activeTab = signal<PrDetailTab>('files');
  protected readonly selectedFilePath = signal<string>('src/runtime/scheduler.ts');
  protected readonly viewedFiles = signal<ReadonlySet<string>>(new Set(['docs/CHANGELOG.md']));
  protected readonly commentingKey = signal<string | null>(null);
  protected readonly expandedFolders = signal<ReadonlySet<string>>(
    new Set(['src', 'src/runtime', 'config', 'docs']),
  );

  protected toggleComment(key: string): void {
    this.commentingKey.update(curr => curr === key ? null : key);
  }

  protected closeComment(): void {
    this.commentingKey.set(null);
  }

  protected isFolderExpanded(path: string): boolean {
    return this.expandedFolders().has(path);
  }

  protected toggleFolder(path: string): void {
    const next = new Set(this.expandedFolders());
    if (next.has(path)) next.delete(path); else next.add(path);
    this.expandedFolders.set(next);
  }

  protected readonly visibleTree = computed<TreeNode[]>(() => {
    const expanded = this.expandedFolders();
    return buildFileTree(this.files).filter(node => {
      const parts = node.path.split('/');
      for (let i = 0; i < parts.length - 1; i++) {
        if (!expanded.has(parts.slice(0, i + 1).join('/'))) return false;
      }
      return true;
    });
  });

  protected readonly totalAdded = computed(() =>
    this.files.reduce((a, f) => a + f.added, 0),
  );
  protected readonly totalRemoved = computed(() =>
    this.files.reduce((a, f) => a + f.removed, 0),
  );

  protected readonly diffRatio = computed(() => {
    const a = this.totalAdded();
    const r = this.totalRemoved();
    if (a + r === 0) return { add: 50, del: 50 };
    return { add: (a / (a + r)) * 100, del: (r / (a + r)) * 100 };
  });

  protected readonly sortedChecks = computed<readonly CheckRow[]>(() => {
    const rank: Record<CheckStatus, number> = { fail: 0, pending: 1, skipped: 2, pass: 3 };
    return [...this.checks].sort((a, b) => rank[a.status] - rank[b.status]);
  });

  protected readonly checkSummary = computed(() => {
    const total   = this.checks.length;
    const passed  = this.checks.filter(c => c.status === 'pass').length;
    const failed  = this.checks.filter(c => c.status === 'fail').length;
    const pending = this.checks.filter(c => c.status === 'pending').length;
    return { total, passed, failed, pending };
  });

  protected parseHunk(header: string): { range: string; ctx: string } {
    const m = /@@\s+-(\d+),?(\d*)\s+\+(\d+),?(\d*)\s+@@(.*)/.exec(header);
    if (!m) return { range: header, ctx: '' };
    const newStart = +m[3];
    const newCount = m[4] ? +m[4] : 1;
    return { range: `Lines ${newStart}–${newStart + newCount - 1}`, ctx: m[5].trim() };
  }

  protected readonly tabs: { key: PrDetailTab; label: string; count?: number; icon: string; }[] = [
    { key: 'conversation', label: 'Conversation', icon: 'lucideMessageSquare', count: 7 },
    { key: 'files',        label: 'Files changed', icon: 'lucideFiles',        count: 7 },
    { key: 'commits',      label: 'Commits',       icon: 'lucideGitCommit',    count: 4 },
    { key: 'checks',       label: 'Checks',        icon: 'lucideCircleCheck',  count: 5 },
  ];

  protected setTab(t: PrDetailTab): void { this.activeTab.set(t); }

  protected isViewed(path: string): boolean { return this.viewedFiles().has(path); }

  protected toggleViewed(path: string): void {
    const next = new Set(this.viewedFiles());
    if (next.has(path)) next.delete(path); else next.add(path);
    this.viewedFiles.set(next);
  }

  protected statusBadge(s: FileStatus): { letter: string; tone: string } {
    switch (s) {
      case 'modified': return { letter: 'M', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30' };
      case 'added':    return { letter: 'A', tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30' };
      case 'deleted':  return { letter: 'D', tone: 'bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-500/30' };
      case 'renamed':  return { letter: 'R', tone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30' };
    }
  }

  protected readonly files: readonly ChangedFile[] = [
    { path: 'src/runtime/scheduler.ts',      status: 'modified', added: 24, removed: 14 },
    { path: 'src/runtime/scheduler.spec.ts', status: 'modified', added: 18, removed:  2 },
    { path: 'src/runtime/lock-manager.ts',   status: 'added',    added: 31, removed:  0 },
    { path: 'src/runtime/types.ts',          status: 'modified', added:  4, removed:  1 },
    { path: 'config/runtime.json',           status: 'modified', added:  4, removed:  0 },
    { path: 'docs/CHANGELOG.md',             status: 'modified', added:  6, removed:  0 },
    { path: 'package.json',                  status: 'modified', added:  2, removed:  6 },
  ];

  protected readonly selectedDiff = computed<FileDiff>(() => {
    const path = this.selectedFilePath();
    return this.diffs.find(d => d.path === path) ?? this.diffs[0];
  });

  protected readonly tokenizedHunks = computed(() => {
    const diff = this.selectedDiff();
    const lang = detectLang(diff.path);
    return diff.hunks.map(hunk => ({
      header: hunk.header,
      lines: hunk.lines.map(line => ({
        kind: line.kind,
        oldNo: line.oldNo,
        newNo: line.newNo,
        html: this.buildLineHtml(tokenize(line.text, lang)),
      })),
    }));
  });

  private buildLineHtml(tokens: readonly Token[]): SafeHtml {
    const html = tokens.map(tok => {
      const text = escapeHtml(tok.v);
      if (tok.t === 'plain') return text;
      return `<span class="${tokenClass(tok.t)}">${text}</span>`;
    }).join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected readonly selectedLang = computed<LangMeta>(() =>
    langMeta(detectLang(this.selectedDiff().path)),
  );

  protected readonly selectedPathParts = computed(() => this.selectedDiff().path.split('/'));

  protected langFor(path: string): LangMeta { return langMeta(detectLang(path)); }
  protected tokenClass(t: Token['t']): string { return tokenClass(t); }

  protected readonly diffs: readonly FileDiff[] = [
    {
      path: 'src/runtime/scheduler.ts',
      language: 'TypeScript',
      added: 24,
      removed: 14,
      hunks: [
        {
          header: '@@ -38,12 +38,18 @@ export class RunScheduler {',
          lines: [
            { kind: 'ctx', oldNo: 38, newNo: 38, text: '  private readonly slots = new Map<number, RunHandle>();' },
            { kind: 'ctx', oldNo: 39, newNo: 39, text: '  private readonly queue: PendingRun[] = [];' },
            { kind: 'del', oldNo: 40, newNo: null, text: '  private nextSlotId = 0;' },
            { kind: 'add', oldNo: null, newNo: 40, text: '  private readonly slotLock = new LockManager(this.config.lockTimeoutMs);' },
            { kind: 'add', oldNo: null, newNo: 41, text: '  private nextSlotId = 0;' },
            { kind: 'ctx', oldNo: 41, newNo: 42, text: '' },
            { kind: 'ctx', oldNo: 42, newNo: 43, text: '  constructor(' },
            { kind: 'ctx', oldNo: 43, newNo: 44, text: '    private readonly config: SchedulerConfig,' },
            { kind: 'ctx', oldNo: 44, newNo: 45, text: '    private readonly clock: Clock,' },
            { kind: 'ctx', oldNo: 45, newNo: 46, text: '  ) {}' },
            { kind: 'ctx', oldNo: 46, newNo: 47, text: '' },
            { kind: 'del', oldNo: 47, newNo: null, text: '  public scheduleRun(spec: RunSpec): RunHandle {' },
            { kind: 'del', oldNo: 48, newNo: null, text: '    const id = this.nextSlotId++;' },
            { kind: 'del', oldNo: 49, newNo: null, text: '    const handle = new RunHandle(id, spec, this.clock.now());' },
            { kind: 'add', oldNo: null, newNo: 48, text: '  public async scheduleRun(spec: RunSpec): Promise<RunHandle> {' },
            { kind: 'add', oldNo: null, newNo: 49, text: '    const release = await this.slotLock.acquire();' },
            { kind: 'add', oldNo: null, newNo: 50, text: '    try {' },
            { kind: 'add', oldNo: null, newNo: 51, text: '      const id = this.nextSlotId++;' },
            { kind: 'add', oldNo: null, newNo: 52, text: '      const handle = new RunHandle(id, spec, this.clock.now());' },
            { kind: 'add', oldNo: null, newNo: 53, text: '      this.slots.set(id, handle);' },
            { kind: 'add', oldNo: null, newNo: 54, text: '      return handle;' },
            { kind: 'add', oldNo: null, newNo: 55, text: '    } finally {' },
            { kind: 'add', oldNo: null, newNo: 56, text: '      release();' },
            { kind: 'add', oldNo: null, newNo: 57, text: '    }' },
            { kind: 'del', oldNo: 50, newNo: null, text: '    this.slots.set(id, handle);' },
            { kind: 'del', oldNo: 51, newNo: null, text: '    return handle;' },
            { kind: 'ctx', oldNo: 52, newNo: 58, text: '  }' },
          ],
        },
        {
          header: '@@ -84,6 +90,9 @@ export class RunScheduler {',
          lines: [
            { kind: 'ctx', oldNo: 84, newNo: 90, text: '  public release(id: number): void {' },
            { kind: 'ctx', oldNo: 85, newNo: 91, text: '    const handle = this.slots.get(id);' },
            { kind: 'ctx', oldNo: 86, newNo: 92, text: '    if (!handle) return;' },
            { kind: 'add', oldNo: null, newNo: 93, text: '    this.slotLock.notifyReleased(id);' },
            { kind: 'add', oldNo: null, newNo: 94, text: '    this.metrics.recordRelease(handle);' },
            { kind: 'ctx', oldNo: 87, newNo: 95, text: '    handle.markDone(this.clock.now());' },
            { kind: 'ctx', oldNo: 88, newNo: 96, text: '    this.slots.delete(id);' },
            { kind: 'ctx', oldNo: 89, newNo: 97, text: '  }' },
          ],
        },
      ],
    },
    {
      path: 'src/runtime/lock-manager.ts',
      language: 'TypeScript',
      added: 31,
      removed: 0,
      hunks: [
        {
          header: '@@ -0,0 +1,31 @@',
          lines: [
            { kind: 'add', oldNo: null, newNo:  1, text: 'import { delay } from \'./utils\';' },
            { kind: 'add', oldNo: null, newNo:  2, text: '' },
            { kind: 'add', oldNo: null, newNo:  3, text: 'type Release = () => void;' },
            { kind: 'add', oldNo: null, newNo:  4, text: '' },
            { kind: 'add', oldNo: null, newNo:  5, text: 'export class LockManager {' },
            { kind: 'add', oldNo: null, newNo:  6, text: '  private locked = false;' },
            { kind: 'add', oldNo: null, newNo:  7, text: '  private readonly waiters: Array<(release: Release) => void> = [];' },
            { kind: 'add', oldNo: null, newNo:  8, text: '' },
            { kind: 'add', oldNo: null, newNo:  9, text: '  constructor(private readonly timeoutMs: number) {}' },
            { kind: 'add', oldNo: null, newNo: 10, text: '' },
            { kind: 'add', oldNo: null, newNo: 11, text: '  public async acquire(): Promise<Release> {' },
            { kind: 'add', oldNo: null, newNo: 12, text: '    if (!this.locked) {' },
            { kind: 'add', oldNo: null, newNo: 13, text: '      this.locked = true;' },
            { kind: 'add', oldNo: null, newNo: 14, text: '      return () => this.releaseNext();' },
            { kind: 'add', oldNo: null, newNo: 15, text: '    }' },
            { kind: 'add', oldNo: null, newNo: 16, text: '    return new Promise<Release>((resolve, reject) => {' },
            { kind: 'add', oldNo: null, newNo: 17, text: '      const timer = setTimeout(() => reject(new Error(\'lock timeout\')), this.timeoutMs);' },
            { kind: 'add', oldNo: null, newNo: 18, text: '      this.waiters.push((release) => { clearTimeout(timer); resolve(release); });' },
            { kind: 'add', oldNo: null, newNo: 19, text: '    });' },
            { kind: 'add', oldNo: null, newNo: 20, text: '  }' },
            { kind: 'add', oldNo: null, newNo: 21, text: '' },
            { kind: 'add', oldNo: null, newNo: 22, text: '  private releaseNext(): void {' },
            { kind: 'add', oldNo: null, newNo: 23, text: '    const next = this.waiters.shift();' },
            { kind: 'add', oldNo: null, newNo: 24, text: '    if (next) next(() => this.releaseNext());' },
            { kind: 'add', oldNo: null, newNo: 25, text: '    else this.locked = false;' },
            { kind: 'add', oldNo: null, newNo: 26, text: '  }' },
            { kind: 'add', oldNo: null, newNo: 27, text: '' },
            { kind: 'add', oldNo: null, newNo: 28, text: '  public notifyReleased(_id: number): void {' },
            { kind: 'add', oldNo: null, newNo: 29, text: '    void delay(0);' },
            { kind: 'add', oldNo: null, newNo: 30, text: '  }' },
            { kind: 'add', oldNo: null, newNo: 31, text: '}' },
          ],
        },
      ],
    },
  ];

  protected readonly commits: readonly CommitRow[] = [
    {
      sha: 'd6f10c2',
      message: 'Address review, factor out lockTimeoutMs',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'Today, 11:42',
      day: 'Today',
      status: 'pending',
      added: 16, removed: 8, files: 1, verified: true, progress: 64,
    },
    {
      sha: 'c2e88a0',
      message: 'Expose lock timeout via runtime config',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'Today, 09:14',
      day: 'Today',
      status: 'pass',
      added: 24, removed: 5, files: 3, verified: true,
    },
    {
      sha: 'b9d3e81',
      message: 'Add regression test hammering 1k concurrent runs',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'Yesterday, 16:08',
      day: 'Yesterday',
      status: 'pass',
      added: 18, removed: 2, files: 1, verified: true,
    },
    {
      sha: 'a17f2c4',
      message: 'Lock slot allocator behind a mutex',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'Yesterday, 14:23',
      day: 'Yesterday',
      status: 'pass',
      added: 31, removed: 8, files: 2, verified: false,
    },
  ];

  protected readonly commitGroups = computed<{ day: string; items: readonly CommitRow[] }[]>(() => {
    const map = new Map<string, CommitRow[]>();
    for (const c of this.commits) {
      const day = c.day ?? 'Earlier';
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(c);
    }
    return Array.from(map, ([day, items]) => ({ day, items }));
  });

  protected readonly commitsByAuthor = computed(() => {
    const names = Array.from(new Set(this.commits.map(c => c.author.name)));
    return names.length === 1 ? names[0] : `${names.length} authors`;
  });

  protected readonly checks: readonly CheckRow[] = [
    { name: 'lint',         suite: 'ci · biome',     duration: '12s',    status: 'pass',    detail: 'No issues' },
    { name: 'typecheck',    suite: 'ci · tsc',       duration: '34s',    status: 'pass',    detail: 'Zero errors across 142 files' },
    { name: 'unit',         suite: 'ci · vitest',    duration: '1m 18s', status: 'pass',    detail: '847 tests · 0 failed' },
    { name: 'e2e',          suite: 'ci · playwright', duration: '4m 02s', status: 'pending', progress: 64, detail: 'Running shard 3 of 4' },
    { name: 'deploy-preview', suite: 'vercel',        duration: '2m 41s', status: 'pass',    detail: 'forge-pr-142-vercel.app' },
  ];

  protected statusIcon(s: CommitStatus | CheckStatus): string {
    switch (s) {
      case 'pass':    return 'lucideCircleCheck';
      case 'fail':    return 'lucideCircleX';
      case 'pending': return 'lucideClock';
      case 'skipped': return 'lucideCircleAlert';
    }
  }

  protected statusTone(s: CommitStatus | CheckStatus): string {
    switch (s) {
      case 'pass':    return 'text-emerald-600 dark:text-emerald-400';
      case 'fail':    return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-amber-600 dark:text-amber-400';
      case 'skipped': return 'text-zinc-500';
    }
  }

  protected readonly assignee: Author = {
    name: 'Sasha Lin',
    initials: 'SL',
    tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
  };

  protected readonly prReviewers: readonly PrReviewer[] = [
    {
      author: { name: 'Mofiro Jean', initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      approved: false,
    },
    {
      author: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      approved: true,
    },
  ];

  protected readonly prLabels: readonly Label[] = [
    { name: 'feat', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30' },
    { name: 'runtime', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30' },
  ];

  protected readonly prParticipants: readonly Author[] = [
    { name: 'Sasha Lin',   initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
    { name: 'Mofiro Jean', initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
    { name: 'Riley Chen',  initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
  ];

  protected readonly timeline: TimelineItem[] = [
    {
      kind: 'description',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      ago: 'opened 6 hours ago',
      body: 'The agent scheduler had a race where two concurrent runs could grab the same slot id under heavy load. This PR locks the slot allocator behind a mutex and adds a regression test that hammers it with 1k concurrent requests.',
      reactions: [
        { emoji: '👍', count: 3, mine: true },
        { emoji: '🚀', count: 1 },
      ],
    },
    {
      kind: 'event',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      icon: 'lucideTag',
      label: 'added the feat and runtime labels',
      ago: '5 hours ago',
    },
    {
      kind: 'event',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      icon: 'lucideUserPlus',
      label: 'requested review from Mofiro Jean and Riley Chen',
      ago: '5 hours ago',
    },
    {
      kind: 'comment',
      author: { name: 'Mofiro Jean', initials: 'MJ', tone: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
      ago: '4 hours ago',
      body: 'Nice catch on the regression test, the 1k-iteration shape is exactly what would have surfaced this earlier. One small thought, can we factor out the lock-acquire timeout into the config so we can dial it per env?',
      reactions: [
        { emoji: '👍', count: 1 },
      ],
    },
    {
      kind: 'event',
      author: { name: 'Sasha Lin', initials: 'SL', tone: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' },
      icon: 'lucideGitCommit',
      label: 'pushed 3 commits (a17f2c4, b9d3e81, c2e88a0)',
      ago: '2 hours ago',
    },
    {
      kind: 'comment',
      author: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      ago: '1 hour ago',
      body: 'Lock acquire timeout is now `runtime.scheduler.lockTimeoutMs`. Defaults to 250ms in dev, 1000ms in prod. Looks good to me.',
    },
    {
      kind: 'review',
      author: { name: 'Riley Chen', initials: 'RC', tone: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300' },
      ago: '58 minutes ago',
      verdict: 'approved',
      body: 'Approved with 2 minor suggestions on the test file.',
      fileComments: 2,
    },
    {
      kind: 'event',
      author: { name: 'forge-ci', initials: 'CI', tone: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
      icon: 'lucideCircleCheck',
      label: 'all required checks are passing',
      ago: '32 minutes ago',
    },
  ];
}

type TreeMap = Map<string, TreeMap | ChangedFile>;

function buildFileTree(files: readonly ChangedFile[]): TreeNode[] {
  const root: TreeMap = new Map();
  for (const f of files) {
    const parts = f.path.split('/');
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      let next = cursor.get(part);
      if (!(next instanceof Map)) {
        next = new Map();
        cursor.set(part, next);
      }
      cursor = next;
    }
    cursor.set(parts[parts.length - 1], f);
  }

  const out: TreeNode[] = [];
  walk(root, '', 0, out);
  return out;
}

function walk(map: TreeMap, prefix: string, depth: number, out: TreeNode[]): void {
  const entries = Array.from(map.entries()).sort(([aK, aV], [bK, bV]) => {
    const aFolder = aV instanceof Map;
    const bFolder = bV instanceof Map;
    if (aFolder !== bFolder) return aFolder ? -1 : 1;
    return aK.localeCompare(bK);
  });

  for (const [name, value] of entries) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (value instanceof Map) {
      const s = summarize(value);
      out.push({ kind: 'folder', path, name, depth, added: s.added, removed: s.removed, fileCount: s.count });
      walk(value, path, depth + 1, out);
    } else {
      out.push({ kind: 'file', path, name, depth, status: value.status, added: value.added, removed: value.removed });
    }
  }
}

function summarize(map: TreeMap): { added: number; removed: number; count: number } {
  let added = 0, removed = 0, count = 0;
  for (const [, v] of map) {
    if (v instanceof Map) {
      const s = summarize(v);
      added += s.added; removed += s.removed; count += s.count;
    } else {
      added += v.added; removed += v.removed; count += 1;
    }
  }
  return { added, removed, count };
}
