import { Injectable, signal } from '@angular/core';

const DARK_LINK_ID = 'switchboard-theme-dark';
const STORAGE_KEY = 'switchboard.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<'light' | 'dark'>(this.read());

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    this.set(this.mode() === 'light' ? 'dark' : 'light');
  }

  set(next: 'light' | 'dark'): void {
    this.mode.set(next);
    this.apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be denied in private mode, ignore.
    }
  }

  private read(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private apply(mode: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-dark', mode === 'dark');

    let link = document.getElementById(DARK_LINK_ID) as HTMLLinkElement | null;
    if (mode === 'dark') {
      if (!link) {
        link = document.createElement('link');
        link.id = DARK_LINK_ID;
        link.rel = 'stylesheet';
        link.href = 'theme-dark.css';
        document.head.appendChild(link);
      }
    } else if (link) {
      link.remove();
    }
  }
}
