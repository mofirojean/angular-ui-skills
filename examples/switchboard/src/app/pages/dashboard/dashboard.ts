import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';

import { DataService } from '../../data/data.service';
import { Sparkline } from '../../shared/sparkline/sparkline';
import { TicketPriority, TicketStatus, relativeTime, formatSlaRemaining } from '../../data/mock-data';

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
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NzGridModule,
    NzCardModule,
    NzStatisticModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTableModule,
    NzTagModule,
    NzCarouselModule,
    NzSkeletonModule,
    NzButtonModule,
    NzIconModule,
    NzTooltipModule,
    NzFloatButtonModule,
    Sparkline,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly priorityTag = PRIORITY_TAG;
  protected readonly statusTag = STATUS_TAG;

  protected readonly resolutionRate = computed(() => {
    const k = this.data.kpis();
    const total = k.open + k.inProgress + k.resolvedToday;
    if (total === 0) return 0;
    return Math.round((k.resolvedToday / total) * 100);
  });

  protected relative = relativeTime;
  protected sla = formatSlaRemaining;

  protected agentName(id: string | null): string {
    return this.data.agentById(id)?.name ?? 'Unassigned';
  }

  protected agentInitials(id: string | null): string {
    return this.data.agentById(id)?.initials ?? '··';
  }

  protected goTo(id: string): void {
    void this.router.navigate(['/tickets', id]);
  }

  protected scrollTop(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
