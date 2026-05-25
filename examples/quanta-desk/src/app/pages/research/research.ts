import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MegaMenuItem, MenuItem, MessageService, PrimeTemplate } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Editor } from 'primeng/editor';
import { MegaMenu } from 'primeng/megamenu';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { TieredMenu } from 'primeng/tieredmenu';
import { Tooltip } from 'primeng/tooltip';

import { NOTES, ResearchNote, Sentiment, Theme, THEMES } from './research.data';

type Layout = 'grid' | 'list';

@Component({
  selector: 'app-research',
  imports: [
    CommonModule,
    FormsModule,
    Avatar,
    Button,
    Dialog,
    Editor,
    MegaMenu,
    PrimeTemplate,
    Skeleton,
    Tag,
    TieredMenu,
    Tooltip,
  ],
  templateUrl: './research.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Research {
  private readonly toast = inject(MessageService);

  protected readonly isLoading = signal(true);
  protected readonly layout = signal<Layout>('grid');

  protected readonly notes = signal<ResearchNote[]>([...NOTES]);
  protected readonly activeTheme = signal<Theme | null>(null);

  protected readonly composeOpen = signal(false);
  protected readonly composeTitle = signal('');
  protected readonly composeBody = signal('');

  protected readonly filteredNotes = computed(() => {
    const t = this.activeTheme();
    if (!t) return this.notes();
    return this.notes().filter((n) => n.theme === t);
  });

  protected readonly stats = computed(() => {
    const all = this.filteredNotes();
    return {
      count: all.length,
      bullish: all.filter((n) => n.sentiment === 'bullish').length,
      bearish: all.filter((n) => n.sentiment === 'bearish').length,
      neutral: all.filter((n) => n.sentiment === 'neutral').length,
    };
  });

  protected readonly megaMenuModel: MegaMenuItem[] = [
    {
      label: 'Themes',
      icon: 'pi pi-sparkles',
      items: [
        [
          {
            label: 'AI & semiconductors',
            items: [
              { label: 'AI', icon: 'pi pi-microchip', command: () => this.setTheme('AI') },
              { label: 'Energy transition', icon: 'pi pi-bolt', command: () => this.setTheme('Energy transition') },
            ],
          },
        ],
        [
          {
            label: 'Macro & flows',
            items: [
              { label: 'Macro', icon: 'pi pi-globe', command: () => this.setTheme('Macro') },
              { label: 'Geopolitics', icon: 'pi pi-flag', command: () => this.setTheme('Geo') },
            ],
          },
        ],
        [
          {
            label: 'Single-name',
            items: [
              { label: 'Earnings', icon: 'pi pi-chart-line', command: () => this.setTheme('Earnings') },
              { label: 'M&A', icon: 'pi pi-link', command: () => this.setTheme('M&A') },
              { label: 'Crypto', icon: 'pi pi-bitcoin', command: () => this.setTheme('Crypto') },
            ],
          },
        ],
      ],
    },
    {
      label: 'All notes',
      icon: 'pi pi-list',
      command: () => this.setTheme(null),
    },
  ];

  protected readonly exportMenuItems: MenuItem[] = [
    {
      label: 'Export',
      icon: 'pi pi-download',
      items: [
        { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.fireExport('PDF') },
        { label: 'Markdown', icon: 'pi pi-file', command: () => this.fireExport('Markdown') },
        { label: 'CSV (metadata)', icon: 'pi pi-file-excel', command: () => this.fireExport('CSV') },
        { separator: true },
        {
          label: 'Send to',
          icon: 'pi pi-send',
          items: [
            { label: 'Email', icon: 'pi pi-envelope', command: () => this.fireExport('Email') },
            { label: 'Slack', icon: 'pi pi-comments', command: () => this.fireExport('Slack') },
          ],
        },
      ],
    },
  ];

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }

  protected setTheme(t: Theme | null): void {
    this.activeTheme.set(t);
  }

  protected setLayout(l: Layout): void {
    this.layout.set(l);
  }

  protected openCompose(): void {
    this.composeTitle.set('');
    this.composeBody.set('');
    this.composeOpen.set(true);
  }

  protected publishNote(): void {
    const title = this.composeTitle().trim();
    const body = this.composeBody();
    if (!title || !body || body === '<p><br></p>') {
      this.toast.add({ severity: 'warn', summary: 'Add a title and body first', life: 1800 });
      return;
    }
    const fresh: ResearchNote = {
      id: `n-${Date.now()}`,
      title,
      snippet: body.replace(/<[^>]+>/g, '').slice(0, 180),
      author: 'Mofiro Jean',
      authorInitials: 'MJ',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      sentiment: 'neutral',
      theme: 'Macro',
      tags: ['Draft'],
      attachments: 0,
      tickers: [],
      cover: `https://picsum.photos/seed/${Date.now()}/600/200`,
    };
    this.notes.update((list) => [fresh, ...list]);
    this.composeOpen.set(false);
    this.toast.add({ severity: 'success', summary: 'Note published', life: 1800 });
  }

  protected sentimentSeverity(s: Sentiment): 'success' | 'secondary' | 'danger' {
    return s === 'bullish' ? 'success' : s === 'bearish' ? 'danger' : 'secondary';
  }

  protected fireExport(format: string): void {
    this.toast.add({ severity: 'info', summary: `Exported as ${format}`, life: 1500 });
  }

  protected readonly themeChips = THEMES;
}
