import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { DataService } from '../../data/data.service';
import { SystemNotification, relativeTime } from '../../data/mock-data';

const KIND_META: Record<SystemNotification['kind'], { icon: string; tone: string; label: string }> = {
  'ticket-assigned': { icon: 'inbox', tone: 'blue', label: 'Assigned' },
  'sla-warning': { icon: 'exclamation-circle', tone: 'red', label: 'SLA' },
  mention: { icon: 'mail', tone: 'gold', label: 'Mention' },
  system: { icon: 'bell', tone: 'default', label: 'System' },
  integration: { icon: 'appstore', tone: 'cyan', label: 'Integration' },
};

@Component({
  selector: 'app-notifications-inbox',
  imports: [
    NzListModule,
    NzIconModule,
    NzTagModule,
    NzButtonModule,
    NzEmptyModule,
    NzDividerModule,
    NzTooltipModule,
  ],
  templateUrl: './notifications-inbox.html',
  styleUrl: './notifications-inbox.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsInbox {
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly kindMeta = KIND_META;
  protected relative = relativeTime;

  protected readonly active = computed(() =>
    this.data.notifications().filter((n) => !n.archived),
  );

  protected readonly archived = computed(() =>
    this.data.notifications().filter((n) => n.archived),
  );

  protected openTicket(n: SystemNotification): void {
    this.data.markNotificationRead(n.id);
    if (n.relatedTicketId) {
      void this.router.navigate(['/tickets', n.relatedTicketId]);
    }
  }

  protected markRead(id: string, event: Event): void {
    event.stopPropagation();
    this.data.markNotificationRead(id);
  }

  protected archive(id: string, event: Event): void {
    event.stopPropagation();
    this.data.archiveNotification(id);
  }
}
