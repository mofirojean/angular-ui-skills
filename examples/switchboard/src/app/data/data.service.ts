import { Injectable, computed, signal } from '@angular/core';

import {
  ACTIVITY,
  AGENTS,
  ANNOUNCEMENTS,
  ActivityEvent,
  Agent,
  Announcement,
  DailyVolume,
  KB_ARTICLES,
  KB_CATEGORIES,
  KbArticle,
  KbCategory,
  MESSAGES,
  Message,
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
  readonly messages = signal<readonly Message[]>(MESSAGES);
  readonly activity = signal<readonly ActivityEvent[]>(ACTIVITY);
  readonly kbArticles = signal<readonly KbArticle[]>(KB_ARTICLES);
  readonly kbCategories = signal<readonly KbCategory[]>(KB_CATEGORIES);

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

  ticketById(id: string): Ticket | undefined {
    return this.tickets().find((t) => t.id === id);
  }

  messagesFor(ticketId: string): readonly Message[] {
    return this.messages().filter((m) => m.ticketId === ticketId);
  }

  activityFor(ticketId: string): readonly ActivityEvent[] {
    return this.activity().filter((e) => e.ticketId === ticketId);
  }

  relatedTickets(ticket: Ticket, limit = 5): readonly Ticket[] {
    return this.tickets()
      .filter((t) => t.id !== ticket.id && (t.customer === ticket.customer || t.tags.some((tag) => ticket.tags.includes(tag))))
      .slice(0, limit);
  }

  addMessage(ticketId: string, body: string, attachments?: { name: string; size: string }[]): void {
    if (!body.trim() && (!attachments || attachments.length === 0)) return;
    const next: Message = {
      id: `${ticketId}-m${this.messages().length + 1}`,
      ticketId,
      author: { agentId: 'a-001' },
      authorName: 'Mofiro Jean',
      initials: 'MJ',
      body: body.trim(),
      createdAt: new Date(),
      attachments,
    };
    this.messages.update((list) => [...list, next]);
    this.updateTicket(ticketId, {});
  }

  updateTicket(id: string, patch: Partial<Omit<Ticket, 'id'>>): void {
    this.tickets.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t)),
    );
  }

  bulkUpdateTickets(ids: Iterable<string>, patch: Partial<Omit<Ticket, 'id'>>): void {
    const idSet = new Set(ids);
    if (idSet.size === 0) return;
    this.tickets.update((list) =>
      list.map((t) => (idSet.has(t.id) ? { ...t, ...patch, updatedAt: new Date() } : t)),
    );
  }

  addTicket(input: {
    subject: string;
    customer: string;
    priority: Ticket['priority'];
    assigneeId: string | null;
    tags: readonly string[];
  }): Ticket {
    const nextNumber = this.tickets().reduce((max, t) => {
      const n = parseInt(t.id.replace(/^T-/, ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 2000) + 1;
    const now = new Date();
    const ticket: Ticket = {
      id: `T-${nextNumber}`,
      subject: input.subject,
      customer: input.customer,
      priority: input.priority,
      status: input.assigneeId ? 'in-progress' : 'open',
      assigneeId: input.assigneeId,
      createdAt: now,
      updatedAt: now,
      slaDueAt: new Date(now.getTime() + 24 * 60 * 60_000),
      tags: input.tags,
    };
    this.tickets.update((list) => [ticket, ...list]);
    return ticket;
  }
}
