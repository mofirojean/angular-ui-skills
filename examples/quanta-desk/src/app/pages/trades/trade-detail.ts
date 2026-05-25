import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

import { Trade } from './trades.data';

@Component({
  selector: 'app-trade-detail',
  imports: [Button, DatePipe, Tag],
  template: `
    <div class="flex flex-col gap-3 p-1 text-[12px]">
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="bg-primary text-primary-contrast flex h-9 w-9 items-center justify-center rounded text-[11px] font-mono font-semibold">
            {{ t.symbol }}
          </div>
          <div>
            <p class="text-[14px] font-semibold leading-tight">{{ t.name }}</p>
            <p class="text-muted-color mt-0.5 flex items-center gap-1.5 text-[10px] leading-tight">
              <span>{{ t.id }}</span>
              <span>·</span>
              <span>{{ t.account }}</span>
              <span>·</span>
              <span class="font-mono">{{ t.venue }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <p-tag [value]="t.side" [severity]="t.side === 'Buy' ? 'success' : 'danger'" />
          <p-tag [value]="t.status" [severity]="statusSeverity(t.status)" />
        </div>
      </header>

      <div class="border-surface bg-surface-50 dark:bg-surface-900 grid grid-cols-2 gap-2 rounded-md border p-3">
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Quantity</p>
          <p class="mt-1 font-mono text-[14px] font-semibold tabular-nums leading-tight">
            {{ t.filledQty.toLocaleString() }}
            <span class="text-muted-color text-[10px]">/ {{ t.qty.toLocaleString() }}</span>
          </p>
        </div>
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Avg fill price</p>
          <p class="mt-1 font-mono text-[14px] font-semibold tabular-nums leading-tight">\${{ t.price.toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Order type</p>
          <p class="mt-1 font-mono uppercase text-[12px] font-semibold leading-tight">{{ t.orderType }}</p>
        </div>
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Time</p>
          <p class="mt-1 font-mono text-[12px] font-semibold tabular-nums leading-tight">{{ t.date | date:'medium' }}</p>
        </div>
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Total</p>
          <p class="mt-1 font-mono text-[16px] font-semibold tabular-nums leading-tight">\${{ t.total.toLocaleString() }}</p>
        </div>
        <div>
          <p class="text-muted-color text-[9px] font-semibold uppercase tracking-wider leading-none">Fees</p>
          <p class="mt-1 font-mono text-[12px] font-semibold tabular-nums leading-tight">\${{ t.fees.toFixed(2) }}</p>
        </div>
      </div>

      <div>
        <p class="text-muted-color mb-2 text-[10px] font-semibold uppercase tracking-wider">Execution timeline</p>
        <ul class="border-surface relative ml-2 space-y-2 border-l-2 pl-3">
          <li>
            <p class="text-[12px] font-medium leading-tight">Order routed to {{ t.venue }}</p>
            <p class="text-muted-color text-[10px] leading-tight">{{ t.date | date:'medium' }}</p>
          </li>
          @if (t.status !== 'Pending' && t.status !== 'Rejected') {
            <li>
              <p class="text-[12px] font-medium leading-tight">
                {{ t.status === 'Filled' ? 'Filled' : t.status === 'Partial' ? 'Partially filled' : 'Cancelled' }} at \${{ t.price.toFixed(2) }}
              </p>
              <p class="text-muted-color text-[10px] leading-tight">{{ t.date | date:'medium' }}</p>
            </li>
          }
        </ul>
      </div>

      <div class="border-surface flex justify-end gap-1.5 border-t pt-3">
        <p-button label="Close" severity="secondary" variant="text" size="small" (onClick)="close()" />
        <p-button label="Download receipt" icon="pi pi-download" size="small" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeDetail {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig<Trade>);

  protected readonly t: Trade = this.config.data!;

  protected close(): void {
    this.ref.close();
  }

  protected statusSeverity(status: string): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    switch (status) {
      case 'Filled':
        return 'success';
      case 'Partial':
        return 'warn';
      case 'Pending':
        return 'info';
      case 'Cancelled':
        return 'secondary';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
