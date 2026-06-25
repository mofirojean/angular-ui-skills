import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import type { ThemeMode } from './model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private static readonly STORAGE_KEY = 'forge.theme';

  readonly mode = signal<ThemeMode>(this.readInitial());

  constructor() {
    effect(() => {
      const m = this.mode();
      this.document.documentElement.classList.toggle('dark', m === 'dark');
      try {
        localStorage.setItem(ThemeService.STORAGE_KEY, m);
      } catch {}
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  private readInitial(): ThemeMode {
    try {
      const stored = localStorage.getItem(ThemeService.STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}
