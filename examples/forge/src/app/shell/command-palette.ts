import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { toast } from 'ngx-sonner';

import type { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmCommandImports } from '@spartan-ng/helm/command';

import { CommandPaletteService } from '../core/command-palette.service';
import { ThemeService } from '../core/theme.service';

interface CommandEntry {
  readonly label: string;
  readonly hint: string;
  readonly icon: string;
  readonly action: () => void;
}

@Component({
  selector: 'app-command-palette',
  imports: [NgIcon, HlmCommandImports],
  template: `
    <hlm-command-dialog [state]="state()" (stateChange)="onState($event)">
      <hlm-command>
        <hlm-command-input placeholder="Type a command or search,"></hlm-command-input>
        <hlm-command-list>
          <div hlmCommandEmpty>No matches.</div>

          <hlm-command-group>
            <hlm-command-group-label>Navigation</hlm-command-group-label>
            @for (item of navItems; track item.label) {
              <button hlmCommandItem [value]="item.label" (selected)="run(item.action)">
                <ng-icon [name]="item.icon" size="16"></ng-icon>
                <span>{{ item.label }}</span>
                <span hlmCommandShortcut>{{ item.hint }}</span>
              </button>
            }
          </hlm-command-group>

          <hlm-command-separator></hlm-command-separator>

          <hlm-command-group>
            <hlm-command-group-label>Actions</hlm-command-group-label>
            @for (item of actionItems; track item.label) {
              <button hlmCommandItem [value]="item.label" (selected)="run(item.action)">
                <ng-icon [name]="item.icon" size="16"></ng-icon>
                <span>{{ item.label }}</span>
                <span hlmCommandShortcut>{{ item.hint }}</span>
              </button>
            }
          </hlm-command-group>
        </hlm-command-list>
      </hlm-command>
    </hlm-command-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
  private readonly palette = inject(CommandPaletteService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly state = computed<BrnDialogState>(() =>
    this.palette.open() ? 'open' : 'closed',
  );

  protected onState(state: BrnDialogState): void {
    this.palette.open.set(state === 'open');
  }

  protected run(action: () => void): void {
    action();
    this.palette.hide();
  }

  protected readonly navItems: readonly CommandEntry[] = [
    { label: 'Go to Inbox',       hint: 'G I',  icon: 'lucideInbox',               action: () => this.router.navigate(['/']) },
    { label: 'Open PR #142',      hint: '',     icon: 'lucideGitPullRequestArrow', action: () => this.router.navigate(['/pr', '142']) },
    { label: 'View author profile', hint: '',   icon: 'lucideCircleUserRound',     action: () => this.router.navigate(['/author', 'sashalin']) },
    { label: 'Open Settings',     hint: 'G S',  icon: 'lucideSettings',            action: () => this.router.navigate(['/settings']) },
  ];

  protected readonly actionItems: readonly CommandEntry[] = [
    {
      label: 'Toggle theme',
      hint: 'T',
      icon: 'lucideMoon',
      action: () => {
        this.theme.toggle();
        toast(`Switched to ${this.theme.mode()} mode`);
      },
    },
    {
      label: 'Sign out',
      hint: '',
      icon: 'lucideLogOut',
      action: () => {
        toast('Signed out (mock)');
      },
    },
  ];
}
