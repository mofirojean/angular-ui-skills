import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTransferModule, TransferItem, TransferChange } from 'ng-zorro-antd/transfer';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../data/data.service';
import { Agent, relativeTime } from '../../data/mock-data';

@Component({
  selector: 'app-agents',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzCardModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTagModule,
    NzProgressModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzModalModule,
    NzDescriptionsModule,
    NzTimelineModule,
    NzTransferModule,
    NzQRCodeModule,
    NzDividerModule,
    NzTooltipModule,
    NzStatisticModule,
  ],
  templateUrl: './agents.html',
  styleUrl: './agents.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Agents {
  protected readonly data = inject(DataService);
  private readonly modal = inject(NzModalService);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);

  protected relative = relativeTime;

  // Modal templates passed to NzModalService.create()
  protected readonly detailTpl = viewChild<TemplateRef<unknown>>('detailTpl');
  protected readonly inviteTpl = viewChild<TemplateRef<unknown>>('inviteTpl');

  protected readonly active = signal<Agent | null>(null);
  protected readonly transferList = signal<TransferItem[]>([]);

  protected readonly inviteForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['Agent' as string, Validators.required],
  });

  protected readonly roleOptions = ['Agent', 'Senior Agent', 'Tier 2', 'Lead'];

  protected readonly mobilePairUrl = computed(() => {
    const a = this.active();
    if (!a) return 'https://switchboard.example/m/pair';
    return `https://switchboard.example/m/pair?agent=${a.id}&token=mock`;
  });

  protected loadPctStrokeColor(pct: number): string {
    if (pct >= 80) return '#ef4444';
    if (pct >= 60) return '#f97316';
    return '#2563eb';
  }

  protected openDetail(agent: Agent): void {
    this.active.set(agent);
    this.transferList.set(this.buildTransferList(agent));
    const tpl = this.detailTpl();
    if (!tpl) return;
    this.modal.create({
      nzTitle: undefined,
      nzContent: tpl,
      nzWidth: 760,
      nzFooter: null,
      nzCentered: true,
      nzClassName: 'agent-detail-modal',
    });
  }

  protected openInvite(): void {
    this.inviteForm.reset({ name: '', email: '', role: 'Agent' });
    const tpl = this.inviteTpl();
    if (!tpl) return;
    const ref = this.modal.create({
      nzTitle: 'Invite a new agent',
      nzContent: tpl,
      nzWidth: 480,
      nzOkText: 'Send invitation',
      nzCentered: true,
      nzOnOk: () => {
        if (this.inviteForm.invalid) {
          this.inviteForm.markAllAsTouched();
          this.message.warning('Please complete the form.');
          return false;
        }
        const value = this.inviteForm.getRawValue();
        const agent = this.data.addAgent({ name: value.name, email: value.email, role: value.role });
        this.message.success(`Invitation sent to ${agent.name}`);
        return true;
      },
    });
    void ref;
  }

  // --- Transfer permissions helpers ---

  private buildTransferList(agent: Agent): TransferItem[] {
    const granted = new Set(agent.permissions);
    return this.data.permissions().map((p) => ({
      key: p.key,
      title: p.title,
      description: p.description,
      direction: granted.has(p.key) ? 'right' : 'left',
    }));
  }

  protected onTransferChange(event: TransferChange): void {
    const a = this.active();
    if (!a) return;
    // Apply the move locally to the transferList signal.
    this.transferList.update((items) => {
      const moved = new Set(event.list.map((i) => i['key']));
      return items.map((item) => {
        if (!moved.has(item['key'])) return item;
        return { ...item, direction: event.to };
      });
    });
    const next = this.transferList()
      .filter((i) => i.direction === 'right')
      .map((i) => i['key'] as string);
    this.data.updateAgentPermissions(a.id, next);
    // Refresh active reference so the modal reads the latest copy.
    const refreshed = this.data.agentById(a.id);
    if (refreshed) this.active.set(refreshed);
    this.message.success(`Permissions updated for ${a.name}`);
  }

  protected activityFor(agent: Agent): string[] {
    return [
      `Resolved ${agent.resolvedThisWeek} tickets this week`,
      `Average response ${agent.avgResponseMinutes}m`,
      `Joined ${this.relative(agent.joinedAt)}`,
      `Working in ${agent.timezone}`,
      agent.online ? 'Currently online' : 'Offline',
    ];
  }
}
