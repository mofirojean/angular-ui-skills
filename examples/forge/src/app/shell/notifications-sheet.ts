import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import type { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmSheet } from '@spartan-ng/helm/sheet';
import { HlmSheetContent } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import { NotificationsService, type NotificationKind } from '../core/notifications.service';

@Component({
  selector: 'app-notifications-sheet',
  imports: [NgClass, NgIcon, HlmSheet, HlmSheetContent, HlmButtonImports, HlmAvatarImports],
  template: `
    <hlm-sheet [state]="state()" (stateChange)="onState($event)" side="right">
      <hlm-sheet-content class="w-full sm:max-w-md flex flex-col">
        <header class="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
          <ng-icon name="lucideBell" size="14" class="text-muted-foreground"></ng-icon>
          <h2 class="text-base font-semibold tracking-tight">Notifications</h2>
          @if (notifs.unreadCount() > 0) {
            <span class="inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-500/30">
              {{ notifs.unreadCount() }} new
            </span>
          }
          <div class="flex-1"></div>
          @if (notifs.unreadCount() > 0) {
            <button type="button" hlmBtn variant="ghost" size="sm" class="text-xs text-muted-foreground" (click)="notifs.markAllRead()">
              Mark all read
            </button>
          }
        </header>

        @if (notifs.items().length === 0) {
          <div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span class="mb-3 size-10 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ng-icon name="lucideCircleCheck" size="18"></ng-icon>
            </span>
            <p class="text-sm font-medium">You're all caught up</p>
            <p class="mt-1 text-xs text-muted-foreground">No new activity in the last few days.</p>
          </div>
        } @else {
          <ul class="flex-1 overflow-y-auto divide-y divide-border scroll-quiet">
            @for (n of notifs.items(); track n.id) {
              <li class="relative">
                <button
                  type="button"
                  (click)="openPr(n.prId, n.id)"
                  class="w-full text-left flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
                  [class.bg-sky-500\\/5]="!n.read"
                >
                  <span class="absolute left-0 top-0 bottom-0 w-0.5"
                        [class.bg-sky-500]="!n.read"></span>

                  <hlm-avatar class="size-7 shrink-0">
                    <span hlmAvatarFallback class="text-[11px] font-semibold" [ngClass]="n.actor.tone ?? ''">{{ n.actor.initials }}</span>
                  </hlm-avatar>

                  <div class="flex-1 min-w-0">
                    <p class="text-sm leading-snug">
                      <span class="font-medium">{{ n.actor.name }}</span>
                      <span class="text-muted-foreground"> {{ kindLabel(n.kind) }} </span>
                      <span class="font-medium">{{ n.prTitle }}</span>
                    </p>
                    <p class="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span class="font-mono">{{ n.repo }}#{{ n.prId }}</span>
                      <span class="text-muted-foreground/40">·</span>
                      <span class="tabular-nums">{{ n.ago }}</span>
                    </p>
                    @if (n.snippet) {
                      <p class="mt-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border text-[12px] leading-snug text-muted-foreground italic">
                        {{ n.snippet }}
                      </p>
                    }
                  </div>

                  @if (!n.read) {
                    <span class="size-2 rounded-full bg-sky-500 shrink-0 mt-2" aria-label="Unread"></span>
                  }
                </button>
              </li>
            }
          </ul>
        }

        <footer class="px-5 py-2.5 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between text-xs">
          <span class="text-muted-foreground">{{ notifs.items().length }} total</span>
          <button type="button" hlmBtn variant="ghost" size="sm" class="text-xs">
            Notification settings
          </button>
        </footer>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
  styles: `
    .scroll-quiet {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .scroll-quiet::-webkit-scrollbar {
      width: 0;
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsSheet {
  protected readonly notifs = inject(NotificationsService);
  private readonly router = inject(Router);

  protected readonly state = computed<BrnDialogState>(() =>
    this.notifs.open() ? 'open' : 'closed',
  );

  protected onState(state: BrnDialogState | Event): void {
    if (state === 'open' || state === 'closed') {
      this.notifs.open.set(state === 'open');
    }
  }

  protected openPr(prId: string, notifId: string): void {
    this.notifs.markRead(notifId);
    this.notifs.hide();
    this.router.navigate(['/pr', prId]);
  }

  protected kindLabel(k: NotificationKind): string {
    switch (k) {
      case 'review-requested': return 'requested your review on';
      case 'mentioned':        return 'mentioned you on';
      case 'pushed':           return 'pushed new commits to';
      case 'approved':         return 'approved your PR';
      case 'replied':          return 'replied to your comment on';
      case 'ci-failed':        return 'reported a CI failure on';
    }
  }
}
