import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ColorPicker } from 'primeng/colorpicker';
import { FloatLabel } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { IftaLabel } from 'primeng/iftalabel';
import { InputMask } from 'primeng/inputmask';
import { InputText } from 'primeng/inputtext';
import { Knob } from 'primeng/knob';
import { MeterGroupModule } from 'primeng/metergroup';
import { Password } from 'primeng/password';
import { ProgressBar } from 'primeng/progressbar';
import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';

import {
  API_KEYS,
  ApiKey,
  INVOICES,
  Invoice,
  LOCALES,
  NOTIFICATION_CHANNELS,
  TIMEZONES,
  USAGE,
} from './settings.data';

type Channel = 'email' | 'desktop' | 'sms';
type NotifMatrix = Record<string, Record<Channel, boolean>>;

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Avatar,
    Button,
    Checkbox,
    ColorPicker,
    FloatLabel,
    IconField,
    IftaLabel,
    InputIcon,
    InputMask,
    InputText,
    Knob,
    MeterGroupModule,
    Password,
    PrimeTemplate,
    ProgressBar,
    RadioButton,
    Rating,
    Select,
    SelectButton,
    Slider,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TableModule,
    Tag,
    Textarea,
    ToggleSwitch,
    Tooltip,
  ],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly confirmer = inject(ConfirmationService);

  protected readonly activeTab = signal<'profile' | 'trading' | 'notifications' | 'keys' | 'billing'>('profile');

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName: ['Mofiro Jean', [Validators.required, Validators.minLength(2)]],
    email: ['mofiro@example.com', [Validators.required, Validators.email]],
    phone: ['(415) 555-0123'],
    bio: ['Open-source maker. Building agent skills for Angular UI libraries.', [Validators.maxLength(280)]],
    locale: ['en-US'],
    timezone: ['America/New_York'],
    theme: ['system' as 'system' | 'light' | 'dark'],
    accent: ['#8b5cf6'],
    newPassword: [''],
  });

  protected readonly bioLength = computed(() => this.profileForm.controls.bio.value.length);

  protected readonly locales = [...LOCALES];
  protected readonly timezones = [...TIMEZONES];

  protected readonly tradingForm = this.fb.nonNullable.group({
    defaultOrderType: ['market' as 'market' | 'limit' | 'stop'],
    sizingMode: ['shares' as 'shares' | 'dollars' | 'percent'],
    defaultRisk: [25],
    confidenceLevel: [4],
    riskScore: [62],
    confirmBeforeSubmit: [true],
    confirmLargeOnly: [false],
    autofillLast: [true],
    rememberSize: [false],
  });

  protected readonly orderTypeOptions = [
    { label: 'Market', value: 'market' },
    { label: 'Limit', value: 'limit' },
    { label: 'Stop', value: 'stop' },
  ];

  protected readonly sizingOptions = [
    { label: 'Shares', value: 'shares' },
    { label: 'Dollars', value: 'dollars' },
    { label: '% of cash', value: 'percent' },
  ];

  protected readonly notifChannels = NOTIFICATION_CHANNELS;
  protected readonly channels: { id: Channel; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'desktop', label: 'Desktop' },
    { id: 'sms', label: 'SMS' },
  ];
  protected readonly notifications = signal<NotifMatrix>(
    NOTIFICATION_CHANNELS.reduce((acc, c) => {
      acc[c.id] = {
        email: c.id !== 'news',
        desktop: c.id === 'trade-fills' || c.id === 'rejects' || c.id === 'margin',
        sms: c.id === 'margin',
      };
      return acc;
    }, {} as NotifMatrix),
  );

  protected readonly apiKeys = signal<ApiKey[]>([...API_KEYS]);

  protected readonly newKeyForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    env: ['Sandbox' as ApiKey['env'], Validators.required],
  });

  protected readonly envOptions = [
    { label: 'Production', value: 'Production' },
    { label: 'Staging', value: 'Staging' },
    { label: 'Sandbox', value: 'Sandbox' },
  ];

  protected readonly plan = { name: 'Pro', price: 49, cycle: 'month', renews: 'Jun 01, 2025' };
  protected readonly usage = USAGE;
  protected readonly invoices: Invoice[] = [...INVOICES];

  protected readonly meterValue = computed(() =>
    this.usage.map((u) => ({ label: u.label, value: (u.used / u.max) * 100, color: u.color })),
  );

protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Fix the highlighted fields', life: 1800 });
      return;
    }
    this.toast.add({ severity: 'success', summary: 'Profile saved', life: 1500 });
  }

  protected saveTrading(): void {
    this.toast.add({ severity: 'success', summary: 'Trading preferences saved', life: 1500 });
  }

  protected toggleNotif(channelId: string, channel: Channel, value: boolean): void {
    this.notifications.update((m) => ({
      ...m,
      [channelId]: { ...m[channelId], [channel]: value },
    }));
  }

  protected createKey(): void {
    if (this.newKeyForm.invalid) {
      this.newKeyForm.markAllAsTouched();
      return;
    }
    const v = this.newKeyForm.getRawValue();
    const fresh: ApiKey = {
      id: `k-${Date.now()}`,
      name: v.name,
      key: Array.from({ length: 4 })
        .map(() => Math.random().toString(36).slice(2, 6))
        .join('-'),
      env: v.env,
      lastUsed: 'never',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      scope: 'read:*',
    };
    this.apiKeys.update((list) => [fresh, ...list]);
    this.newKeyForm.reset({ name: '', env: 'Sandbox' });
    this.toast.add({ severity: 'success', summary: `Key "${fresh.name}" created`, life: 1800 });
  }

  protected revokeKey(key: ApiKey): void {
    this.confirmer.confirm({
      header: `Revoke "${key.name}"?`,
      message: `This permanently invalidates the key. Anything using it will start returning 401.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Revoke',
      rejectLabel: 'Keep',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { variant: 'text', size: 'small' },
      accept: () => {
        this.apiKeys.update((list) => list.filter((k) => k.id !== key.id));
        this.toast.add({ severity: 'info', summary: `${key.name} revoked`, life: 1500 });
      },
    });
  }

  protected copyKey(key: ApiKey): void {
    void navigator.clipboard?.writeText(key.key);
    this.toast.add({ severity: 'success', summary: 'Key copied to clipboard', life: 1200 });
  }

  protected envSeverity(env: ApiKey['env']): 'danger' | 'warn' | 'secondary' {
    switch (env) {
      case 'Production':
        return 'danger';
      case 'Staging':
        return 'warn';
      case 'Sandbox':
        return 'secondary';
    }
  }

  protected invoiceSeverity(s: Invoice['status']): 'success' | 'warn' | 'danger' {
    return s === 'paid' ? 'success' : s === 'pending' ? 'warn' : 'danger';
  }

  protected usagePct(u: { used: number; max: number }): number {
    return Math.min(100, (u.used / u.max) * 100);
  }
}
