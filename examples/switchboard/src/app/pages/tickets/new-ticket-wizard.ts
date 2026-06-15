import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../data/data.service';
import { TicketPriority } from '../../data/mock-data';

interface WizardFormValue {
  customer: string;
  category: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  assigneeId: string | null;
}

const CATEGORIES = [
  { value: 'auth', label: 'Authentication' },
  { value: 'billing', label: 'Billing' },
  { value: 'api', label: 'API & webhooks' },
  { value: 'export', label: 'Exports & reports' },
  { value: 'ui', label: 'UI & navigation' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'integration', label: 'Integrations' },
  { value: 'workspace', label: 'Workspace & roles' },
];

@Component({
  selector: 'app-new-ticket-wizard',
  imports: [
    ReactiveFormsModule,
    NzStepsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzFormModule,
    NzRadioModule,
    NzTagModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzAlertModule,
  ],
  templateUrl: './new-ticket-wizard.html',
  styleUrl: './new-ticket-wizard.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTicketWizard {
  readonly done = output<{ id: string; subject: string }>();
  readonly cancelled = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);
  private readonly message = inject(NzMessageService);

  protected readonly step = signal(0);
  protected readonly submitting = signal(false);

  protected readonly categories = CATEGORIES;
  protected readonly priorityOptions: { label: string; value: TicketPriority; hint: string }[] = [
    { value: 'urgent', label: 'Urgent', hint: 'SLA 1h, paging on-call' },
    { value: 'high', label: 'High', hint: 'SLA 4h, in-shift escalation' },
    { value: 'normal', label: 'Normal', hint: 'SLA 24h, standard queue' },
    { value: 'low', label: 'Low', hint: 'SLA 72h, batch with peers' },
  ];

  protected readonly customerOptions = computed(() => {
    const seen = new Set<string>();
    for (const t of this.data.tickets()) seen.add(t.customer);
    return Array.from(seen).sort();
  });

  protected readonly agentOptions = computed(() =>
    this.data.agents().map((a) => ({ label: a.name, value: a.id })),
  );

  protected readonly customerForm = this.fb.nonNullable.group({
    customer: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected readonly categoryForm = this.fb.nonNullable.group({
    category: ['', Validators.required],
    subject: ['', [Validators.required, Validators.minLength(6)]],
    description: [''],
  });

  protected readonly priorityForm = this.fb.nonNullable.group({
    priority: ['normal' as TicketPriority, Validators.required],
    assigneeId: [null as string | null],
  });

  protected readonly stepDefs = [
    { title: 'Customer', subtitle: 'Who is this for?' },
    { title: 'Category', subtitle: 'Subject + details' },
    { title: 'Priority', subtitle: 'Urgency + owner' },
    { title: 'Review', subtitle: 'Confirm and create' },
  ];

  protected next(): void {
    const i = this.step();
    const form = i === 0 ? this.customerForm : i === 1 ? this.categoryForm : this.priorityForm;
    if (form && i < 3) {
      form.markAllAsTouched();
      if (form.invalid) {
        this.message.warning('Please fill in the required fields.');
        return;
      }
    }
    if (i < 3) {
      this.step.update((s) => s + 1);
    }
  }

  protected prev(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected cancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  protected submit(): void {
    if (this.submitting()) return;
    const value = this.collect();
    this.submitting.set(true);
    // Simulate a brief network call before adding so the spinner reads.
    setTimeout(() => {
      const ticket = this.data.addTicket({
        subject: value.subject,
        customer: value.customer,
        priority: value.priority,
        assigneeId: value.assigneeId,
        tags: [value.category],
      });
      this.submitting.set(false);
      this.reset();
      this.done.emit({ id: ticket.id, subject: ticket.subject });
    }, 350);
  }

  protected reset(): void {
    this.step.set(0);
    this.customerForm.reset({ customer: '' });
    this.categoryForm.reset({ category: '', subject: '', description: '' });
    this.priorityForm.reset({ priority: 'normal', assigneeId: null });
  }

  protected collect(): WizardFormValue {
    return {
      customer: this.customerForm.value.customer ?? '',
      category: this.categoryForm.value.category ?? '',
      subject: this.categoryForm.value.subject ?? '',
      description: this.categoryForm.value.description ?? '',
      priority: this.priorityForm.value.priority ?? 'normal',
      assigneeId: this.priorityForm.value.assigneeId ?? null,
    };
  }

  protected categoryLabel(value: string): string {
    return this.categories.find((c) => c.value === value)?.label ?? value;
  }

  protected agentName(id: string | null): string {
    if (!id) return 'Unassigned';
    return this.data.agentById(id)?.name ?? 'Unassigned';
  }
}
