import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';

interface NotificationPref {
  readonly key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface Integration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  connected: boolean;
}

interface BusinessDay {
  readonly key: string;
  readonly label: string;
  open: Date | null;
  close: Date | null;
  active: boolean;
}

interface Invoice {
  readonly id: string;
  readonly amount: string;
  readonly status: 'paid' | 'open' | 'failed';
  readonly issuedAt: string;
}

function makeTime(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzColorPickerModule,
    NzUploadModule,
    NzSwitchModule,
    NzSliderModule,
    NzTimePickerModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzAvatarModule,
    NzAnchorModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzStatisticModule,
    NzTableModule,
    NzListModule,
    NzTooltipModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  // --- General ---
  protected readonly generalForm = this.fb.nonNullable.group({
    workspaceName: ['Switchboard HQ', [Validators.required]],
    primaryColor: ['#2563eb'],
    language: ['en-US'],
    timezone: ['Europe/London'],
  });

  protected readonly logoFiles = signal<NzUploadFile[]>([]);

  protected uploadLogo = (file: NzUploadFile): boolean => {
    this.logoFiles.set([file]);
    return false;
  };

  // --- Notifications ---
  protected readonly notifications = signal<readonly NotificationPref[]>([
    { key: 'new', label: 'New ticket arrives', description: 'In-app toast plus email digest', enabled: true },
    { key: 'assign', label: 'Ticket assigned to you', description: 'Instant in-app + Slack', enabled: true },
    { key: 'mention', label: '@mention in a thread', description: 'Instant in-app + email', enabled: true },
    { key: 'sla', label: 'SLA window 80% elapsed', description: 'Instant in-app for owner and lead', enabled: true },
    { key: 'reply', label: 'Customer replied', description: 'Email only', enabled: false },
    { key: 'daily', label: 'Daily summary', description: 'Email at end of shift', enabled: false },
  ]);

  protected readonly soundVolume = signal(60);

  protected toggleNotification(key: string, value: boolean): void {
    this.notifications.update((list) =>
      list.map((n) => (n.key === key ? { ...n, enabled: value } : n)),
    );
  }

  // --- Business hours ---
  protected readonly weekdays = signal<readonly BusinessDay[]>([
    { key: 'mon', label: 'Monday', open: makeTime(9), close: makeTime(18), active: true },
    { key: 'tue', label: 'Tuesday', open: makeTime(9), close: makeTime(18), active: true },
    { key: 'wed', label: 'Wednesday', open: makeTime(9), close: makeTime(18), active: true },
    { key: 'thu', label: 'Thursday', open: makeTime(9), close: makeTime(18), active: true },
    { key: 'fri', label: 'Friday', open: makeTime(9), close: makeTime(17), active: true },
    { key: 'sat', label: 'Saturday', open: makeTime(10), close: makeTime(14), active: false },
    { key: 'sun', label: 'Sunday', open: makeTime(10), close: makeTime(14), active: false },
  ]);

  protected toggleDay(key: string, value: boolean): void {
    this.weekdays.update((list) =>
      list.map((d) => (d.key === key ? { ...d, active: value } : d)),
    );
  }

  protected setOpen(key: string, value: Date): void {
    this.weekdays.update((list) =>
      list.map((d) => (d.key === key ? { ...d, open: value } : d)),
    );
  }

  protected setClose(key: string, value: Date): void {
    this.weekdays.update((list) =>
      list.map((d) => (d.key === key ? { ...d, close: value } : d)),
    );
  }

  // --- Integrations ---
  protected readonly integrations = signal<readonly Integration[]>([
    { id: 'slack', name: 'Slack', description: 'Route alerts and quick replies to your shared Slack channel.', connected: true },
    { id: 'github', name: 'GitHub', description: 'Link tickets to issues and pull requests.', connected: true },
    { id: 'stripe', name: 'Stripe', description: 'Pull billing context into customer panels.', connected: true },
    { id: 'jira', name: 'Jira', description: 'Mirror escalations into your engineering backlog.', connected: false },
    { id: 'zapier', name: 'Zapier', description: 'Wire 5,000+ apps through Zaps.', connected: false },
  ]);

  protected disconnect(id: string): void {
    this.integrations.update((list) => list.map((i) => (i.id === id ? { ...i, connected: false } : i)));
    this.message.success('Disconnected');
  }

  protected toggleIntegration(id: string, connected: boolean): void {
    this.integrations.update((list) => list.map((i) => (i.id === id ? { ...i, connected } : i)));
  }

  // --- Billing ---
  protected readonly billingPlan = 'Business · €299 / mo';
  protected readonly seatsInUse = 18;
  protected readonly seatsTotal = 25;
  protected readonly nextInvoiceTotal = '€299.00';

  protected readonly invoices: readonly Invoice[] = [
    { id: 'INV-2026-06', amount: '€299.00', status: 'paid', issuedAt: '2026-06-01' },
    { id: 'INV-2026-05', amount: '€299.00', status: 'paid', issuedAt: '2026-05-01' },
    { id: 'INV-2026-04', amount: '€299.00', status: 'paid', issuedAt: '2026-04-01' },
    { id: 'INV-2026-03', amount: '€299.00', status: 'open', issuedAt: '2026-03-01' },
    { id: 'INV-2026-02', amount: '€299.00', status: 'paid', issuedAt: '2026-02-01' },
  ];

  protected invoiceTagColor(status: Invoice['status']): string {
    return status === 'paid' ? 'success' : status === 'open' ? 'processing' : 'red';
  }

  // --- Save handler (top-level, gathers state from all sections) ---
  protected save(): void {
    this.message.success('Settings saved (mock)');
  }
}
