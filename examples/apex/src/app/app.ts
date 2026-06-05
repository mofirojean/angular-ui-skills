import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = signal<'light' | 'dark'>('dark');
  protected readonly modeLabel = computed(() => (this.mode() === 'light' ? 'Dark' : 'Light'));

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });
  }

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }
}
