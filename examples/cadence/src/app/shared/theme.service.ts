import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'cadence.theme.dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _dark = signal(localStorage.getItem(STORAGE_KEY) === 'true');

  readonly dark = this._dark.asReadonly();

  constructor() {
    this.apply(this._dark());
  }

  toggle(): void {
    const next = !this._dark();
    this._dark.set(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    this.apply(next);
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
