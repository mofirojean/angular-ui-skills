import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatCard, MatCardContent } from '@angular/material/card';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { resetCadenceDb } from '../../data/db';
import { SettingsService } from '../../shared/settings.service';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'cad-reset-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="dlg-title">
      <mat-icon aria-hidden="true">warning</mat-icon>
      Reset demo data
    </h2>
    <mat-dialog-content>
      <p class="dlg-body">
        This permanently deletes the local Cadence database, including every
        resource, booking, and preference on this device. The app reloads with
        fresh seed data. This cannot be undone.
      </p>
      <mat-form-field appearance="outline" class="dlg-field">
        <mat-label>Type DELETE to confirm</mat-label>
        <input
          matInput
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          [value]="text()"
          (input)="onInput($event)"
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="warn"
        class="destructive"
        [disabled]="!canConfirm()"
        [mat-dialog-close]="true"
      >
        Reset everything
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dlg-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--mat-sys-error);
    }
    .dlg-title mat-icon {
      color: var(--mat-sys-error);
    }
    .dlg-body {
      margin: 0 0 1rem;
      max-width: 42ch;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .dlg-field {
      width: 100%;
    }
    .destructive:not(:disabled) {
      --mat-button-protected-container-color: var(--mat-sys-error);
      --mat-button-protected-label-text-color: var(--mat-sys-on-error);
    }
  `,
})
export class ResetDialog {
  protected readonly text = signal('');
  protected readonly canConfirm = computed(
    () => this.text().trim() === 'DELETE',
  );

  protected onInput(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'cad-settings',
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatSlider,
    MatSliderThumb,
    MatSlideToggle,
    MatButton,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">
          Tune working hours, week start, default duration, and grid snap.
          Changes save to this device instantly.
        </p>
      </header>

      <mat-card class="group" appearance="outlined">
        <mat-card-content>
          <div class="row">
            <div class="row-text">
              <span class="row-title">Working hours</span>
              <span class="row-hint">
                The time band the calendar highlights as bookable.
              </span>
            </div>
            <div class="row-control hours">
              <mat-form-field appearance="outline" class="hour-field">
                <mat-label>Start</mat-label>
                <mat-select
                  [value]="s().workingHoursStart"
                  (selectionChange)="onStart($event.value)"
                >
                  @for (h of hours; track h) {
                    <mat-option [value]="h">{{ formatHour(h) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <span class="dash">to</span>
              <mat-form-field appearance="outline" class="hour-field">
                <mat-label>End</mat-label>
                <mat-select
                  [value]="s().workingHoursEnd"
                  (selectionChange)="onEnd($event.value)"
                >
                  @for (h of hours; track h) {
                    <mat-option [value]="h">{{ formatHour(h) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <div class="row-text">
              <span class="row-title">Week starts on</span>
              <span class="row-hint">
                The first column in the week and month grids.
              </span>
            </div>
            <div class="row-control">
              <mat-button-toggle-group
                aria-label="Week starts on"
                hideSingleSelectionIndicator
                [value]="s().weekStartsOn"
                (change)="onWeekStart($event.value)"
              >
                <mat-button-toggle [value]="1">Monday</mat-button-toggle>
                <mat-button-toggle [value]="0">Sunday</mat-button-toggle>
              </mat-button-toggle-group>
            </div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <div class="row-text">
              <span class="row-title">Default booking duration</span>
              <span class="row-hint">
                Prefilled length when you create a new booking.
              </span>
            </div>
            <div class="row-control duration">
              <mat-slider min="15" max="240" step="15" discrete>
                <input
                  matSliderThumb
                  [value]="s().defaultDurationMinutes"
                  (valueChange)="liveDuration.set($event)"
                  (change)="onDurationCommit()"
                />
              </mat-slider>
              <span class="duration-value">
                {{ liveDuration() ?? s().defaultDurationMinutes }} min
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <div class="row-text">
              <span class="row-title">Time-grid snap</span>
              <span class="row-hint">
                Increment that drag and resize gestures snap to.
              </span>
            </div>
            <div class="row-control">
              <mat-button-toggle-group
                aria-label="Time-grid snap"
                hideSingleSelectionIndicator
                [value]="s().snapMinutes"
                (change)="onSnap($event.value)"
              >
                <mat-button-toggle [value]="15">15 min</mat-button-toggle>
                <mat-button-toggle [value]="30">30 min</mat-button-toggle>
                <mat-button-toggle [value]="60">60 min</mat-button-toggle>
              </mat-button-toggle-group>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="group" appearance="outlined">
        <mat-card-content>
          <div class="row">
            <div class="row-text">
              <span class="row-title">Appearance</span>
              <span class="row-hint">
                Switch between the light and dark M3 palettes.
              </span>
            </div>
            <div class="row-control">
              <mat-slide-toggle
                [checked]="theme.dark()"
                (change)="theme.toggle()"
              >
                Dark theme
              </mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="group danger" appearance="outlined">
        <mat-card-content>
          <div class="row">
            <div class="row-text">
              <span class="row-title danger-title">Danger zone</span>
              <span class="row-hint">
                Delete every local resource, booking, and preference, then
                reseed the demo. This cannot be undone.
              </span>
            </div>
            <div class="row-control">
              <button mat-stroked-button color="warn" (click)="onReset()">
                <mat-icon>restart_alt</mat-icon>
                Reset demo data
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: `
    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 1.75rem 1.5rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .page-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .page-title {
      margin: 0;
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
    }
    .page-subtitle {
      margin: 0;
      max-width: 60ch;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .group {
      background: var(--mat-sys-surface);
      border-color: var(--mat-sys-outline-variant);
    }
    .group.danger {
      border-color: var(--mat-sys-error);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 0.9rem 0;
    }
    .row-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }
    .row-title {
      font: var(--mat-sys-title-small);
      color: var(--mat-sys-on-surface);
    }
    .danger-title {
      color: var(--mat-sys-error);
    }
    .row-hint {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
      max-width: 46ch;
    }
    .row-control {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .divider {
      height: 1px;
      background: var(--mat-sys-outline-variant);
    }
    .hours {
      gap: 0.6rem;
    }
    .hour-field {
      width: 108px;
    }
    .dash {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .hour-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    .duration {
      gap: 0.75rem;
    }
    .duration mat-slider {
      width: 220px;
    }
    .duration-value {
      min-width: 5ch;
      text-align: right;
      font: var(--mat-sys-title-small);
      color: var(--mat-sys-on-surface);
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 640px) {
      .row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      .row-control {
        justify-content: flex-start;
      }
      .duration mat-slider {
        flex: 1;
        width: auto;
      }
    }
  `,
})
export class Settings {
  private readonly settings = inject(SettingsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  protected readonly theme = inject(ThemeService);

  protected readonly s = this.settings.settings;
  protected readonly liveDuration = signal<number | null>(null);
  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);

  protected formatHour(h: number): string {
    return `${String(h).padStart(2, '0')}:00`;
  }

  protected onStart(value: number): void {
    const end = this.s().workingHoursEnd;
    void this.settings.update({
      workingHoursStart: value,
      workingHoursEnd: value >= end ? Math.min(value + 1, 23) : end,
    });
    this.saved();
  }

  protected onEnd(value: number): void {
    const start = this.s().workingHoursStart;
    void this.settings.update({
      workingHoursEnd: value,
      workingHoursStart: value <= start ? Math.max(value - 1, 0) : start,
    });
    this.saved();
  }

  protected onWeekStart(value: 0 | 1): void {
    void this.settings.update({ weekStartsOn: value });
    this.saved();
  }

  protected onDurationCommit(): void {
    const value = this.liveDuration();
    if (value === null) {
      return;
    }
    void this.settings.update({ defaultDurationMinutes: value });
    this.liveDuration.set(null);
    this.saved();
  }

  protected onSnap(value: 15 | 30 | 60): void {
    void this.settings.update({ snapMinutes: value });
    this.saved();
  }

  protected onReset(): void {
    this.dialog
      .open(ResetDialog, { width: '440px', autoFocus: 'dialog' })
      .afterClosed()
      .subscribe(async (confirmed) => {
        if (confirmed === true) {
          await resetCadenceDb();
          location.reload();
        }
      });
  }

  private saved(): void {
    this.snackBar.open('Saved', undefined, { duration: 1500 });
  }
}
