import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InitialsPipe } from 'ngx-transforms';

import { MockDataService } from '../../../core/mock-data.service';

@Component({
  selector: 'app-review-wizard',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatChipsModule,
    InitialsPipe,
  ],
  templateUrl: './review-wizard.html',
  styleUrl: './review-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewWizard {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly cycleId = input<string>('');
  readonly employeeId = input<string>('');

  protected readonly cycle = computed(() => this.data.getReviewCycle(this.cycleId()));
  protected readonly participant = computed(() =>
    this.data.getParticipant(this.cycleId(), this.employeeId()),
  );

  protected readonly selfForm = this.fb.group({
    accomplishments: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    growthAreas: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    selfScore: this.fb.control(3.5, { validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
  });

  protected readonly managerForm = this.fb.group({
    strengths: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    opportunities: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    managerScore: this.fb.control(3.5, { validators: [Validators.required] }),
  });

  protected readonly calibrationForm = this.fb.group({
    adjustment: this.fb.control<'unchanged' | 'up' | 'down'>('unchanged'),
    calibrationNotes: this.fb.control(''),
    finalScore: this.fb.control(3.5, { validators: [Validators.required] }),
  });

  protected readonly finalForm = this.fb.group({
    deliveryDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    deliveryChannel: this.fb.control<'in-person' | 'video' | 'written'>('in-person'),
    closingNotes: this.fb.control(''),
    acknowledged: this.fb.control(false, { validators: [Validators.requiredTrue] }),
  });

  protected readonly scoreOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  protected stepCompleteIcon(stage: 'self' | 'manager' | 'calibration' | 'final'): string {
    const p = this.participant();
    if (!p) return 'pending';
    return p.stages[stage] === 'complete' ? 'check_circle' : 'pending';
  }

  protected submit(): void {
    if (this.selfForm.invalid || this.managerForm.invalid || this.calibrationForm.invalid || this.finalForm.invalid) {
      return;
    }
    const cid = this.cycleId();
    const eid = this.employeeId();
    const score = this.calibrationForm.controls.finalScore.value;
    this.data.updateParticipantStage(cid, eid, 'self', 'complete');
    this.data.updateParticipantStage(cid, eid, 'manager', 'complete');
    this.data.updateParticipantStage(cid, eid, 'calibration', 'complete');
    this.data.updateParticipantStage(cid, eid, 'final', 'complete', {
      score,
      summary: this.managerForm.controls.strengths.value,
    });
    this.snack.open('Review submitted', undefined, { duration: 2400 });
    this.router.navigate(['/reviews']);
  }
}
