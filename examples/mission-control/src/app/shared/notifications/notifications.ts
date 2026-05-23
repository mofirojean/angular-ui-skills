import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';

type Tone = 'info' | 'success' | 'warning' | 'destructive';

interface Notification {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly time: string;
  readonly icon: string;
  readonly tone: Tone;
  readonly read: boolean;
}

const MOCK: readonly Notification[] = [
  {
    id: 'n1',
    title: 'Lead-qualifier failed 3 retries',
    description: 'OpenAI rate-limited the latest run. Backoff in 4m.',
    time: '2m ago',
    icon: 'lucideCircleX',
    tone: 'destructive',
    read: false,
  },
  {
    id: 'n2',
    title: 'Daily-digest deployed',
    description: 'v1.4.2 went live to production at 09:41.',
    time: '18m ago',
    icon: 'lucideRocket',
    tone: 'success',
    read: false,
  },
  {
    id: 'n3',
    title: 'Quota approaching limit',
    description: '24,380 / 50,000 runs used this month (49%).',
    time: '1h ago',
    icon: 'lucideTriangleAlert',
    tone: 'warning',
    read: false,
  },
  {
    id: 'n4',
    title: 'Sarah Chen joined the workspace',
    description: 'Invited by you · admin role granted.',
    time: '3h ago',
    icon: 'lucideUserPlus',
    tone: 'info',
    read: true,
  },
  {
    id: 'n5',
    title: 'Invoice paid · $49.00',
    description: 'Pro plan · May. Receipt sent to billing@.',
    time: 'yesterday',
    icon: 'lucideCircleCheck',
    tone: 'success',
    read: true,
  },
  {
    id: 'n6',
    title: 'New marketplace agent available',
    description: 'Calendar-Sync 2.0 — 4.8★, install in one click.',
    time: '2d ago',
    icon: 'lucideStore',
    tone: 'info',
    read: true,
  },
];

@Component({
  selector: 'app-notifications',
  imports: [NgIcon, HlmButtonImports, HlmIcon, HlmPopoverImports, HlmSeparatorImports],
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
  protected readonly items = signal<readonly Notification[]>(MOCK);
  protected readonly unread = computed(() => this.items().filter((n) => !n.read).length);

  protected toneClass(tone: Tone): string {
    switch (tone) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600';
      case 'destructive':
        return 'bg-destructive/10 text-destructive';
      case 'info':
        return 'bg-primary/10 text-primary';
    }
  }

  protected markAllRead(): void {
    this.items.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  protected markRead(id: string): void {
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
}
