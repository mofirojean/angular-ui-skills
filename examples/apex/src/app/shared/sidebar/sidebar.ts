import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmKbd } from '@spartan-ng/helm/kbd';

import { CONVERSATIONS, Conversation, ConversationBucket } from '../../data/conversations';
import { MOCK_USER, MOCK_WORKSPACE } from '../../data/mock-conversations';

interface BucketGroup {
  readonly label: ConversationBucket;
  readonly items: readonly Conversation[];
}

const BUCKET_ORDER: readonly ConversationBucket[] = [
  'Today',
  'Yesterday',
  'Previous 7 days',
  'Previous 30 days',
  'Older',
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, HlmAvatar, HlmAvatarFallback, HlmButton, HlmIcon, HlmKbd],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly mode = input<'light' | 'dark'>('dark');

  protected readonly user = MOCK_USER;
  protected readonly workspace = MOCK_WORKSPACE;

  protected readonly query = signal('');

  protected readonly starred = computed(() =>
    CONVERSATIONS.filter((c) => c.starred).slice(0, 5),
  );

  protected readonly groups = computed<BucketGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    const filtered = q
      ? CONVERSATIONS.filter((c) => c.title.toLowerCase().includes(q))
      : CONVERSATIONS;
    return BUCKET_ORDER
      .map((label) => ({ label, items: filtered.filter((c) => c.bucket === label) }))
      .filter((g) => g.items.length > 0);
  });

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
