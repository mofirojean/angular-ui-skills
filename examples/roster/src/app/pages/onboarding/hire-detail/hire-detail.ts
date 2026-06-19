import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InitialsPipe, TimeAgoPipe } from 'ngx-transforms';

import { MockDataService } from '../../../core/mock-data.service';
import {
  ChecklistItem,
  OnboardingStage,
} from '../../../core/model';

// --- Bottom sheet for capturing a task note ----------------------------------

interface NoteSheetData {
  taskLabel: string;
  initialNote: string;
}

@Component({
  selector: 'app-checklist-note-sheet',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="note-sheet">
      <header class="note-sheet__head">
        <mat-icon class="material-symbols-outlined">sticky_note_2</mat-icon>
        <div>
          <h3 class="note-sheet__title">Add a note</h3>
          <p class="note-sheet__sub">{{ data.taskLabel }}</p>
        </div>
      </header>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="note-sheet__field">
        <mat-label>Note</mat-label>
        <textarea
          matInput
          rows="3"
          [formControl]="noteCtrl"
          placeholder="Context for the next reviewer,"
          autofocus
        ></textarea>
      </mat-form-field>
      <div class="note-sheet__actions">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-flat-button class="save-btn" (click)="save()">
          <mat-icon class="material-symbols-outlined">check</mat-icon>
          Save note
        </button>
      </div>
    </div>
  `,
  styles: `
    .note-sheet { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 14px; }
    .note-sheet__head { display: flex; align-items: center; gap: 12px; }
    .note-sheet__head mat-icon {
      font-size: 22px; width: 22px; height: 22px;
      color: var(--mat-sys-on-surface-variant);
    }
    .note-sheet__title {
      margin: 0; font: var(--mat-sys-title-small); font-weight: 600;
      color: var(--mat-sys-on-surface);
    }
    .note-sheet__sub {
      margin: 2px 0 0; font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .note-sheet__field { width: 100%; }
    .note-sheet__actions { display: flex; justify-content: flex-end; gap: 8px; }
    .save-btn {
      --mat-flat-button-container-color: color-mix(
        in srgb, var(--mat-sys-primary) 16%, var(--mat-sys-surface-container-high)
      );
      --mat-flat-button-foreground-color: var(--mat-sys-on-surface);
      --mat-flat-button-icon-color: var(--mat-sys-on-surface);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistNoteSheet {
  protected readonly data = inject<NoteSheetData>(MAT_BOTTOM_SHEET_DATA);
  private readonly ref = inject<MatBottomSheetRef<ChecklistNoteSheet, string | undefined>>(MatBottomSheetRef);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly noteCtrl = this.fb.control(this.data.initialNote);

  protected save(): void {
    this.ref.dismiss(this.noteCtrl.value.trim() || undefined);
  }

  protected cancel(): void {
    this.ref.dismiss(undefined);
  }
}

// --- Hire detail page --------------------------------------------------------

interface ChecklistGroup {
  readonly stage: OnboardingStage;
  readonly items: readonly ChecklistItem[];
}

@Component({
  selector: 'app-hire-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatBottomSheetModule,
    InitialsPipe,
    TimeAgoPipe,
  ],
  templateUrl: './hire-detail.html',
  styleUrl: './hire-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HireDetail {
  private readonly data = inject(MockDataService);
  private readonly sheet = inject(MatBottomSheet);
  private readonly snack = inject(MatSnackBar);

  readonly id = input<string>('');

  protected readonly checklist = computed(() => this.data.getChecklist(this.id()));

  /** Tasks grouped by stage, preserves order. */
  protected readonly groups = computed<readonly ChecklistGroup[]>(() => {
    const c = this.checklist();
    if (!c) return [];
    const stages: OnboardingStage[] = ['Offer', 'Setup', 'Day 1', '30 days'];
    return stages.map((stage) => ({
      stage,
      items: c.items.filter((i) => i.stage === stage),
    }));
  });

  protected toggle(item: ChecklistItem, done: boolean): void {
    this.data.toggleChecklistItem(this.id(), item.id, done, item.note);
  }

  protected openNote(item: ChecklistItem): void {
    const ref = this.sheet.open(ChecklistNoteSheet, {
      data: { taskLabel: item.label, initialNote: item.note ?? '' } satisfies NoteSheetData,
    });
    ref.afterDismissed().subscribe((note) => {
      if (note === undefined) return;
      this.data.toggleChecklistItem(this.id(), item.id, item.done, note);
      this.snack.open('Note saved', undefined, { duration: 1800 });
    });
  }

  protected stageIcon(stage: OnboardingStage): string {
    switch (stage) {
      case 'Offer':   return 'mail';
      case 'Setup':   return 'build';
      case 'Day 1':   return 'door_open';
      case '30 days': return 'flag';
    }
  }

  protected stageTone(stage: OnboardingStage): string {
    switch (stage) {
      case 'Offer':   return 'offer';
      case 'Setup':   return 'setup';
      case 'Day 1':   return 'day1';
      case '30 days': return 'thirty';
    }
  }
}