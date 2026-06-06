import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { DEFAULT_MODEL_ID, MODELS, Model } from '../../data/mock-conversations';

export interface Attachment {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface SendPayload {
  readonly text: string;
  readonly modelId: string;
  readonly attachments: readonly Attachment[];
}

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20 MB per file, mock limit
const MAX_ATTACHMENTS = 8;

@Component({
  selector: 'app-composer',
  imports: [FormsModule, NgIcon, HlmButton, HlmIcon],
  templateUrl: './composer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {
  readonly placeholder = input<string>('Message Apex...');
  readonly send = output<SendPayload>();

  protected readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly draft = signal('');
  protected readonly modelId = signal<string>(DEFAULT_MODEL_ID);
  protected readonly modelOpen = signal(false);
  protected readonly models = MODELS;
  protected readonly attachments = signal<readonly Attachment[]>([]);
  protected readonly attachmentError = signal<string | null>(null);

  protected readonly activeModel = computed<Model>(
    () => MODELS.find((m) => m.id === this.modelId()) ?? MODELS[0],
  );

  protected readonly charCount = computed(() => this.draft().length);
  protected readonly canSend = computed(
    () => this.draft().trim().length > 0 || this.attachments().length > 0,
  );
  protected readonly attachLimitReached = computed(() => this.attachments().length >= MAX_ATTACHMENTS);

  protected autosize(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 240)}px`;
  }

  protected handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected toggleModel(): void {
    this.modelOpen.update((v) => !v);
  }

  protected setModel(id: string): void {
    this.modelId.set(id);
    this.modelOpen.set(false);
  }

  protected openFilePicker(): void {
    this.attachmentError.set(null);
    this.fileInput()?.nativeElement.click();
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // allow re-selecting the same file
    if (files.length === 0) return;

    const current = this.attachments();
    const remaining = MAX_ATTACHMENTS - current.length;
    const accepted: Attachment[] = [];
    let oversized = 0;
    let truncated = 0;

    for (const file of files) {
      if (accepted.length >= remaining) {
        truncated += 1;
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        oversized += 1;
        continue;
      }
      accepted.push({
        id: `att-${current.length + accepted.length}-${file.name}-${file.size}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
    }

    if (accepted.length > 0) {
      this.attachments.update((list) => [...list, ...accepted]);
    }

    const notes: string[] = [];
    if (oversized > 0) notes.push(`${oversized} file${oversized === 1 ? '' : 's'} over 20 MB skipped`);
    if (truncated > 0) notes.push(`${truncated} file${truncated === 1 ? '' : 's'} skipped (limit ${MAX_ATTACHMENTS})`);
    this.attachmentError.set(notes.length > 0 ? notes.join(' · ') : null);
  }

  protected removeAttachment(id: string): void {
    this.attachments.update((list) => list.filter((a) => a.id !== id));
    this.attachmentError.set(null);
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected attachmentIcon(type: string): string {
    if (type.startsWith('image/')) return 'lucideSparkles';
    if (type.startsWith('text/') || type === 'application/json') return 'lucideFileText';
    return 'lucideFolder';
  }

  protected submit(): void {
    const text = this.draft().trim();
    const attached = this.attachments();
    if (!text && attached.length === 0) return;
    this.send.emit({ text, modelId: this.modelId(), attachments: attached });
    this.draft.set('');
    this.attachments.set([]);
    this.attachmentError.set(null);
    const el = this.textarea()?.nativeElement;
    if (el) el.style.height = 'auto';
  }
}
