import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HlmButtonImports],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);
  protected readonly title = signal('mission-control');
  protected readonly mode = signal<'light' | 'dark'>('light');

  protected toggleTheme(): void {
    const next = this.mode() === 'light' ? 'dark' : 'light';
    this.mode.set(next);
    this.document.documentElement.classList.toggle('dark', next === 'dark');
  }
}
