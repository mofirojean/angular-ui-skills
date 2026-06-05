import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { highlightCode } from './highlight';

const LANG_LABEL: Record<string, string> = {
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JavaScript',
  py: 'Python',
  python: 'Python',
  html: 'HTML',
  xml: 'HTML',
  css: 'CSS',
  json: 'JSON',
  sh: 'Shell',
  bash: 'Shell',
  shell: 'Shell',
  md: 'Markdown',
  markdown: 'Markdown',
  plain: 'Text',
  text: 'Text',
};

@Component({
  selector: 'app-code-block',
  imports: [NgIcon, HlmIcon],
  template: `
    @if (variant() === 'panel') {
      <div class="bg-[#1f1c1a] flex h-full min-h-0 flex-col overflow-hidden">
        <div class="border-white/5 flex items-center justify-between gap-3 border-b px-4 py-2">
          <div class="min-w-0 flex-1">
            <p class="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {{ fileName() ?? langLabel() }}
            </p>
            <p class="mt-0.5 font-mono text-[10px] text-zinc-500">
              {{ lineCount() }} lines · {{ code().length }} chars
            </p>
          </div>
          <button
            type="button"
            (click)="copy()"
            class="hover:bg-white/5 inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors"
          >
            @if (copied()) {
              <ng-icon hlm name="lucideCheck" size="xs" class="text-emerald-400" />
              Copied
            } @else {
              <ng-icon hlm name="lucideCopy" size="xs" />
              Copy
            }
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <pre class="px-5 py-4 font-mono text-[12.5px] leading-[1.6]"><code class="hljs" [innerHTML]="highlighted()"></code></pre>
        </div>
      </div>
    } @else {
      <div class="border-border overflow-hidden rounded-xl border bg-[#1f1c1a]">
        <div class="border-white/5 flex items-center justify-between border-b px-3 py-1.5">
          <span class="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{{ langLabel() }}</span>
          <button
            type="button"
            (click)="copy()"
            class="hover:bg-white/5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 transition-colors"
          >
            @if (copied()) {
              <ng-icon hlm name="lucideCheck" size="xs" class="text-emerald-400" />
              Copied
            } @else {
              <ng-icon hlm name="lucideCopy" size="xs" />
              Copy
            }
          </button>
        </div>
        <pre class="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-[1.55]"><code class="hljs" [innerHTML]="highlighted()"></code></pre>
      </div>
    }
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly lang = input<string>('plain');
  readonly fileName = input<string | undefined>(undefined);
  readonly variant = input<'inline' | 'panel'>('inline');

  protected readonly copied = signal(false);
  private copyTimer: number | undefined;

  protected readonly highlighted = computed(() => highlightCode(this.code(), this.lang()));

  protected readonly lineCount = computed(() => this.code().split('\n').length);

  protected readonly langLabel = computed(() => {
    const raw = this.lang().toLowerCase();
    return LANG_LABEL[raw] ?? raw.toUpperCase();
  });

  protected copy(): void {
    void navigator.clipboard?.writeText(this.code());
    this.copied.set(true);
    if (this.copyTimer) window.clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.copied.set(false), 1500);
  }
}
