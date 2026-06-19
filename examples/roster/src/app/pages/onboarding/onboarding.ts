import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  CdkDragDrop,
  DragDropModule,
} from '@angular/cdk/drag-drop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InitialsPipe, TimeAgoPipe } from 'ngx-transforms';

import { MockDataService } from '../../core/mock-data.service';
import { OnboardingHire, OnboardingStage } from '../../core/model';

interface Column {
  readonly stage: OnboardingStage;
  readonly label: string;
  readonly tone: 'offer' | 'setup' | 'day1' | 'thirty';
}

@Component({
  selector: 'app-onboarding',
  imports: [
    DatePipe,
    RouterLink,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    InitialsPipe,
    TimeAgoPipe,
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Onboarding {
  private readonly data = inject(MockDataService);
  private readonly snack = inject(MatSnackBar);

  protected readonly hires = this.data.hires;

  protected readonly columns: readonly Column[] = [
    { stage: 'Offer',   label: 'Offer',          tone: 'offer' },
    { stage: 'Setup',   label: 'Setup',          tone: 'setup' },
    { stage: 'Day 1',   label: 'Day 1',          tone: 'day1' },
    { stage: '30 days', label: 'First 30 days',  tone: 'thirty' },
  ];

  /** Returns the hires assigned to a particular stage, kept reactive. */
  hiresInStage(stage: OnboardingStage) {
    return computed(() => this.hires().filter((h) => h.stage === stage));
  }

  protected onDrop(event: CdkDragDrop<OnboardingStage>): void {
    const target = event.container.data;
    const hire = event.item.data as OnboardingHire;
    if (hire.stage === target) return;
    this.data.moveHireToStage(hire.id, target);
    this.snack.open(`Moved ${hire.name} → ${target}`, 'Undo', { duration: 2400 });
  }

  protected stageMeta(stage: OnboardingStage): { icon: string; tip: string } {
    switch (stage) {
      case 'Offer':   return { icon: 'mail',     tip: 'Offer extended, signing in flight' };
      case 'Setup':   return { icon: 'build',    tip: 'Provisioning equipment and accounts' };
      case 'Day 1':   return { icon: 'door_open', tip: 'Active on Day 1' };
      case '30 days': return { icon: 'flag',     tip: 'Ramping through first 30 days' };
    }
  }
}