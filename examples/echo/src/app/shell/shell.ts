import { Component, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { PlayerBar } from './player-bar';
import { MobileTabBar } from './mobile-tab-bar';

@Component({
  selector: 'echo-shell',
  imports: [RouterOutlet, Sidebar, Header, PlayerBar, MobileTabBar],
  host: {
    class: 'flex h-[100dvh] w-screen flex-col bg-[var(--echo-bg)]',
  },
  template: `
    <div class="flex flex-1 overflow-hidden">
      <echo-sidebar />
      <div class="flex min-w-0 flex-1 flex-col">
        <echo-header (themeToggled)="themeToggled.emit()" />
        <main class="flex-1 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
    <echo-player-bar />
    <echo-mobile-tab-bar />
  `,
})
export class Shell {
  readonly themeToggled = output<void>();
}
