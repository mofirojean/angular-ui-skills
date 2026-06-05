import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { DEFAULT_MODEL_ID, MODELS, Model } from '../../data/mock-conversations';

@Component({
  selector: 'app-composer',
  imports: [FormsModule, NgIcon, HlmButton, HlmIcon],
  templateUrl: './composer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {
  readonly placeholder = input<string>('Message Apex...');
  readonly send = output<{ text: string; modelId: string }>();

  protected readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly draft = signal('');
  protected readonly modelId = signal<string>(DEFAULT_MODEL_ID);
  protected readonly modelOpen = signal(false);
  protected readonly models = MODELS;

  protected readonly activeModel = computed<Model>(
    () => MODELS.find((m) => m.id === this.modelId()) ?? MODELS[0],
  );

  protected readonly charCount = computed(() => this.draft().length);
  protected readonly canSend = computed(() => this.draft().trim().length > 0);

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

  protected submit(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.send.emit({ text, modelId: this.modelId() });
    this.draft.set('');
    const el = this.textarea()?.nativeElement;
    if (el) el.style.height = 'auto';
  }
}
