import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';

interface DraftPr {
  readonly id: string;
  readonly title: string;
  readonly repo: string;
  readonly branch: string;
  readonly added: number;
  readonly removed: number;
  readonly files: number;
  readonly lastTouched: string;
  readonly autosavedAgo: string;
  readonly note?: string;
}

@Component({
  selector: 'app-drafts',
  imports: [RouterLink, NgIcon, HlmButtonImports],
  templateUrl: './drafts.html',
  styleUrl: './drafts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drafts {
  protected readonly drafts = signal<readonly DraftPr[]>([
    {
      id: '149',
      title: 'WIP: add commit graph to PR detail',
      repo: 'forge/web',
      branch: 'feat/commit-graph',
      added: 47, removed: 12, files: 3,
      lastTouched: 'This morning',
      autosavedAgo: 'autosaved 2h ago',
      note: '3 unanswered TODOs in scheduler.ts before opening',
    },
    {
      id: '147',
      title: 'Spike: command palette ranking by recency',
      repo: 'forge/web',
      branch: 'spike/palette-ranking',
      added: 23, removed: 4, files: 1,
      lastTouched: 'Yesterday',
      autosavedAgo: 'autosaved 1d ago',
    },
    {
      id: '145',
      title: 'WIP: integrate Sentry breadcrumbs into runtime',
      repo: 'forge/runtime',
      branch: 'feat/sentry-breadcrumbs',
      added: 89, removed: 11, files: 5,
      lastTouched: '3 days ago',
      autosavedAgo: 'autosaved 3d ago',
      note: 'Needs a regression test before review',
    },
  ]);

  protected readonly count = computed(() => this.drafts().length);

  protected discard(id: string): void {
    this.drafts.update(arr => arr.filter(d => d.id !== id));
  }
}
