import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { endOfWeek, startOfWeek } from 'date-fns';
import { ScheduleService } from '../../data/schedule.service';
import type { Resource, ResourceType } from '../../data/types';

interface RoomRow {
  resource: Resource;
  utilization: number;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

@Component({
  selector: 'cad-add-resource-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Add resource</h2>
    <mat-dialog-content>
      <p class="hint">Demo only, nothing is saved to the schedule.</p>
      <form [formGroup]="form" class="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Willow" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="room">Room</mat-option>
            <mat-option value="person">Person</mat-option>
            <mat-option value="equipment">Equipment</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Capacity</mat-label>
          <input matInput type="number" min="0" formControlName="capacity" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button
        mat-flat-button
        type="button"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        Add resource
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .hint {
      margin: 0 0 1rem;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 320px;
    }
    mat-form-field {
      width: 100%;
    }
  `,
})
export class AddResourceDialog {
  private readonly ref = inject<MatDialogRef<AddResourceDialog>>(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: this.fb.control<ResourceType>('room', Validators.required),
    capacity: [8],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue());
  }
}

@Component({
  selector: 'cad-resources',
  imports: [
    MatTabGroup,
    MatTab,
    MatTableModule,
    MatProgressBar,
    MatButton,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="head">
        <div class="head-text">
          <h1 class="title">Resources</h1>
          <p class="subtitle">
            Rooms, people, and kit available to book across the workspace.
          </p>
        </div>
        <button mat-flat-button (click)="openAdd()">
          <mat-icon>add</mat-icon>
          Add resource
        </button>
      </header>

      @if (!schedule.ready()) {
        <p class="loading">Loading resources…</p>
      } @else {
        <mat-tab-group class="tabs" animationDuration="150ms">
          <mat-tab label="Rooms">
            <div class="tab-body">
              <div class="table-wrap">
                <table mat-table [dataSource]="roomRows()" class="rooms-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Room</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="room-name">{{ row.resource.name }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="capacity">
                    <th mat-header-cell *matHeaderCellDef>Capacity</th>
                    <td mat-cell *matCellDef="let row">
                      {{ row.resource.capacity ?? '—' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="floor">
                    <th mat-header-cell *matHeaderCellDef>Floor</th>
                    <td mat-cell *matCellDef="let row">
                      {{ row.resource.floor ? 'Level ' + row.resource.floor : '—' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="equipment">
                    <th mat-header-cell *matHeaderCellDef>Equipment</th>
                    <td mat-cell *matCellDef="let row">
                      @if (row.resource.equipment.length) {
                        <span class="chips">
                          @for (item of row.resource.equipment; track item) {
                            <span class="chip">{{ item }}</span>
                          }
                        </span>
                      } @else {
                        <span class="muted">—</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="utilization">
                    <th mat-header-cell *matHeaderCellDef>This week</th>
                    <td mat-cell *matCellDef="let row">
                      <div class="util">
                        <mat-progress-bar
                          class="util-bar"
                          mode="determinate"
                          [value]="row.utilization"
                        />
                        <span class="util-num">{{ row.utilization }}%</span>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="roomColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: roomColumns"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="People">
            <div class="tab-body">
              <div class="people-grid">
                @for (person of people(); track person.id) {
                  <article class="person-card">
                    <span class="avatar" aria-hidden="true">
                      {{ initials(person.name) }}
                    </span>
                    <div class="person-meta">
                      <span class="person-name">{{ person.name }}</span>
                      <span class="person-role">
                        {{ person.equipment[0] ?? 'Team member' }}
                      </span>
                      <span class="person-hours">Bookable 9:00–17:00</span>
                    </div>
                  </article>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .page {
      max-width: 1080px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .title {
      font: var(--mat-sys-title-large);
      margin: 0;
      color: var(--mat-sys-on-surface);
    }
    .subtitle {
      margin: 0.25rem 0 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .loading {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      padding: 2rem 0;
    }
    .tab-body {
      padding-top: 1.25rem;
    }
    .table-wrap {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      overflow: hidden;
      background: var(--mat-sys-surface);
    }
    .rooms-table {
      width: 100%;
      background: transparent;
    }
    .rooms-table th {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }
    .rooms-table td {
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-body-medium);
    }
    .room-name {
      font-weight: 600;
    }
    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
    .chips {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      font: var(--mat-sys-label-small);
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface-variant);
    }
    .util {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 160px;
    }
    .util-bar {
      flex: 1;
      border-radius: 999px;
    }
    .util-num {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      width: 2.75rem;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .people-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 0.875rem;
    }
    .person-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      background: var(--mat-sys-surface);
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      font: var(--mat-sys-title-medium);
      font-weight: 600;
    }
    .person-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 0.05rem;
    }
    .person-name {
      font: var(--mat-sys-body-large);
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .person-role {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .person-hours {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      margin-top: 0.15rem;
    }
    @media (max-width: 640px) {
      .head {
        flex-direction: column;
      }
    }
  `,
})
export class Resources {
  protected readonly schedule = inject(ScheduleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  private readonly weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  protected readonly roomColumns = [
    'name',
    'capacity',
    'floor',
    'equipment',
    'utilization',
  ];

  protected readonly roomRows = computed<RoomRow[]>(() => {
    void this.schedule.bookings();
    return this.schedule
      .resources()
      .filter((r) => r.calendarKey === 'rooms')
      .map((resource) => {
        const count = this.schedule.instancesFor(this.weekStart, this.weekEnd, [
          resource.id,
        ]).length;
        return { resource, utilization: Math.min(100, count * 12) };
      });
  });

  protected readonly people = computed<Resource[]>(() =>
    this.schedule.resources().filter((r) => r.calendarKey === 'people'),
  );

  initials(name: string): string {
    return initialsOf(name);
  }

  openAdd(): void {
    this.dialog
      .open(AddResourceDialog, { width: '420px', autoFocus: 'dialog' })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('Resource added (demo)', 'OK', { duration: 3000 });
        }
      });
  }
}
