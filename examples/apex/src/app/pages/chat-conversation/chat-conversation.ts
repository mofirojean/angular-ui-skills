import { ChangeDetectionStrategy, Component, computed, effect, input, signal, OnDestroy } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { MarkdownComponent } from 'ngx-markdown';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Composer } from '../../shared/composer/composer';
import { Artifact, ArtifactCard } from '../../shared/artifact-card/artifact-card';
import { ArtifactPanel } from '../../shared/artifact-panel/artifact-panel';
import { CONVERSATIONS, Conversation, Message } from '../../data/conversations';
import { MODELS } from '../../data/mock-conversations';

type Block =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string; lang: string }
  | { kind: 'artifact'; value: Artifact };

@Component({
  selector: 'app-chat-conversation',
  imports: [NgIcon, MarkdownComponent, HlmButton, HlmIcon, Composer, ArtifactCard, ArtifactPanel],
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

  protected readonly streamingMessageId = computed<string | undefined>(() => {
    const c = this.conversation();
    if (!c) return undefined;
    for (let i = c.messages.length - 1; i >= 0; i--) {
      if (c.messages[i].role === 'assistant') return c.messages[i].id;
    }
    return undefined;
  });

  protected readonly streamedContent = signal('');
  protected readonly isStreaming = signal(false);
  private intervalId: number | undefined;

  protected readonly openArtifact = signal<Artifact | undefined>(undefined);
  protected readonly artifactFullscreen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const c = this.conversation();
      const streamingId = this.streamingMessageId();
      this.stopStreaming();
      this.streamedContent.set('');
      // Close any artifact when conversation changes.
      this.openArtifact.set(undefined);
      this.artifactFullscreen.set(false);
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

  protected visibleContent(m: Message): string {
    if (m.id === this.streamingMessageId() && this.isStreaming()) {
      return this.streamedContent();
    }
    return m.content;
  }

  /**
   * Parse content into text / code / artifact blocks.
   * Artifact fence syntax: ```artifact:<type>:<title>\n<content>\n```
   * Regular code fence: ```<lang>\n<content>\n```
   */
  protected blocks(content: string, messageId: string): readonly Block[] {
    const out: Block[] = [];
    const fence = /```([^\n]*)\n([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let artifactIdx = 0;
    while ((match = fence.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index).trim();
        if (text) out.push({ kind: 'text', value: text });
      }
      const header = (match[1] ?? '').trim();
      const body = match[2];
      if (header.startsWith('artifact:')) {
        const [, type = 'code', title = 'Artifact'] = header.split(':');
        out.push({
          kind: 'artifact',
          value: {
            id: `${messageId}-a${artifactIdx}`,
            type: (type as Artifact['type']) ?? 'code',
            title,
            content: body.trimEnd(),
          },
        });
        artifactIdx++;
      } else {
        out.push({ kind: 'code', value: body, lang: header || 'plain' });
      }
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

  protected showArtifact(a: Artifact): void {
    this.openArtifact.set(a);
  }

  protected closeArtifact(): void {
    this.openArtifact.set(undefined);
    this.artifactFullscreen.set(false);
  }

  protected toggleArtifactFullscreen(): void {
    this.artifactFullscreen.update((v) => !v);
  }

  protected handleSend(_payload: { text: string; modelId: string }): void {
    // Mock-only.
  }
}
