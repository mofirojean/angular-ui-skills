import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import {
  NzDropDownModule,
  NzContextMenuService,
  NzDropdownMenuComponent,
  NzDropdownDirective
} from 'ng-zorro-antd/dropdown';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../data/data.service';
import { NewTicketWizard } from './new-ticket-wizard';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  formatSlaRemaining,
  relativeTime,
} from '../../data/mock-data';

type StatusFilter = TicketStatus | 'all';

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

@Component({
  selector: 'app-tickets',
  imports: [
    FormsModule,
    NzTableModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzSegmentedModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzAvatarModule,
    NzCheckboxModule,
    NzDropDownModule,
    NzDrawerModule,
    NzEmptyModule,
    NzDividerModule,
    NzTooltipModule,
    NzBadgeModule,
    NzDropdownMenuComponent,
    NewTicketWizard,
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tickets {
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly contextMenu = inject(NzContextMenuService);

  protected readonly priorityTag = PRIORITY_TAG;
  protected readonly statusTag = STATUS_TAG;

  protected relative = relativeTime;
  protected sla = formatSlaRemaining;

  // --- Filter state ---
  protected readonly search = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly priorityFilter = signal<TicketPriority | null>(null);
  protected readonly assigneeFilter = signal<string | 'unassigned' | null>(null);
  protected readonly dateRange = signal<Date[] | null>(null);

  // --- Selection + expansion + context menu state ---
  protected readonly selectedIds = signal<readonly string[]>([]);
  protected readonly expandedIds = signal<readonly string[]>([]);
  protected readonly drawerOpen = signal(false);
  protected readonly editingPriorityId = signal<string | null>(null);
  private contextRow: Ticket | null = null;

  protected readonly rowMenu = viewChild<NzDropdownMenuComponent>('rowMenu');

  // --- Filter dropdown options ---

  protected readonly statusOptions = [
    { label: 'All', value: 'all' as StatusFilter },
    { label: 'Open', value: 'open' as StatusFilter },
    { label: 'In progress', value: 'in-progress' as StatusFilter },
    { label: 'Waiting', value: 'waiting' as StatusFilter },
    { label: 'Resolved', value: 'resolved' as StatusFilter },
  ];

  protected readonly priorityOptions: { label: string; value: TicketPriority }[] = [
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Normal', value: 'normal' },
    { label: 'Low', value: 'low' },
  ];

  protected readonly assigneeOptions = computed(() => [
    { label: 'Unassigned', value: 'unassigned' as const },
    ...this.data.agents().map((a) => ({ label: a.name, value: a.id })),
  ]);

  // --- Computed filtered + sorted list ---

  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const assignee = this.assigneeFilter();
    const range = this.dateRange();

    return this.data.tickets().filter((t) => {
      if (q) {
        const hit =
          t.subject.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (status !== 'all' && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (assignee === 'unassigned' && t.assigneeId !== null) return false;
      if (assignee && assignee !== 'unassigned' && t.assigneeId !== assignee) return false;
      if (range && range.length === 2) {
        const from = range[0].getTime();
        const to = range[1].getTime();
        const created = t.createdAt.getTime();
        if (created < from || created > to) return false;
      }
      return true;
    });
  });

  protected readonly hasActiveFilters = computed(() => {
    return (
      this.search().length > 0 ||
      this.statusFilter() !== 'all' ||
      this.priorityFilter() !== null ||
      this.assigneeFilter() !== null ||
      this.dateRange() !== null
    );
  });

  protected readonly allOnPageSelected = computed(() => {
    const all = this.filtered();
    if (all.length === 0) return false;
    const selected = new Set(this.selectedIds());
    return all.every((t) => selected.has(t.id));
  });

  protected readonly someSelected = computed(() => {
    const selected = new Set(this.selectedIds());
    const all = this.filtered();
    return all.some((t) => selected.has(t.id)) && !this.allOnPageSelected();
  });

  // --- Sort functions ---

  protected readonly sortById = (a: Ticket, b: Ticket) => a.id.localeCompare(b.id);
  protected readonly sortBySubject = (a: Ticket, b: Ticket) => a.subject.localeCompare(b.subject);
  protected readonly sortByCustomer = (a: Ticket, b: Ticket) => a.customer.localeCompare(b.customer);
  protected readonly sortByPriority = (a: Ticket, b: Ticket) => {
    const order: TicketPriority[] = ['urgent', 'high', 'normal', 'low'];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  };
  protected readonly sortByStatus = (a: Ticket, b: Ticket) => {
    const order: TicketStatus[] = ['open', 'in-progress', 'waiting', 'resolved'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  };
  protected readonly sortByCreated = (a: Ticket, b: Ticket) =>
    a.createdAt.getTime() - b.createdAt.getTime();
  protected readonly sortByUpdated = (a: Ticket, b: Ticket) =>
    a.updatedAt.getTime() - b.updatedAt.getTime();
  protected readonly sortBySla = (a: Ticket, b: Ticket) =>
    a.slaDueAt.getTime() - b.slaDueAt.getTime();

  // --- Selection handlers ---

  protected isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  protected toggleRow(id: string, checked: boolean): void {
    this.selectedIds.update((list) =>
      checked ? [...list, id] : list.filter((i) => i !== id),
    );
  }

  protected togglePage(checked: boolean): void {
    const pageIds = this.filtered().map((t) => t.id);
    if (checked) {
      this.selectedIds.update((list) => Array.from(new Set([...list, ...pageIds])));
    } else {
      const pageSet = new Set(pageIds);
      this.selectedIds.update((list) => list.filter((id) => !pageSet.has(id)));
    }
  }

  protected clearSelection(): void {
    this.selectedIds.set([]);
  }

  // --- Expansion ---

  protected isExpanded(id: string): boolean {
    return this.expandedIds().includes(id);
  }

  protected toggleExpand(id: string): void {
    this.expandedIds.update((list) =>
      list.includes(id) ? list.filter((i) => i !== id) : [...list, id],
    );
  }

  // --- Inline edit (priority) ---

  protected editPriority(id: string): void {
    this.editingPriorityId.set(id);
  }

  protected savePriority(id: string, next: TicketPriority): void {
    this.data.updateTicket(id, { priority: next });
    this.editingPriorityId.set(null);
    this.message.success(`Priority updated to ${next}`);
  }

  protected cancelEditPriority(): void {
    this.editingPriorityId.set(null);
  }

  // --- Row navigation ---

  protected open(id: string): void {
    void this.router.navigate(['/tickets', id]);
  }

  // --- Reset ---

  protected reset(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set(null);
    this.assigneeFilter.set(null);
    this.dateRange.set(null);
  }

  // --- Context menu ---

  protected onRowContext(event: MouseEvent, row: Ticket): void {
    event.preventDefault();
    this.contextRow = row;
    const menu = this.rowMenu();
    if (menu) this.contextMenu.create(event, menu);
  }

  protected openActionsMenu(event: MouseEvent, row: Ticket): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextRow = row;
    const menu = this.rowMenu();
    if (menu) this.contextMenu.create(event, menu);
  }

  protected ctxOpen(): void {
    if (this.contextRow) this.open(this.contextRow.id);
  }

  protected ctxAssignToMe(): void {
    if (!this.contextRow) return;
    this.data.updateTicket(this.contextRow.id, { assigneeId: 'a-001', status: 'in-progress' });
    this.message.success(`Assigned ${this.contextRow.id} to you`);
  }

  protected ctxClose(): void {
    if (!this.contextRow) return;
    this.data.updateTicket(this.contextRow.id, { status: 'resolved' });
    this.message.success(`${this.contextRow.id} marked as resolved`);
  }

  protected ctxMarkOpen(): void {
    if (!this.contextRow) return;
    this.data.updateTicket(this.contextRow.id, { status: 'open' });
  }

  protected ctxBumpPriority(): void {
    if (!this.contextRow) return;
    const order: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];
    const next = order[Math.min(order.indexOf(this.contextRow.priority) + 1, order.length - 1)];
    this.data.updateTicket(this.contextRow.id, { priority: next });
    this.message.success(`Priority bumped to ${next}`);
  }

  // --- Bulk actions ---

  protected bulkResolve(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.data.bulkUpdateTickets(ids, { status: 'resolved' });
    this.message.success(`${ids.length} ticket${ids.length === 1 ? '' : 's'} resolved`);
    this.clearSelection();
  }

  protected bulkAssign(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.data.bulkUpdateTickets(ids, { assigneeId: 'a-001', status: 'in-progress' });
    this.message.success(`${ids.length} ticket${ids.length === 1 ? '' : 's'} assigned to you`);
    this.clearSelection();
  }

  protected bulkExport(): void {
    const count = this.selectedIds().length;
    this.message.info(`Exported ${count} ticket${count === 1 ? '' : 's'} (mock)`);
    this.clearSelection();
  }

  // --- Drawer ---

  protected openNewTicket(): void {
    this.drawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  protected onTicketCreated(created: { id: string; subject: string }): void {
    this.drawerOpen.set(false);
    this.message.success(`Created ${created.id}`);
  }

  // --- Helpers used in the template ---

  protected agentName(id: string | null): string {
    return this.data.agentById(id)?.name ?? 'Unassigned';
  }

  protected agentInitials(id: string | null): string {
    return this.data.agentById(id)?.initials ?? '··';
  }
}
