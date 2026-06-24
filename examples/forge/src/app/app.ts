import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmButtonImports, HlmCardImports],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly title = signal('Forge');
  protected readonly mode = signal<'light' | 'dark'>('light');
  protected readonly modeIcon = computed(() => (this.mode() === 'dark' ? '☀' : '☾'));

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });
  }

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }
}
