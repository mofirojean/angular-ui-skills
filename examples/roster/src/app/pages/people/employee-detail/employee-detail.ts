import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BytesPipe, InitialsPipe, TimeAgoPipe } from 'ngx-transforms';

import { MockDataService } from '../../../core/mock-data.service';
import { EmployeeStatus } from '../../../core/model';

interface TreeNode {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly isMe: boolean;
  readonly children: readonly TreeNode[];
}

@Component({
  selector: 'app-employee-detail',
  imports: [
    DatePipe,
    LowerCasePipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTreeModule,
    MatTableModule,
    MatDialogModule,
    MatExpansionModule,
    MatListModule,
    MatProgressBarModule,
    InitialsPipe,
    TimeAgoPipe,
    BytesPipe,
  ],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetail {
  private readonly data = inject(MockDataService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly id = input<string>('');

  protected readonly profile = computed(() => this.data.getProfile(this.id()));
  protected readonly departments = this.data.departments;
  protected readonly locations = this.data.locations;

  protected readonly editing = signal(false);

  protected readonly aboutForm = this.fb.group({
    email: this.fb.control(''),
    phone: this.fb.control(''),
    department: this.fb.control(''),
    team: this.fb.control(''),
    location: this.fb.control(''),
    manager: this.fb.control(''),
  });

  /** Manager → me → reports tree for MatTree, derived once per profile. */
  protected readonly tree = computed<TreeNode[]>(() => {
    const p = this.profile();
    if (!p) return [];
    const meNode: TreeNode = {
      id: p.employee.id,
      name: p.employee.name,
      role: p.employee.role,
      isMe: true,
      children: p.reports.map((r) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        isMe: false,
        children: [],
      })),
    };
    if (p.manager) {
      return [
        {
          id: p.manager.id,
          name: p.manager.name,
          role: p.manager.role,
          isMe: false,
          children: [meNode],
        },
      ];
    }
    return [meNode];
  });

  protected readonly childrenOf = (n: TreeNode): TreeNode[] => [...n.children];
  protected hasChildren(_: number, node: TreeNode): boolean {
    return node.children.length > 0;
  }

  constructor() {
    effect(() => {
      const p = this.profile();
      if (!p) return;
      this.aboutForm.reset({
        email: this.emailFor(p.employee.name),
        phone: '+1 (555) 0100',
        department: p.employee.department,
        team: p.employee.team,
        location: p.employee.location,
        manager: p.employee.manager ?? '',
      });
      this.editing.set(false);
    });
  }

  protected emailFor(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '.') + '@acme.com';
  }

  protected toggleEdit(): void {
    this.editing.update((v) => !v);
  }

  protected saveAbout(): void {
    this.snack.open('Profile updated (mock)', 'Undo', { duration: 2400 });
    this.editing.set(false);
  }

  protected cancelEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.aboutForm.reset({
      email: this.emailFor(p.employee.name),
      phone: '+1 (555) 0100',
      department: p.employee.department,
      team: p.employee.team,
      location: p.employee.location,
      manager: p.employee.manager ?? '',
    });
    this.editing.set(false);
  }

  protected statusLabel(s: EmployeeStatus): string {
    if (s === 'active') return 'Active';
    if (s === 'on-leave') return 'On leave';
    return 'Onboarding';
  }

  protected readonly compCols = ['effective', 'amount', 'change', 'reason'];

  protected readonly adjustForm = this.fb.group({
    amount: this.fb.control<number | null>(null),
    reason: this.fb.control<'Annual increase' | 'Promotion' | 'Adjustment'>('Annual increase'),
    note: this.fb.control(''),
  });

  private readonly adjustTpl = viewChild.required<TemplateRef<unknown>>('adjustTpl');

  protected openAdjustDialog(): void {
    const p = this.profile();
    if (!p) return;
    this.adjustForm.reset({
      amount: p.currentSalary,
      reason: 'Annual increase',
      note: '',
    });
    const ref = this.dialog.open(this.adjustTpl(), {
      width: '480px',
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((submitted) => {
      if (submitted) {
        this.snack.open('Compensation adjustment queued (mock)', 'Undo', { duration: 2400 });
      }
    });
  }

  protected changePct(amount: number, prev: number | undefined): number | null {
    if (!prev) return null;
    return Math.round(((amount - prev) / prev) * 1000) / 10;
  }

  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly uploadName = signal<string | null>(null);

  protected onUploadPicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadName.set(file.name);
    this.uploadProgress.set(0);
    const start = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / 1500) * 100));
      this.uploadProgress.set(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          this.snack.open(`Uploaded ${file.name}`, 'Open', { duration: 2400 });
          this.uploadProgress.set(null);
          this.uploadName.set(null);
        }, 250);
      }
    };
    requestAnimationFrame(tick);
  }

  protected activityIcon(kind: string): string {
    switch (kind) {
      case 'joined':           return 'flag';
      case 'role-change':      return 'badge';
      case 'comp-adjustment':  return 'payments';
      case 'doc-upload':       return 'description';
      case 'leave':            return 'event';
      case 'review':           return 'rate_review';
      case 'team-change':      return 'group_work';
      default:                 return 'circle';
    }
  }
}
