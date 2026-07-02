import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Tab {
  label: string;
  icon: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'echo-mobile-tab-bar',
  imports: [RouterLink, RouterLinkActive],
  host: {
    class:
      'flex h-16 shrink-0 items-stretch border-t border-[var(--echo-border)] bg-[var(--echo-chrome-bg)] md:hidden',
    style: 'padding-bottom: env(safe-area-inset-bottom, 0px);',
  },
  template: `
    @for (tab of tabs; track tab.path) {
      <a
        [routerLink]="tab.path"
        [routerLinkActive]="'tab-active'"
        [routerLinkActiveOptions]="{ exact: !!tab.exact }"
        class="tab-item"
      >
        <i class="pi {{ tab.icon }} text-lg"></i>
        <span class="text-[0.65rem] font-medium">{{ tab.label }}</span>
      </a>
    }
  `,
  styles: [
    `
      :host ::ng-deep .tab-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        color: var(--echo-muted);
        text-decoration: none;
        transition: color 120ms ease;
      }
      :host ::ng-deep .tab-item.tab-active {
        color: var(--echo-accent);
      }
      :host ::ng-deep .tab-item:active {
        background: var(--echo-hover);
      }
    `,
  ],
})
export class MobileTabBar {
  readonly tabs: Tab[] = [
    { label: 'Home', icon: 'pi-home', path: '/', exact: true },
    { label: 'Search', icon: 'pi-search', path: '/search' },
    { label: 'Library', icon: 'pi-book', path: '/library' },
    { label: 'Browse', icon: 'pi-th-large', path: '/browse' },
    { label: 'Settings', icon: 'pi-cog', path: '/settings' },
  ];
}
