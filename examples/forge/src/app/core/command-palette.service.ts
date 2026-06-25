import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly open = signal(false);

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  toggle(): void {
    this.open.update((v) => !v);
  }
}
