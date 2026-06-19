import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, startWith } from 'rxjs';

import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MockDataService } from '../../../core/mock-data.service';
import { OnboardingHire } from '../../../core/model';

const ROLE_POOL = [
  'Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager',
  'Product Manager', 'Senior PM', 'Group PM', 'Data Analyst',
  'Product Designer', 'Senior Designer', 'Lead Designer', 'Brand Designer',
  'Account Executive', 'Senior AE', 'Sales Engineer', 'Sales Manager',
  'Marketer', 'Senior Marketer', 'Content Lead', 'Brand Manager',
  'Recruiter', 'People Partner', 'HR Admin', 'L&D Lead',
];

const LAPTOPS = [
  'MacBook Pro 14"',
  'MacBook Pro 16"',
  'MacBook Air 15"',
  'Dell XPS 13',
  'ThinkPad X1 Carbon',
];

@Component({
  selector: 'app-new-hire',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './new-hire.html',
  styleUrl: './new-hire.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewHire {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly departments = this.data.departments;
  protected readonly locations = this.data.locations;
  protected readonly chipSeparators = [ENTER, COMMA] as const;
  protected readonly laptops = LAPTOPS;

  // --- Form ------------------------------------------------------------------

  protected readonly candidate = this.fb.group({
    name:      this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    email:     this.fb.control('', { validators: [Validators.required, Validators.email] }),
    role:      this.fb.control('', { validators: [Validators.required] }),
    startDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
  });

  protected readonly team = this.fb.group({
    department:     this.fb.control('', { validators: [Validators.required] }),
    manager:        this.fb.control('', { validators: [Validators.required] }),
    location:       this.fb.control('', { validators: [Validators.required] }),
    employmentType: this.fb.control<'full-time' | 'contract' | 'intern'>('full-time', {
      validators: [Validators.required],
    }),
  });

  protected readonly equipment = this.fb.group({
    laptop:          this.fb.control<string>(LAPTOPS[0], { validators: [Validators.required] }),
    accessories:     this.fb.control<readonly string[]>(['Headset', 'Webcam']),
    shippingAddress: this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] }),
  });

  protected readonly confirm = this.fb.group({
    acknowledged: this.fb.control(false, { validators: [Validators.requiredTrue] }),
  });

  // --- Autocomplete suggestions ---------------------------------------------

  private readonly roleQ = toSignal(
    this.candidate.controls.role.valueChanges.pipe(startWith(''), map((v) => v ?? '')),
    { initialValue: '' },
  );
  protected readonly roleSuggestions = computed(() => {
    const q = this.roleQ().toLowerCase();
    if (!q) return ROLE_POOL.slice(0, 8);
    return ROLE_POOL.filter((r) => r.toLowerCase().includes(q)).slice(0, 8);
  });

  private readonly managerQ = toSignal(
    this.team.controls.manager.valueChanges.pipe(startWith(''), map((v) => v ?? '')),
    { initialValue: '' },
  );
  private readonly managerPool = computed(() =>
    Array.from(new Set(this.data.employees().map((e) => e.manager).filter((n): n is string => !!n))),
  );
  protected readonly managerSuggestions = computed(() => {
    const q = this.managerQ().toLowerCase();
    const pool = this.managerPool();
    if (!q) return pool.slice(0, 8);
    return pool.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
  });

  // --- Chip grid (accessories) ---------------------------------------------

  protected addAccessory(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    if (!value) return;
    const current = this.equipment.controls.accessories.value;
    if (!current.includes(value)) {
      this.equipment.controls.accessories.setValue([...current, value]);
    }
    event.chipInput?.clear();
  }

  protected removeAccessory(item: string): void {
    const current = this.equipment.controls.accessories.value;
    this.equipment.controls.accessories.setValue(current.filter((a) => a !== item));
  }

  // --- Submit ----------------------------------------------------------------

  protected readonly submitting = signal(false);

  protected submit(): void {
    if (this.candidate.invalid || this.team.invalid || this.equipment.invalid || this.confirm.invalid) {
      return;
    }
    this.submitting.set(true);
    const c = this.candidate.getRawValue();
    const t = this.team.getRawValue();
    const hire: OnboardingHire = {
      id: `hire-${Math.floor(Math.random() * 10_000)}`,
      name: c.name,
      role: c.role,
      department: t.department,
      team: 'New', // wizard doesn't ask for team explicitly per PLAN, default to "New"
      manager: t.manager,
      location: t.location,
      startDate: c.startDate!,
      stage: 'Offer',
    };
    this.data.addHire(hire);
    this.snack.open(`Onboarding started for ${hire.name}`, 'View board', { duration: 3200 });
    this.router.navigate(['/onboarding']);
  }

  // --- Review helpers --------------------------------------------------------

  protected employmentLabel(v: string): string {
    if (v === 'full-time') return 'Full-time';
    if (v === 'contract') return 'Contract';
    return 'Intern';
  }
}