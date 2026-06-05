import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Composer } from '../../shared/composer/composer';
import { MOCK_USER } from '../../data/mock-conversations';
import { CONVERSATIONS } from '../../data/conversations';

interface PromptSuggestion {
  readonly icon: string;
  readonly title: string;
  readonly hint: string;
  readonly seedConversationId: string;
}

@Component({
  selector: 'app-chat-empty',
  imports: [NgIcon, HlmIcon, Composer],
  templateUrl: './chat-empty.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEmpty {
  private readonly router = inject(Router);

  protected readonly user = MOCK_USER;

  protected readonly hour = signal(new Date().getHours());

  protected readonly greeting = computed(() => {
    const h = this.hour();
    if (h < 5) return 'Up late';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  });

  protected readonly suggestions: readonly PromptSuggestion[] = [
    {
      icon: 'lucidePencil',
      title: 'Draft an email',
      hint: 'declining a meeting politely',
      seedConversationId: 'c-007',
    },
    {
      icon: 'lucideBookOpen',
      title: 'Explain a concept',
      hint: 'oklch and color-token systems',
      seedConversationId: 'c-005',
    },
    {
      icon: 'lucideSparkles',
      title: 'Brainstorm names',
      hint: 'for a side project',
      seedConversationId: 'c-004',
    },
    {
      icon: 'lucideCircleHelp',
      title: 'Get a refactor plan',
      hint: 'for an 800-line component',
      seedConversationId: 'c-006',
    },
  ];

  protected pick(suggestion: PromptSuggestion): void {
    void this.router.navigate(['/c', suggestion.seedConversationId]);
  }

  protected handleSend(_payload: { text: string; modelId: string }): void {
    void this.router.navigate(['/c', CONVERSATIONS[0].id]);
  }
}
