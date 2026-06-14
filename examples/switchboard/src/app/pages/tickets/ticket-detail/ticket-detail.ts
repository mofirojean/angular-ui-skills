import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzWatermarkModule } from 'ng-zorro-antd/watermark';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../../data/data.service';
import {
  ActivityKind,
  Message,
  TicketPriority,
  TicketStatus,
  formatSlaRemaining,
  relativeTime,
} from '../../../data/mock-data';

const PRIORITY_TAG: Record<TicketPriority, string> = {
  urgent: 'red',
  high: 'volcano',
  normal: 'blue',
  low: 'default',
};

const STATUS_TAG: Record<TicketStatus, string> = {
  open: 'gold',
  'in-progress': 'processing',
  waiting: 'purple',
  resolved: 'success',
};

const ACTIVITY_COLOR: Record<ActivityKind, string> = {
  created: 'blue',
  assigned: 'cyan',
  reassigned: 'cyan',
  replied: 'green',
  'status-change': 'gold',
  'priority-change': 'orange',
  'tag-added': 'purple',
  'sla-warning': 'red',
  resolved: 'green',
};

const ACTIVITY_ICON: Record<ActivityKind, string> = {
  created: 'plus-circle',
  assigned: 'user-switch',
  reassigned: 'swap',
  replied: 'mail',
  'status-change': 'reload',
  'priority-change': 'arrow-up',
  'tag-added': 'tag',
  'sla-warning': 'exclamation-circle',
  resolved: 'check-circle',
};

const SENSITIVE_TAGS = new Set(['security', 'auth', 'billing', 'sso', '2fa']);

@Component({
  selector: 'app-ticket-detail',
  imports: [
    FormsModule,
    RouterLink,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSplitterModule,
    NzTabsModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzListModule,
    NzTimelineModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzStatisticModule,
    NzTableModule,
    NzUploadModule,
    NzWatermarkModule,
    NzDividerModule,
    NzTooltipModule,
    NzSelectModule,
    NzEmptyModule,
    NzAffixModule,
    NzDropDownModule,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  readonly id = input<string>('');

  protected readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  protected readonly priorityTag = PRIORITY_TAG;
  protected readonly statusTag = STATUS_TAG;
  protected readonly activityColor = ACTIVITY_COLOR;
  protected readonly activityIcon = ACTIVITY_ICON;

  protected relative = relativeTime;
  protected sla = formatSlaRemaining;

  protected readonly ticket = computed(() => this.data.ticketById(this.id()));
  protected readonly messages = computed(() => this.data.messagesFor(this.id()));
  protected readonly activity = computed(() => this.data.activityFor(this.id()));
  protected readonly related = computed(() => {
    const t = this.ticket();
    return t ? this.data.relatedTickets(t) : [];
  });

  protected readonly sensitive = computed(() => {
    const t = this.ticket();
    if (!t) return false;
    return t.tags.some((tag) => SENSITIVE_TAGS.has(tag));
  });

  protected readonly slaDeadline = computed(() => this.ticket()?.slaDueAt.getTime() ?? 0);

  // --- Reply composer state ---
  protected readonly replyDraft = signal('');
  protected readonly uploaded = signal<readonly NzUploadFile[]>([]);

  protected readonly priorityOptions: { label: string; value: TicketPriority }[] = [
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Normal', value: 'normal' },
    { label: 'Low', value: 'low' },
  ];

  protected readonly statusOptions: { label: string; value: TicketStatus }[] = [
    { label: 'Open', value: 'open' },
    { label: 'In progress', value: 'in-progress' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Resolved', value: 'resolved' },
  ];

  protected readonly assigneeOptions = computed(() =>
    this.data.agents().map((a) => ({ label: a.name, value: a.id })),
  );

  protected isAgent(m: Message): boolean {
    return m.author !== 'customer';
  }

  protected uploadHandler = (file: NzUploadFile): boolean => {
    this.uploaded.update((list) => [...list, file]);
    return false; // prevent default auto upload
  };

  protected removeAttachment(file: NzUploadFile): void {
    this.uploaded.update((list) => list.filter((f) => f.uid !== file.uid));
  }

  protected sendReply(): void {
    const text = this.replyDraft().trim();
    if (!text && this.uploaded().length === 0) {
      this.message.warning('Type a reply or attach a file before sending.');
      return;
    }
    const attachments = this.uploaded().map((f) => ({
      name: f.name,
      size: f.size ? `${Math.round(f.size / 1024)} KB` : 'unknown',
    }));
    this.data.addMessage(this.id(), text, attachments);
    this.replyDraft.set('');
    this.uploaded.set([]);
    this.message.success('Reply sent (mock)');
  }

  // --- Quick actions on the right panel ---

  protected setAssignee(agentId: string | null): void {
    this.data.updateTicket(this.id(), { assigneeId: agentId });
    this.message.success(agentId ? 'Assignee updated' : 'Unassigned');
  }

  protected setStatus(status: TicketStatus): void {
    this.data.updateTicket(this.id(), { status });
    this.message.success(`Status set to ${status}`);
  }

  protected setPriority(priority: TicketPriority): void {
    this.data.updateTicket(this.id(), { priority });
    this.message.success(`Priority set to ${priority}`);
  }

  protected close(): void {
    void this.router.navigate(['/tickets']);
  }
}
