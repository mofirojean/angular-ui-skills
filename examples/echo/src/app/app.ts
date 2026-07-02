import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
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
  private isDark = true;

  constructor() {
    document.documentElement.classList.toggle('dark', this.isDark);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
  }
}
