import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InitialsPipe } from 'ngx-transforms';

import { MockDataService } from '../../core/mock-data.service';
import {
  LeaveType,
  TimeOffRequest,
  TimeOffStatus,
} from '../../core/model';
import { DayDetailSheet } from './day-detail-sheet';

type StatusFilter = TimeOffStatus | 'all';

@Component({
  selector: 'app-time-off',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatChipsModule,
    MatBottomSheetModule,
    InitialsPipe,
  ],
  templateUrl: './time-off.html',
  styleUrl: './time-off.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeOff {
  private readonly data = inject(MockDataService);
  private readonly sheet = inject(MatBottomSheet);
  private readonly snack = inject(MatSnackBar);

  protected readonly requests = this.data.timeOffRequests;
  protected readonly balances = this.data.leaveBalances;

  protected readonly month = signal(new Date(2026, 5, 1));

  protected readonly monthLabel = computed(() => {
    const m = this.month();
    return m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  protected readonly monthCells = computed(() => {
    const m = this.month();
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const startWeekday = first.getDay();
    const start = new Date(first);
    start.setDate(first.getDate() - startWeekday);
    const cells: { date: Date; inMonth: boolean; key: string }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        date: d,
        inMonth: d.getMonth() === m.getMonth(),
        key: d.toISOString().slice(0, 10),
      });
    }
    return cells;
  });

  protected readonly leaveByDay = computed(() => {
    const map = new Map<string, TimeOffRequest[]>();
    for (const r of this.requests()) {
      if (r.status !== 'approved') continue;
      const cur = new Date(r.startDate);
      while (cur <= r.endDate) {
        const key = cur.toISOString().slice(0, 10);
        const arr = map.get(key) ?? [];
        arr.push(r);
        map.set(key, arr);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  });

  protected leaveForDay(key: string): readonly TimeOffRequest[] {
    return this.leaveByDay().get(key) ?? [];
  }

  protected stepMonth(delta: number): void {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  protected openDay(key: string, date: Date): void {
    const entries = this.leaveForDay(key);
    if (entries.length === 0) return;
    this.sheet.open(DayDetailSheet, {
      data: { date, entries },
    });
  }

  protected isToday(date: Date): boolean {
    const t = new Date(2026, 5, 18);
    return date.getFullYear() === t.getFullYear()
      && date.getMonth() === t.getMonth()
      && date.getDate() === t.getDate();
  }

  protected readonly statusFilter = signal<StatusFilter>('all');

  protected setStatusFilter(s: StatusFilter): void {
    this.statusFilter.set(s);
  }

  protected readonly filteredRequests = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'all') return this.requests();
    return this.requests().filter((r) => r.status === filter);
  });

  protected readonly requestCols = [
    'employee', 'type', 'dates', 'days', 'reason', 'requested', 'status', 'actions',
  ];

  protected approveRequest(req: TimeOffRequest): void {
    const previous = this.data.setRequestStatus(req.id, 'approved');
    this.openUndoSnack(`Approved ${req.employeeName}'s request`, req, previous);
  }

  protected rejectRequest(req: TimeOffRequest): void {
    const previous = this.data.setRequestStatus(req.id, 'rejected');
    this.openUndoSnack(`Rejected ${req.employeeName}'s request`, req, previous);
  }

  private openUndoSnack(message: string, req: TimeOffRequest, previous: TimeOffStatus | null): void {
    const ref = this.snack.open(message, 'Undo', { duration: 3200 });
    ref.onAction().subscribe(() => {
      if (previous) this.data.setRequestStatus(req.id, previous);
    });
  }

  protected statusLabel(s: TimeOffStatus): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  protected typeLabel(t: LeaveType): string {
    if (t === 'vacation') return 'Vacation';
    if (t === 'sick') return 'Sick';
    if (t === 'personal') return 'Personal';
    return 'Parental';
  }

  protected pendingCount = computed(() => this.requests().filter((r) => r.status === 'pending').length);
}