import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { InitialsPipe, TimeAgoPipe } from 'ngx-transforms';

import { MockDataService } from '../../core/mock-data.service';

interface KpiTile {
  readonly label: string;
  readonly value: number;
  readonly delta: number;
  readonly icon: string;
  readonly tone: 'primary' | 'tertiary' | 'warn' | 'success';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    InitialsPipe,
    TimeAgoPipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly data = inject(MockDataService);

  protected readonly loading = this.data.loading;
  protected readonly onLeaveToday = this.data.onLeaveToday;
  protected readonly recentlyJoined = this.data.recentlyJoined;
  protected readonly upcomingBirthdays = this.data.upcomingBirthdays;
  protected readonly openOnboardingTasks = this.data.openOnboardingTasks;

  protected readonly today = new Date(2026, 5, 17);

  protected readonly tiles = computed<readonly KpiTile[]>(() => {
    const k = this.data.kpis();
    return [
      { label: 'Active employees', value: k.activeEmployees, delta: k.deltas.activeEmployees, icon: 'groups',       tone: 'primary'   },
      { label: 'Open positions',   value: k.openPositions,   delta: k.deltas.openPositions,   icon: 'work',         tone: 'tertiary'  },
      { label: 'Pending time off', value: k.pendingTimeOff,  delta: k.deltas.pendingTimeOff,  icon: 'event',        tone: 'warn'      },
      { label: 'Reviews due',      value: k.reviewsDue,      delta: k.deltas.reviewsDue,      icon: 'reviews',      tone: 'success'   },
    ];
  });

  protected readonly onboardingCols = ['hire', 'task', 'stage', 'due', 'owner'];

  protected leaveTypeLabel(type: string): string {
    switch (type) {
      case 'vacation': return 'Vacation';
      case 'sick':     return 'Sick';
      case 'personal': return 'Personal';
      case 'parental': return 'Parental';
      default:         return type;
    }
  }

  protected birthdayLabel(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  }

  protected dueLabel(days: number): string {
    if (days === 0) return 'Today';
    if (days < 0) return `${-days}d overdue`;
    return `In ${days}d`;
  }

  protected dueOverdue(days: number): boolean {
    return days <= 0;
  }

  protected stageClass(stage: string): string {
    return 'stage--' + stage.toLowerCase().replace(/\s+/g, '-');
  }
}
