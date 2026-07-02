import { Component, inject, output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'echo-header',
  imports: [Button, IconField, InputIcon, InputText, Avatar, Menu],
  host: {
    class:
      'flex h-14 items-center gap-3 border-b border-[var(--p-surface-800)] bg-[var(--p-surface-950)] px-4',
  },
  template: `
    <div class="flex items-center gap-1">
      <p-button
        icon="pi pi-chevron-left"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Back"
        (onClick)="location.back()"
      />
      <p-button
        icon="pi pi-chevron-right"
        [rounded]="true"
        severity="secondary"
        [text]="true"
        size="small"
        ariaLabel="Forward"
        (onClick)="location.forward()"
      />
    </div>

    <div class="mx-auto flex w-full max-w-md items-center">
      <p-iconfield class="w-full">
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="text"
          placeholder="Search songs, artists, albums"
          class="w-full"
          (focus)="router.navigate(['/search'])"
        />
      </p-iconfield>
    </div>

    <p-button
      icon="pi pi-upload"
      severity="secondary"
      [text]="true"
      size="small"
      ariaLabel="Import files"
      pTooltip="Import files"
      (onClick)="router.navigate(['/import'])"
    />

    <p-button
      [icon]="'pi pi-' + (themeIcon === 'moon' ? 'moon' : 'sun')"
      severity="secondary"
      [text]="true"
      size="small"
      ariaLabel="Toggle theme"
      (onClick)="themeToggled.emit()"
    />

    <button
      type="button"
      class="ml-1 flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-[var(--p-surface-800)]"
      (click)="menu.toggle($event)"
    >
      <p-avatar
        label="U"
        shape="circle"
        [style]="{ 'background-color': 'var(--p-primary-500)', color: 'white' }"
      />
      <span class="text-sm text-[var(--p-surface-200)]">You</span>
    </button>

    <p-menu #menu [model]="userMenu" [popup]="true" appendTo="body" />
  `,
})
export class Header {
  protected readonly location = inject(Location);
  protected readonly router = inject(Router);
  readonly themeToggled = output<void>();
  themeIcon: 'moon' | 'sun' = 'sun';

  readonly userMenu: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/settings' },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
    { separator: true },
    { label: 'About Echo', icon: 'pi pi-info-circle', routerLink: '/settings' },
  ];
}
