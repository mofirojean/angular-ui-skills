import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { map, startWith } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';

import { MatCardModule } from '@angular/material/card';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { Employee, MockDataService } from '../../core/mock-data.service';

type StatusFilter = Employee['status'] | 'all';

interface DirectoryFilters {
  search: string;
  department: string | null;
  team: string | null;
  status: StatusFilter;
  hiredFrom: Date | null;
  hiredTo: Date | null;
}

@Component({
  selector: 'app-people',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatSlideToggleModule,
    ScrollingModule,
  ],
  templateUrl: './people.html',
  styleUrl: './people.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class People {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  protected readonly loading = this.data.loading;
  protected readonly departments = this.data.departments;
  protected readonly allTeams = this.data.teams;

  protected readonly dataSource = new MatTableDataSource<Employee>([]);

  protected readonly selection = new SelectionModel<Employee>(true, []);

  private readonly selectionVersion = signal(0);
  protected readonly selectedCount = computed(() => {
    this.selectionVersion();
    return this.selection.selected.length;
  });

  protected readonly compact = signal(false);

  protected toggleCompact(value: boolean): void {
    this.compact.set(value);
  }

  protected trackById(_: number, row: Employee): string {
    return row.id;
  }

  protected readonly displayedColumns = [
    'select',
    'name',
    'department',
    'team',
    'manager',
    'location',
    'joined',
    'lastReviewed',
    'status',
    'actions',
  ];

  protected readonly filtersForm = this.fb.group({
    search: this.fb.control(''),
    department: this.fb.control<string | null>(null),
    team: this.fb.control<string | null>(null),
    status: this.fb.control<StatusFilter>('all'),
    hiredFrom: this.fb.control<Date | null>(null),
    hiredTo: this.fb.control<Date | null>(null),
  });

  private readonly filters = toSignal(
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.getRawValue()),
      map(() => this.filtersForm.getRawValue() as DirectoryFilters),
    ),
    { initialValue: this.filtersForm.getRawValue() as DirectoryFilters },
  );

  private readonly deptTeamMap: Readonly<Record<string, readonly string[]>> = (() => {
    const acc: Record<string, string[]> = {};
    for (const emp of this.data.employees()) {
      (acc[emp.department] ??= []);
      if (!acc[emp.department].includes(emp.team)) acc[emp.department].push(emp.team);
    }
    return acc;
  })();

  /** Teams available in the team filter, narrowed by the selected department. */
  protected readonly teamOptions = computed<readonly string[]>(() => {
    const dept = this.filters().department;
    return dept ? (this.deptTeamMap[dept] ?? this.allTeams) : this.allTeams;
  });

  /** Top-8 autocomplete suggestions for the name search box. */
  protected readonly searchSuggestions = computed<readonly Employee[]>(() => {
    const q = (this.filters().search ?? '').trim().toLowerCase();
    if (!q) return [];
    return this.data
      .employees()
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q),
      )
      .slice(0, 8);
  });

  protected readonly allEmployeesCount = computed(() => this.data.employees().length);

  protected readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (
      (f.search?.length ? 1 : 0) +
      (f.department ? 1 : 0) +
      (f.team ? 1 : 0) +
      (f.status && f.status !== 'all' ? 1 : 0) +
      (f.hiredFrom ? 1 : 0) +
      (f.hiredTo ? 1 : 0)
    );
  });

  private readonly sort = viewChild(MatSort);
  private readonly paginator = viewChild(MatPaginator);

  constructor() {
    effect(() => {
      const f = this.filters();
      this.dataSource.data = this.applyFilters(this.data.employees(), f);
      const p = this.paginator();
      if (p) p.firstPage();
    });

    effect(() => {
      const sort = this.sort();
      const paginator = this.paginator();
      if (sort) this.dataSource.sort = sort;
      if (paginator) this.dataSource.paginator = paginator;
    });

    this.selection.changed.subscribe(() =>
      this.selectionVersion.update((v) => v + 1),
    );

    this.dataSource.sortingDataAccessor = (row, prop) => {
      switch (prop) {
        case 'joined':       return row.joinedAt.getTime();
        case 'lastReviewed': return row.lastReviewedAt ? row.lastReviewedAt.getTime() : 0;
        case 'name':         return row.name.toLowerCase();
        case 'manager':      return (row.manager ?? '').toLowerCase();
        default:             return (row as unknown as Record<string, string>)[prop] ?? '';
      }
    };
  }

  protected reset(): void {
    this.filtersForm.reset({
      search: '',
      department: null,
      team: null,
      status: 'all',
      hiredFrom: null,
      hiredTo: null,
    });
  }

  protected statusLabel(s: Employee['status']): string {
    if (s === 'active') return 'Active';
    if (s === 'on-leave') return 'On leave';
    return 'Onboarding';
  }

  /** Picking a suggestion replaces the search text with the exact employee name. */
  protected pickSuggestion(name: string): void {
    this.filtersForm.controls.search.setValue(name);
  }

  protected isAllSelected(): boolean {
    const rows = this.dataSource.data;
    return rows.length > 0 && this.selection.selected.length === rows.length;
  }

  protected isPartiallySelected(): boolean {
    const count = this.selection.selected.length;
    return count > 0 && count < this.dataSource.data.length;
  }

  protected toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
  }

  protected clearSelection(): void {
    this.selection.clear();
  }

  /** Row click → profile, but ignore clicks on the select / actions controls. */
  protected onRowClick(row: Employee, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, mat-checkbox, .cell-actions, a')) return;
    this.router.navigate(['/people', row.id]);
  }

  protected rowAction(action: string, row: Employee): void {
    this.snack.open(`${action}: ${row.name}`, 'Undo', { duration: 2400 });
  }

  protected bulkAction(action: string): void {
    const count = this.selection.selected.length;
    if (count === 0) return;
    this.snack.open(`${action} ${count} employees`, 'Undo', { duration: 2400 });
    this.selection.clear();
  }

  private applyFilters(
    employees: readonly Employee[],
    f: DirectoryFilters,
  ): Employee[] {
    return employees.filter((e) => {
      if (f.search) {
        const q = f.search.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.role.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (f.department && e.department !== f.department) return false;
      if (f.team && e.team !== f.team) return false;
      if (f.status && f.status !== 'all' && e.status !== f.status) return false;
      if (f.hiredFrom && e.joinedAt < f.hiredFrom) return false;
      return !(f.hiredTo && e.joinedAt > f.hiredTo);
    });
  }
}
