import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';

import { InitialsPipe } from 'ngx-transforms';

import { TimeOffRequest, LeaveType } from '../../core/model';

interface SheetData {
  date: Date;
  entries: readonly TimeOffRequest[];
}

@Component({
  selector: 'app-day-detail-sheet',
  imports: [DatePipe, MatIconModule, MatButtonModule, InitialsPipe],
  template: `
    <div class="sheet">
      <header class="sheet__head">
        <div>
          <h3 class="sheet__title">{{ data.date | date: 'EEEE, MMM d' }}</h3>
          <p class="sheet__sub">{{ data.entries.length }} {{ data.entries.length === 1 ? 'person' : 'people' }} out</p>
        </div>
        <button mat-icon-button (click)="close()" aria-label="Close">
          <mat-icon class="material-symbols-outlined">close</mat-icon>
        </button>
      </header>

      <ul class="sheet__list">
        @for (e of data.entries; track e.id) {
          <li class="row">
            <span class="avatar avatar--tertiary">{{ e.employeeName | initials }}</span>
            <div class="row__meta">
              <span class="row__name">{{ e.employeeName }}</span>
              <span class="row__role">{{ e.employeeRole }} · {{ e.department }}</span>
            </div>
            <span class="leave-pill leave-pill--{{ e.type }}">{{ typeLabel(e.type) }}</span>
            <span class="row__dates">
              {{ e.startDate | date: 'MMM d' }} – {{ e.endDate | date: 'MMM d' }}
            </span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .sheet { padding: 18px 20px 24px; display: flex; flex-direction: column; gap: 14px; }
    .sheet__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .sheet__title { margin: 0; font: var(--mat-sys-title-small); font-weight: 600; color: var(--mat-sys-on-surface); }
    .sheet__sub   { margin: 2px 0 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .sheet__list  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .row {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border-radius: 10px;
      transition: background 120ms ease;
    }
    .row:hover { background: var(--mat-sys-surface-container-high); }
    .avatar {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      font-size: 11.5px; font-weight: 600; letter-spacing: 0.02em;
      background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface);
      flex-shrink: 0;
    }
    .avatar--tertiary {
      background: color-mix(in srgb, var(--mat-sys-tertiary) 14%, var(--mat-sys-surface-container-high));
    }
    .row__meta { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
    .row__name { font-size: 13.5px; font-weight: 500; color: var(--mat-sys-on-surface); }
    .row__role { font-size: 11.5px; color: var(--mat-sys-on-surface-variant); margin-top: 2px; }
    .row__dates { font: var(--mat-sys-label-small); color: var(--mat-sys-on-surface-variant); font-variant-numeric: tabular-nums; }
    .leave-pill {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 999px;
      font: var(--mat-sys-label-small); font-weight: 600;
      background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface);
    }
    .leave-pill--vacation { background: color-mix(in srgb, var(--mat-sys-primary) 14%, var(--mat-sys-surface-container-high)); }
    .leave-pill--sick     { background: color-mix(in srgb, var(--mat-sys-error) 14%, var(--mat-sys-surface-container-high)); }
    .leave-pill--personal { background: color-mix(in srgb, var(--mat-sys-tertiary) 14%, var(--mat-sys-surface-container-high)); }
    .leave-pill--parental { background: color-mix(in srgb, mediumseagreen 16%, var(--mat-sys-surface-container-high)); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayDetailSheet {
  protected readonly data = inject<SheetData>(MAT_BOTTOM_SHEET_DATA);
  private readonly ref = inject<MatBottomSheetRef<DayDetailSheet>>(MatBottomSheetRef);

  protected typeLabel(t: LeaveType): string {
    if (t === 'vacation') return 'Vacation';
    if (t === 'sick') return 'Sick';
    if (t === 'personal') return 'Personal';
    return 'Parental';
  }

  protected close(): void {
    this.ref.dismiss();
  }
}