import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { BookingInstance } from '../../data/types';

export interface EventDetailData {
  instance: BookingInstance;
  resourceName: string;
}

@Component({
  selector: 'cad-event-detail',
  imports: [DatePipe, MatButton, MatIcon, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detail">
      <span class="accent" [style.background]="data.instance.color"></span>
      <div class="body">
        <h2 class="title">{{ data.instance.title }}</h2>
        <div class="line">
          <mat-icon>schedule</mat-icon>
          <span>
            {{ data.instance.start | date: 'EEEE, MMM d' }} ·
            {{ data.instance.start | date: 'HH:mm' }}–{{ data.instance.end | date: 'HH:mm' }}
          </span>
        </div>
        <div class="line">
          <mat-icon>place</mat-icon>
          <span>{{ data.resourceName }}</span>
        </div>
        @if (data.instance.attendees.length) {
          <div class="line">
            <mat-icon>group</mat-icon>
            <span>{{ data.instance.attendees.join(', ') }}</span>
          </div>
        }
        @if (data.instance.isRecurring) {
          <div class="line muted">
            <mat-icon>autorenew</mat-icon>
            <span>
              Part of a repeating series{{ data.instance.isException ? ', this occurrence was edited' : '' }}.
            </span>
          </div>
        }
        <div class="actions">
          <button mat-button (click)="soon('Editing')">
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-button (click)="soon('Cancelling')">
            <mat-icon>delete</mat-icon> Cancel
          </button>
          <span class="grow"></span>
          <button mat-flat-button mat-dialog-close>Close</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .detail { display: flex; }
    .accent { width: 5px; flex-shrink: 0; }
    .body { padding: 1.25rem 1.5rem; min-width: 320px; }
    .title { font: var(--mat-sys-title-large); margin: 0 0 0.75rem; }
    .line {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.2rem 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }
    .line mat-icon {
      font-size: 20px; width: 20px; height: 20px;
      color: var(--mat-sys-on-surface-variant);
    }
    .line.muted { color: var(--mat-sys-on-surface-variant); }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 1rem;
    }
    .grow { flex: 1; }
  `,
})
export class EventDetail {
  protected readonly data = inject<EventDetailData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<EventDetail>);
  private readonly snackBar = inject(MatSnackBar);

  soon(action: string): void {
    this.ref.close();
    this.snackBar.open(`${action} lands with the editing slice.`, 'OK', {
      duration: 2500,
    });
  }
}
