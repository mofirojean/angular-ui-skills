import { Injectable, computed, signal } from '@angular/core';

import {
  AGENTS,
  ANNOUNCEMENTS,
  Agent,
  Announcement,
  DailyVolume,
  Ticket,
  TICKETS,
  VOLUME,
  isToday,
} from './mock-data';

const SIMULATED_LOAD_MS = 400;

@Injectable({ providedIn: 'root' })
export class DataService {
  // `ready` flips to true after a short delay so dashboards can show skeleton placeholders
  // on first load. Set inside the constructor via setTimeout, which is safe for SSR
  // because the platform check happens implicitly (no DOM access).
  readonly ready = signal(false);

  readonly agents = signal<readonly Agent[]>(AGENTS);
  readonly tickets = signal<readonly Ticket[]>(TICKETS);
  readonly announcements = signal<readonly Announcement[]>(ANNOUNCEMENTS);
  readonly volume = signal<readonly DailyVolume[]>(VOLUME);

  readonly onlineAgents = computed(() => this.agents().filter((a) => a.online));

  readonly recentTickets = computed(() =>
    [...this.tickets()]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5),
  );

  readonly kpis = computed(() => {
    const list = this.tickets();
    const now = Date.now();
    return {
      open: list.filter((t) => t.status === 'open').length,
      inProgress: list.filter((t) => t.status === 'in-progress').length,
      resolvedToday: list.filter((t) => t.status === 'resolved' && isToday(t.updatedAt)).length,
      slaBreaches: list.filter((t) => t.status !== 'resolved' && t.slaDueAt.getTime() < now).length,
    };
  });

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.ready.set(true), SIMULATED_LOAD_MS);
    } else {
      this.ready.set(true);
    }
  }

  agentById(id: string | null): Agent | undefined {
    if (!id) return undefined;
    return this.agents().find((a) => a.id === id);
  }
}
