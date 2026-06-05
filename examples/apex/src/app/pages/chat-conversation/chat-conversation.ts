import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Composer } from '../../shared/composer/composer';
import { CONVERSATIONS, Conversation } from '../../data/conversations';
import { MODELS } from '../../data/mock-conversations';

@Component({
  selector: 'app-chat-conversation',
  imports: [NgIcon, HlmButton, HlmIcon, Composer],
  templateUrl: './chat-conversation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatConversation {
  readonly id = input<string>('');

  protected readonly conversation = computed<Conversation | undefined>(() =>
    CONVERSATIONS.find((c) => c.id === this.id()),
  );

  protected readonly model = computed(() => {
    const c = this.conversation();
    return MODELS.find((m) => m.id === c?.modelId) ?? MODELS[1];
  });

  protected copy(content: string): void {
    void navigator.clipboard?.writeText(content);
  }

  protected handleSend(_payload: { text: string; modelId: string }): void {
    // Mock-only: no streaming wired this slice. The composer clears its draft.
  }

  /**
   * Split content into paragraph blocks and code-fence blocks for templated rendering.
   * Phase 1 ships this as a simple regex split; markdown rendering proper lands in the next slice.
   */
  protected blocks(content: string): readonly { kind: 'text' | 'code'; value: string; lang?: string }[] {
    const out: { kind: 'text' | 'code'; value: string; lang?: string }[] = [];
    const fence = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = fence.exec(content)) !== null) {
      if (match.index > lastIndex) {
        out.push({ kind: 'text', value: content.slice(lastIndex, match.index).trim() });
      }
      out.push({ kind: 'code', value: match[2], lang: match[1] || 'plain' });
      lastIndex = fence.lastIndex;
    }
    if (lastIndex < content.length) {
      out.push({ kind: 'text', value: content.slice(lastIndex).trim() });
    }
    return out.filter((b) => b.value.length > 0);
  }
}
