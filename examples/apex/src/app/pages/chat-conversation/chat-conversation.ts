import { ChangeDetectionStrategy, Component, computed, effect, input, signal, OnDestroy } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { MarkdownComponent } from 'ngx-markdown';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Composer } from '../../shared/composer/composer';
import { CONVERSATIONS, Conversation, Message } from '../../data/conversations';
import { MODELS } from '../../data/mock-conversations';

interface Block {
  readonly kind: 'text' | 'code';
  readonly value: string;
  readonly lang?: string;
}

@Component({
  selector: 'app-chat-conversation',
  imports: [NgIcon, MarkdownComponent, HlmButton, HlmIcon, Composer],
  templateUrl: './chat-conversation.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatConversation implements OnDestroy {
  readonly id = input<string>('');

  protected readonly conversation = computed<Conversation | undefined>(() =>
    CONVERSATIONS.find((c) => c.id === this.id()),
  );

  protected readonly model = computed(() => {
    const c = this.conversation();
    return MODELS.find((m) => m.id === c?.modelId) ?? MODELS[1];
  });

  /** ID of the last assistant message in this conversation, or undefined if none. */
  protected readonly streamingMessageId = computed<string | undefined>(() => {
    const c = this.conversation();
    if (!c) return undefined;
    for (let i = c.messages.length - 1; i >= 0; i--) {
      if (c.messages[i].role === 'assistant') return c.messages[i].id;
    }
    return undefined;
  });

  /** Currently revealed prefix of the streaming message's content. */
  protected readonly streamedContent = signal('');
  protected readonly isStreaming = signal(false);
  private intervalId: number | undefined;

  constructor() {
    // Re-trigger the streaming reveal whenever the conversation changes.
    effect(() => {
      const c = this.conversation();
      const streamingId = this.streamingMessageId();
      this.stopStreaming();
      this.streamedContent.set('');
      if (!c || !streamingId) return;
      const msg = c.messages.find((m) => m.id === streamingId);
      if (!msg) return;
      this.startStreaming(msg.content);
    });
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }

  private startStreaming(content: string): void {
    // Split into word + whitespace chunks so the eye registers progress.
    const tokens = content.match(/\S+\s*|\s+/g) ?? [content];
    let i = 0;
    this.isStreaming.set(true);
    this.streamedContent.set('');
    this.intervalId = window.setInterval(() => {
      if (i >= tokens.length) {
        this.stopStreaming();
        return;
      }
      this.streamedContent.update((current) => current + tokens[i]);
      i++;
    }, 28);
  }

  private stopStreaming(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isStreaming.set(false);
  }

  /**
   * Returns the content to render for a given message, honouring the streaming animation
   * for the most recent assistant message.
   */
  protected visibleContent(m: Message): string {
    if (m.id === this.streamingMessageId() && this.isStreaming()) {
      return this.streamedContent();
    }
    return m.content;
  }

  /**
   * Split content into paragraph blocks and code-fence blocks. Code blocks render in a
   * custom dark panel with a copy button; prose blocks render via ngx-markdown.
   */
  protected blocks(content: string): readonly Block[] {
    const out: Block[] = [];
    const fence = /```(\w+)?\n([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = fence.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index).trim();
        if (text) out.push({ kind: 'text', value: text });
      }
      out.push({ kind: 'code', value: match[2], lang: match[1] || 'plain' });
      lastIndex = fence.lastIndex;
    }
    if (lastIndex < content.length) {
      const tail = content.slice(lastIndex).trim();
      if (tail) out.push({ kind: 'text', value: tail });
    }
    return out;
  }

  protected isLastAssistant(m: Message): boolean {
    return m.id === this.streamingMessageId();
  }

  protected copy(content: string): void {
    void navigator.clipboard?.writeText(content);
  }

  protected handleSend(_payload: { text: string; modelId: string }): void {
    // Mock-only: no new-message wiring this slice. The composer clears its draft.
  }
}
