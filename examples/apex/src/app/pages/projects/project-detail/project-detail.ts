import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { PROJECTS } from '../../../data/projects';
import { CONVERSATIONS } from '../../../data/conversations';

type Tab = 'conversations' | 'knowledge' | 'instructions';

@Component({
  selector: 'app-project-detail',
  imports: [FormsModule, RouterLink, NgIcon, HlmButton, HlmIcon],
  templateUrl: './project-detail.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  readonly id = input<string>('');

  protected readonly project = computed(() => PROJECTS.find((p) => p.id === this.id()));

  protected readonly activeTab = signal<Tab>('conversations');

  protected readonly instructionsDraft = signal<string>('');

  /** Mock: surface every existing conversation as if it lived in this project. */
  protected readonly conversations = computed(() => {
    const p = this.project();
    if (!p) return [] as typeof CONVERSATIONS;
    return CONVERSATIONS.slice(0, Math.min(p.conversationCount, CONVERSATIONS.length));
  });

  constructor() {
    effect(() => {
      const p = this.project();
      this.activeTab.set('conversations');
      this.instructionsDraft.set(p?.instructions ?? '');
    });
  }

  protected setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
