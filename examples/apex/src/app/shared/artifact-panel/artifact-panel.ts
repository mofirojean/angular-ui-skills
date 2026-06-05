import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { MarkdownComponent } from 'ngx-markdown';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Artifact } from '../artifact-card/artifact-card';

type Tab = 'preview' | 'code';

@Component({
  selector: 'app-artifact-panel',
  imports: [NgIcon, MarkdownComponent, HlmButton, HlmIcon],
  templateUrl: './artifact-panel.html',
  host: { class: 'bg-card flex h-full min-h-0 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtifactPanel {
  readonly artifact = input.required<Artifact>();
  readonly fullscreen = input<boolean>(false);

  readonly close = output<void>();
  readonly toggleFullscreen = output<void>();

  protected readonly activeTab = signal<Tab>('preview');

  protected readonly canPreview = computed(
    () => this.artifact().type === 'html' || this.artifact().type === 'markdown',
  );

  protected readonly typeLabel = computed(() => {
    switch (this.artifact().type) {
      case 'html': return 'HTML';
      case 'markdown': return 'Markdown';
      case 'react': return 'React';
      case 'typescript': return 'TypeScript';
      default: return 'Code';
    }
  });

  protected readonly previewSrcDoc = computed(() => this.artifact().content);

  constructor() {
    // Reset tab when artifact changes. Code-only artifacts always show code.
    effect(() => {
      const a = this.artifact();
      this.activeTab.set(this.canPreview() ? 'preview' : 'code');
      void a;
    });
  }

  protected setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  protected copy(): void {
    void navigator.clipboard?.writeText(this.artifact().content);
  }

  protected download(): void {
    const a = this.artifact();
    const ext = a.type === 'html' ? 'html' : a.type === 'markdown' ? 'md' : a.type === 'typescript' ? 'ts' : 'txt';
    const blob = new Blob([a.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
