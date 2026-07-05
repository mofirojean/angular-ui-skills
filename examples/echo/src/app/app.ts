import { Component, inject } from '@angular/core';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SettingsStore } from './data/settings.store';
import { Shell } from './shell/shell';

@Component({
  selector: 'app-root',
  imports: [Shell, Toast, ConfirmDialog],
  template: `
    <echo-shell (themeToggled)="toggleTheme()" />
    <p-toast position="bottom-right" />
    <p-confirmdialog />
  `,
})
export class App {
  private readonly settings = inject(SettingsStore);
  private isDark = true;

  constructor() {
    document.documentElement.classList.toggle('dark', this.isDark);
    void this.settings.get<boolean>('theme.dark').then((stored) => {
      if (stored === undefined || stored === this.isDark) return;
      this.isDark = stored;
      document.documentElement.classList.toggle('dark', this.isDark);
    });
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
    void this.settings.set('theme.dark', this.isDark);
  }
}
