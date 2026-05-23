import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { BadgeVariant, Integration, InvoiceEntry, Role, TeamMember } from './settings.model';
import { INTEGRATIONS, INVOICE_HISTORY, LOCALES, NOTIFICATION_GROUPS, TEAM_MEMBERS, TIMEZONES } from './settings.data';

interface NotificationChannelState {
  email: boolean;
  slack: boolean;
  push: boolean;
}

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmIcon,
    HlmInputImports,
    HlmLabelImports,
    HlmNativeSelectImports,
    HlmRadioGroupImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSkeletonImports,
    HlmSwitchImports,
    HlmTableImports,
    HlmTabsImports,
    HlmTextareaImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly fb = inject(FormBuilder);

  protected readonly locales = LOCALES;
  protected readonly timezones = TIMEZONES;
  protected readonly notificationGroups = NOTIFICATION_GROUPS;
  protected readonly invoices: readonly InvoiceEntry[] = INVOICE_HISTORY;

  protected readonly team = signal<readonly TeamMember[]>(TEAM_MEMBERS);
  protected readonly integrations = signal<readonly Integration[]>(INTEGRATIONS);

  // Profile form ------------------------------------------------------------

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName: ['Mofiro Jean', [Validators.required, Validators.minLength(2)]],
    email: ['mofiro@example.com', [Validators.required, Validators.email]],
    bio: ['Building open agent-skill tooling. Maker of Mission Control.', [Validators.maxLength(280)]],
    locale: ['en-US'],
    timezone: ['America/New_York'],
    theme: ['system' as 'system' | 'light' | 'dark'],
    density: ['cozy' as 'compact' | 'cozy' | 'comfortable'],
    marketingEmails: [false],
    betaFeatures: [true],
    weeklyDigest: [true],
  });

  protected get nameCtrl() {
    return this.profileForm.controls.fullName;
  }
  protected get emailCtrl() {
    return this.profileForm.controls.email;
  }
  protected get bioCtrl() {
    return this.profileForm.controls.bio;
  }

  protected readonly bioLength = computed(() => this.profileForm.controls.bio.value.length);

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      toast.error('Fix the highlighted fields first');
      return;
    }
    toast.success('Profile saved', { description: 'Changes are live across the workspace' });
  }

  // Team --------------------------------------------------------------------

  protected readonly inviteTrigger = viewChild<ElementRef<HTMLButtonElement>>('inviteTrigger');

  protected readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['editor' as Role, Validators.required],
    message: [''],
  });

  protected get inviteEmailCtrl() {
    return this.inviteForm.controls.email;
  }

  protected openInviteDialog(): void {
    this.inviteForm.reset({ email: '', role: 'editor', message: '' });
    queueMicrotask(() => this.inviteTrigger()?.nativeElement.click());
  }

  protected sendInvite(ctx: { close: () => void }): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    const v = this.inviteForm.getRawValue();
    toast.success(`Invite sent to ${v.email}`, { description: `Role: ${v.role}` });
    ctx.close();
  }

  protected updateRole(memberId: string, value: unknown): void {
    const role = (value as Role) ?? 'viewer';
    this.team.update((list) => list.map((m) => (m.id === memberId ? { ...m, role } : m)));
    toast.info('Role updated');
  }

  protected removeMember(member: TeamMember): void {
    toast.error(`Removed ${member.name}`, { description: 'Mock — no real data was changed' });
  }

  protected roleVariant(role: Role): BadgeVariant {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'outline';
      case 'viewer':
        return 'outline';
    }
  }

  protected readonly roleOptions: readonly { value: Role; label: string }[] = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ];

  // Billing -----------------------------------------------------------------

  protected readonly plan = {
    name: 'Pro',
    price: 49,
    cycle: 'month',
    renews: 'Jun 01, 2026',
  };

  protected readonly usage = [
    { label: 'Agent runs', used: 24380, limit: 50000, unit: '' },
    { label: 'Storage', used: 12.4, limit: 50, unit: 'GB' },
    { label: 'Active agents', used: 18, limit: 50, unit: '' },
    { label: 'Team seats', used: 7, limit: 20, unit: '' },
  ] as const;

  protected usagePercent(used: number, limit: number): number {
    return Math.min(100, (used / limit) * 100);
  }

  protected usageVariant(used: number, limit: number): 'positive' | 'warning' | 'destructive' {
    const pct = (used / limit) * 100;
    if (pct >= 90) return 'destructive';
    if (pct >= 75) return 'warning';
    return 'positive';
  }

  protected invoiceVariant(status: InvoiceEntry['status']): BadgeVariant {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
    }
  }

  // Notifications -----------------------------------------------------------

  protected readonly notificationState = signal<Record<string, NotificationChannelState>>({
    'n-failures': { email: true, slack: true, push: true },
    'n-digest': { email: true, slack: false, push: false },
    'n-quota': { email: true, slack: true, push: false },
    'n-activity': { email: false, slack: true, push: false },
    'n-product': { email: true, slack: false, push: false },
  });

  protected isChannelOn(groupId: string, channel: keyof NotificationChannelState): boolean {
    const state = this.notificationState()[groupId];
    return state ? state[channel] : false;
  }

  protected toggleChannel(groupId: string, channel: keyof NotificationChannelState, value: boolean): void {
    this.notificationState.update((state) => ({
      ...state,
      [groupId]: { ...state[groupId], [channel]: value },
    }));
  }

  // Integrations ------------------------------------------------------------

  protected readonly connectedCount = computed(
    () => this.integrations().filter((i) => i.connected).length,
  );

  protected toggleIntegration(id: string): void {
    let connected = false;
    this.integrations.update((list) =>
      list.map((i) => {
        if (i.id === id) {
          connected = !i.connected;
          return { ...i, connected };
        }
        return i;
      }),
    );
    toast.info(connected ? 'Integration connected' : 'Integration disconnected');
  }

  protected integrationCategoryLabel(cat: Integration['category']): string {
    switch (cat) {
      case 'communication':
        return 'Communication';
      case 'developer':
        return 'Developer';
      case 'productivity':
        return 'Productivity';
      case 'finance':
        return 'Finance';
      case 'storage':
        return 'Storage';
    }
  }
}
