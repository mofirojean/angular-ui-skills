import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
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
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalService } from 'ng-zorro-antd/modal';

import { NAV } from './core/nav';
import { ThemeService } from './core/theme.service';
import { DataService } from './data/data.service';
import { NotificationsInbox } from './shared/notifications-inbox/notifications-inbox';
import { CommandPalette } from './shared/command-palette/command-palette';

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
    NzDrawerModule,
    NotificationsInbox,
    CommandPalette,
  ],
  templateUrl: './app.html',
  styleUrl: './app.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly modal = inject(NzModalService);

  protected readonly collapsed = signal(false);
  protected readonly inboxOpen = signal(false);
  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly paletteTpl = viewChild<TemplateRef<unknown>>('paletteTpl');

  private paletteRef: { destroy: () => void } | null = null;

  protected readonly nav = NAV;
  protected readonly currentAgent = {
    name: 'Mofiro Jean',
    initials: 'MJ',
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

  protected onKeydown(event: KeyboardEvent): void {
    const modifier = this.isMac ? event.metaKey : event.ctrlKey;
    if (modifier && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openPalette();
    }
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  protected openInbox(): void {
    this.inboxOpen.set(true);
  }

  protected closeInbox(): void {
    this.inboxOpen.set(false);
  }

  protected openPalette(): void {
    const tpl = this.paletteTpl();
    if (!tpl || this.paletteRef) return;
    const ref = this.modal.create({
      nzContent: tpl,
      nzClosable: false,
      nzFooter: null,
      nzWidth: 600,
      nzWrapClassName: 'command-palette-modal',
      nzMaskClosable: true,
      nzCentered: false,
      nzStyle: { top: '120px' },
    });
    this.paletteRef = ref;
    ref.afterClose.subscribe(() => (this.paletteRef = null));
  }

  protected closePalette(): void {
    this.paletteRef?.destroy();
    this.paletteRef = null;
  }
}
