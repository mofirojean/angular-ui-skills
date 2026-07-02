import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Button],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    class: 'block min-h-screen',
  },
})
export class App {
  protected readonly title = signal('Echo');
  protected readonly isDark = signal(true);

  constructor() {
    document.documentElement.classList.toggle('dark', this.isDark());
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
