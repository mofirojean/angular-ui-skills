import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { Sidebar } from './shared/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIcon, HlmIcon, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = signal<'light' | 'dark'>('dark');
  protected readonly modeIcon = computed(() => (this.mode() === 'light' ? 'lucideMoon' : 'lucideSun'));
  protected readonly modeLabel = computed(() =>
    this.mode() === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
  );

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });
  }

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }
}
