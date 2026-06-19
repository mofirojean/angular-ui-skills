import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InitialsPipe } from 'ngx-transforms';

import { MockDataService } from '../../../core/mock-data.service';
import { Employee, LeaveType } from '../../../core/model';

@Component({
  selector: 'app-new-time-off-request',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatTooltipModule,
    InitialsPipe,
  ],
  templateUrl: './new-request.html',
  styleUrl: './new-request.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewRequest {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    employee: this.fb.control<Employee | null>(null, { validators: [Validators.required] }),
    type: this.fb.control<LeaveType>('vacation', { validators: [Validators.required] }),
    start: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    end: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    reason: this.fb.control('', { validators: [Validators.required, Validators.minLength(4)] }),
  });

  protected readonly employeeQuery = this.fb.control('');

  private readonly employeeQ = toSignal(
    this.employeeQuery.valueChanges.pipe(startWith(''), map((v) => v ?? '')),
    { initialValue: '' },
  );

  protected readonly employeeSuggestions = computed<readonly Employee[]>(() => {
    const q = this.employeeQ().toLowerCase();
    const list = this.data.employees();
    if (!q) return list.slice(0, 8);
    return list
      .filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
      .slice(0, 8);
  });

  protected employeeLabel = (e: Employee | null): string => (e ? e.name : '');

  protected pickEmployee(e: Employee): void {
    this.form.controls.employee.setValue(e);
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const emp = v.employee!;
    this.data.addTimeOffRequest({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      department: emp.department,
      type: v.type,
      startDate: v.start!,
      endDate: v.end!,
      reason: v.reason,
    });
    this.snack.open(`Request submitted for ${emp.name}`, undefined, { duration: 2400 });
    this.router.navigate(['/time-off']);
  }
}