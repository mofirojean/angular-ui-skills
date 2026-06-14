import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';

import { NAV } from './core/nav';
import { ThemeService } from './core/theme.service';
import { DataService } from './data/data.service';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTooltipModule,
    NzDropDownModule,
    NzInputModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly collapsed = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly nav = NAV;
  protected readonly currentAgent = {
    name: 'Kasun Perera',
    initials: 'KP',
    role: 'Senior Agent',
    online: true,
  };

  protected readonly isMac =
    typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  protected readonly badges = computed<Record<string, number>>(() => {
    const list = this.data.tickets();
    return {
      tickets: list.filter((t) => t.status === 'open' || t.status === 'in-progress').length,
      queues: list.filter((t) => t.status === 'in-progress' || t.status === 'waiting').length,
    };
  });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    for (const section of this.nav) {
      const match = section.items.find(
        (i) => i.path === url || (i.path !== '/' && url.startsWith(i.path)),
      );
      if (match) return match.label;
    }
    return 'Switchboard';
  });

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const modifier = this.isMac ? event.metaKey : event.ctrlKey;
    if (modifier && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    }
    if (event.key === 'Escape' && document.activeElement === this.searchInput()?.nativeElement) {
      this.searchInput()?.nativeElement.blur();
    }
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }
}
