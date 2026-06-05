import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

export interface Artifact {
  readonly id: string;
  readonly type: 'html' | 'markdown' | 'react' | 'typescript' | 'code';
  readonly title: string;
  readonly content: string;
}

@Component({
  selector: 'app-artifact-card',
  imports: [NgIcon, HlmIcon],
  template: `
    <button
      type="button"
      (click)="open.emit(artifact())"
      class="border-border bg-card hover:bg-accent hover:border-border/80 group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all"
    >
      <span
        class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
      >
        <ng-icon hlm [name]="iconName()" size="sm" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-foreground truncate text-[13px] font-medium leading-tight">
          {{ artifact().title }}
        </p>
        <p class="text-muted-foreground mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider">
          {{ kindLabel() }}
        </p>
      </div>
      <ng-icon hlm name="lucideArrowRight" size="xs" class="text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtifactCard {
  readonly artifact = input.required<Artifact>();
  readonly open = output<Artifact>();

  protected readonly iconName = computed(() => {
    switch (this.artifact().type) {
      case 'html': return 'lucideSparkles';
      case 'markdown': return 'lucideBookOpen';
      case 'react':
      case 'typescript':
      case 'code': return 'lucideFolder';
      default: return 'lucideFolder';
    }
  });

  protected readonly kindLabel = computed(() => {
    switch (this.artifact().type) {
      case 'html': return 'HTML preview';
      case 'markdown': return 'Markdown document';
      case 'react': return 'React component';
      case 'typescript': return 'TypeScript';
      case 'code': return 'Code';
      default: return 'Artifact';
    }
  });
}
