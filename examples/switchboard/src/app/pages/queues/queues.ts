import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../data/data.service';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  formatSlaRemaining,
  isSameDay,
} from '../../data/mock-data';

type ViewMode = 'kanban' | 'table' | 'calendar';

interface Column {
  readonly status: TicketStatus;
  readonly label: string;
  readonly accent: string;
  readonly tickets: readonly Ticket[];
}

const COLUMN_DEFS: { status: TicketStatus; label: string; accent: string }[] = [
  { status: 'open', label: 'To do', accent: '#d4a017' },
  { status: 'in-progress', label: 'In progress', accent: '#2563eb' },
  { status: 'waiting', label: 'Waiting on customer', accent: '#8b5cf6' },
  { status: 'resolved', label: 'Resolved', accent: '#10b981' },
];

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

const CURRENT_AGENT_ID = 'a-001';

@Component({
  selector: 'app-queues',
  imports: [
    FormsModule,
    DragDropModule,
    NzSegmentedModule,
    NzCardModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTagModule,
    NzTooltipModule,
    NzSwitchModule,
    NzTableModule,
    NzCalendarModule,
    NzEmptyModule,
    NzIconModule,
  ],
  templateUrl: './queues.html',
  styleUrl: './queues.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Queues {
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  protected readonly priorityTag = PRIORITY_TAG;
  protected readonly statusTag = STATUS_TAG;
  protected sla = formatSlaRemaining;

  protected readonly mode = signal<ViewMode>('kanban');
  protected readonly onlyMine = signal(false);
  protected readonly selectedDate = signal<Date>(new Date());

  protected readonly modeOptions = [
    { label: 'Kanban', value: 'kanban' as ViewMode, icon: 'appstore' },
    { label: 'Table', value: 'table' as ViewMode, icon: 'unordered-list' },
    { label: 'Calendar', value: 'calendar' as ViewMode, icon: 'calendar' },
  ];

  /** Tickets after the "only mine" filter is applied. */
  protected readonly visible = computed(() => {
    const all = this.data.tickets();
    return this.onlyMine() ? all.filter((t) => t.assigneeId === CURRENT_AGENT_ID) : all;
  });

  protected readonly columns = computed<readonly Column[]>(() => {
    const tickets = this.visible();
    return COLUMN_DEFS.map((col) => ({
      ...col,
      tickets: tickets.filter((t) => t.status === col.status),
    }));
  });

  protected readonly dropListIds = computed(() => COLUMN_DEFS.map((c) => c.status));

  protected readonly visibleCount = computed(() => this.visible().length);

  // --- Drag-drop ---

  protected onDrop(event: CdkDragDrop<readonly Ticket[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering inside the same column does nothing in the mock,
      // status doesn't change.
      return;
    }
    const ticket = event.previousContainer.data[event.previousIndex];
    const targetStatus = event.container.id as TicketStatus;
    this.data.updateTicket(ticket.id, { status: targetStatus });
    this.message.success(`${ticket.id} moved to ${this.labelFor(targetStatus)}`);
  }

  protected labelFor(status: TicketStatus): string {
    return COLUMN_DEFS.find((c) => c.status === status)?.label ?? status;
  }

  // --- Calendar mode ---

  protected ticketsOn(date: Date): readonly Ticket[] {
    return this.visible().filter((t) => isSameDay(t.createdAt, date));
  }

  // --- Helpers ---

  protected open(id: string): void {
    void this.router.navigate(['/tickets', id]);
  }

  protected agentInitials(id: string | null): string {
    return this.data.agentById(id)?.initials ?? '··';
  }

  protected agentName(id: string | null): string {
    return this.data.agentById(id)?.name ?? 'Unassigned';
  }
}
