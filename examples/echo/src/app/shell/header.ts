import { Component, inject, output } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { FileUpload, type FileUploadHandlerEvent } from 'primeng/fileupload';
import { MenuItem, MessageService } from 'primeng/api';
import { ImportService } from '../data/import.service';

@Component({
  selector: 'echo-header',
  imports: [
    Button,
    IconField,
    InputIcon,
    InputText,
    Avatar,
    Menu,
    FileUpload,
    RouterLink,
  ],
  host: {
    class:
      'flex h-14 items-center gap-3 border-b border-[var(--echo-border)] bg-[var(--echo-chrome-bg)] px-4',
  },
  template: `
    <div class="hidden items-center gap-1 md:flex">
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

    <a
      routerLink="/"
      class="flex items-center gap-2 md:hidden"
      aria-label="Home"
    >
      <span
        class="grid h-8 w-8 place-items-center rounded-md bg-[var(--p-primary-500)] text-[var(--p-primary-contrast-color)]"
      >
        <i class="pi pi-wave-pulse text-sm"></i>
      </span>
    </a>

    <div class="flex flex-1 items-center md:mx-auto md:max-w-md">
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

    <p-fileUpload
      #headerUpload
      mode="basic"
      chooseIcon="pi pi-upload"
      chooseLabel=""
      [auto]="true"
      [multiple]="true"
      [customUpload]="true"
      size="small"
      accept="audio/*,.flac,.mp3,.wav,.ogg,.m4a,.aac"
      (uploadHandler)="onImport($event, headerUpload)"
      class="echo-header-upload"
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
      class="ml-1 flex items-center gap-2 rounded-full p-1 transition hover:bg-[var(--echo-hover)] md:pr-3"
      (click)="menu.toggle($event)"
    >
      <p-avatar
        label="U"
        shape="circle"
        [style]="{ 'background-color': 'var(--p-primary-500)', color: 'white' }"
      />
      <span class="hidden text-sm text-[var(--echo-text)] md:inline">You</span>
    </button>

    <p-menu #menu [model]="userMenu" [popup]="true" appendTo="body" />
  `,
  styles: [
    `
      :host ::ng-deep .echo-header-upload .p-fileupload-choose {
        background: transparent;
        color: var(--echo-muted);
        border: none;
        padding: 0.4rem;
        border-radius: 999px;
        transition: color 120ms ease, background 120ms ease;
      }
      :host ::ng-deep .echo-header-upload .p-fileupload-choose:hover {
        background: var(--echo-hover);
        color: var(--echo-heading);
      }
      :host ::ng-deep .echo-header-upload .p-fileupload-choose .p-button-icon {
        margin: 0;
      }
    `,
  ],
})
export class Header {
  protected readonly location = inject(Location);
  protected readonly router = inject(Router);
  private readonly importer = inject(ImportService);
  private readonly messages = inject(MessageService);
  readonly themeToggled = output<void>();
  themeIcon: 'moon' | 'sun' = 'sun';

  readonly userMenu: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/settings' },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
    { separator: true },
    { label: 'About Echo', icon: 'pi pi-info-circle', routerLink: '/settings' },
  ];

  async onImport(event: FileUploadHandlerEvent, uploader: FileUpload): Promise<void> {
    const files = event.files as File[];
    uploader.clear();
    if (!files.length) return;
    try {
      await this.importer.import(files);
      this.messages.add({
        severity: 'success',
        summary: 'Import complete',
        detail: `${this.importer.counts().done} added.`,
        life: 3500,
      });
    } catch (err) {
      this.messages.add({
        severity: 'error',
        summary: 'Import failed',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
