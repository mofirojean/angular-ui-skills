import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InitialsPipe } from 'ngx-transforms';

import { MockDataService } from '../../core/mock-data.service';
import {
  ReviewCycle,
  ReviewCycleStatus,
  ReviewParticipant,
  ReviewStageKey,
  ReviewStageStatus,
} from '../../core/model';

interface CycleSummary {
  readonly cycle: ReviewCycle;
  readonly participants: readonly ReviewParticipant[];
  readonly completedCount: number;
  readonly progressPct: number;
}

@Component({
  selector: 'app-reviews',
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
    InitialsPipe,
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reviews {
  private readonly data = inject(MockDataService);

  protected readonly summaries = computed<readonly CycleSummary[]>(() => {
    return this.data.reviewCycles().map((cycle) => {
      const participants = this.data
        .reviewParticipants()
        .filter((p) => p.cycleId === cycle.id);
      const completed = participants.filter((p) =>
        Object.values(p.stages).every((s) => s === 'complete'),
      ).length;
      return {
        cycle,
        participants,
        completedCount: completed,
        progressPct: participants.length === 0
          ? 0
          : Math.round((completed / participants.length) * 100),
      };
    });
  });

  protected readonly cols = ['employee', 'self', 'manager', 'calibration', 'final', 'score'];
  protected readonly stages: readonly { key: ReviewStageKey; label: string }[] = [
    { key: 'self',        label: 'Self' },
    { key: 'manager',     label: 'Manager' },
    { key: 'calibration', label: 'Calibration' },
    { key: 'final',       label: 'Final' },
  ];

  protected cycleStatusLabel(s: ReviewCycleStatus): string {
    if (s === 'planning') return 'Planning';
    if (s === 'active') return 'Active';
    return 'Complete';
  }

  protected stageLabel(s: ReviewStageStatus): string {
    if (s === 'not-started') return 'Not started';
    if (s === 'in-progress') return 'In progress';
    return 'Complete';
  }

  protected stageIcon(s: ReviewStageStatus): string {
    if (s === 'not-started') return 'radio_button_unchecked';
    if (s === 'in-progress') return 'pending';
    return 'check_circle';
  }
}