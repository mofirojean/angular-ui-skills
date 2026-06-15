# Overlays (Feedback)

NG-ZORRO splits overlay UX into two patterns:

1. **Imperative services**, called from TypeScript: `NzModalService`, `NzMessageService`, `NzNotificationService`, `NzDrawerService`. Best for transient confirmations and toasts.
2. **Declarative directives**, applied to a trigger element in the template: `nz-tooltip`, `nz-popover`, `nz-popconfirm`. Best for hover/click hints.

Both use the CDK Overlay underneath, focus management and outside-click handling come for free.

Register the services in `app.config.ts`. **As of v21 there are no `provideNzModal` / `provideNzDrawer` helper functions**, contrary to what some online tutorials show. The pattern is:

- **`NzMessageService` and `NzNotificationService`** , marked `providedIn: 'root'`, **no setup needed**. Inject and use them anywhere.
- **`NzModalService` and `NzDrawerService`** , provided **only by their respective NgModules**, not at root. For standalone-bootstrapped apps, hoist those module providers into the root injector via `importProvidersFrom`:

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...other providers (router, animations, NzI18n, NzIcons)...
    importProvidersFrom(NzModalModule, NzDrawerModule),
  ],
};
```

Symptom if you forget this:
```
ERROR ɵNotFound: NG0201: No provider found for `_NzModalService`. Source: Standalone[_App].
```

The `_` prefix on the class name is intentional, that's how Angular's standalone error formatter renders the service. The fix is the `importProvidersFrom` block above.

## Modal

Centered, focus-trapped dialog.

- Import: `import { NzModalService } from 'ng-zorro-antd/modal';`
- Use case: forms requiring full attention, destructive confirmations.

### Programmatic open

```ts
constructor(private modal = inject(NzModalService)) {}

openTrade() {
  const ref = this.modal.create<TradeFormComponent, TradeFormData>({
    nzTitle: 'Place trade',
    nzContent: TradeFormComponent,
    nzData: { ticker: 'AAPL' },
    nzOkText: 'Place order',
    nzWidth: 560,
    nzOnOk: (instance) => instance.submit(),
  });
}
```

The `nzContent` accepts a `Type<unknown>` (component), a `TemplateRef`, or a string. When using a component, inject `NzModalRef<T, R>` to read `nzData` and call `.close(result)` / `.destroy()`.

### Confirmation helpers

```ts
this.modal.confirm({
  nzTitle: 'Delete this order?',
  nzContent: 'This action cannot be undone.',
  nzOkText: 'Delete',
  nzOkDanger: true,
  nzOnOk: () => this.delete(),
});
```

Also `nzInfo`, `nzSuccess`, `nzWarning`, `nzError` for icon-prefixed variants.

## Drawer

Side panel that slides in from an edge. Use for forms or sub-views that don't fully cover the page.

- Import: `import { NzDrawerService } from 'ng-zorro-antd/drawer';`
- Open: `this.drawer.create({ nzTitle, nzContent, nzPlacement: 'right', nzWidth: 480 });`
- Placements: `'left' | 'right' | 'top' | 'bottom'`.

## Message

Top-of-viewport toast. Auto-dismissing.

- Import: `import { NzMessageService } from 'ng-zorro-antd/message';`
- Use:
  ```ts
  this.msg.success('Saved');
  this.msg.error('Network error');
  this.msg.warning('Unsaved changes');
  this.msg.loading('Submitting...', { nzDuration: 0 }); // sticky until removed
  ```

## Notification

Corner-of-viewport detailed toast (title + description + optional action).

- Import: `import { NzNotificationService } from 'ng-zorro-antd/notification';`
- Use:
  ```ts
  this.notification.create('success', 'Order filled', 'AAPL × 120 at $184.20', {
    nzPlacement: 'topRight',
    nzDuration: 4500,
  });
  ```
- Placements: `'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'`.

Prefer Message for status-only feedback ("Saved"), Notification when there's a title + body or a CTA.

## Tooltip

Hover hint via attribute directive.

- Import: `import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';`
- Markup: `<button nz-button nz-tooltip nzTooltipTitle="Refresh data" nzTooltipPlacement="top">↻</button>`
- Inputs: `nzTooltipTitle`, `nzTooltipPlacement` (12 placements), `nzTooltipTrigger` (`'hover' | 'click' | 'focus' | null`), `nzTooltipColor`, `nzTooltipMouseEnterDelay`, `nzTooltipMouseLeaveDelay`.
- Tooltips augment, they don't replace accessible names. Keep `aria-label` on icon-only buttons even if you have a tooltip.

## Popover

Richer hover/click overlay. Title plus body plus optional template content.

- Import: `import { NzPopoverDirective } from 'ng-zorro-antd/popover';`
- Markup:
  ```html
  <button nz-button nz-popover [nzPopoverTitle]="title" [nzPopoverContent]="body">
    More info
  </button>
  <ng-template #title>About this metric</ng-template>
  <ng-template #body>Day P/L is computed from open-of-day price...</ng-template>
  ```

## Popconfirm

Inline confirmation popup. Use when Modal would be overkill ("Delete row?" on a table action button).

- Import: `import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';`
- Markup:
  ```html
  <button
    nz-button
    nzDanger
    nz-popconfirm
    nzPopconfirmTitle="Delete this row?"
    nzPopconfirmPlacement="top"
    (nzOnConfirm)="delete(row)"
  >
    Delete
  </button>
  ```

## Alert

Inline static alert banner (not a toast, lives in the document flow).

- Import: `import { NzAlertComponent } from 'ng-zorro-antd/alert';`
- Markup: `<nz-alert nzType="warning" nzMessage="Markets close in 10 minutes" nzShowIcon [nzCloseable]="true" />`
- Types: `'success' | 'info' | 'warning' | 'error'`.

## Progress

Linear or circular progress indicator.

- Import: `import { NzProgressComponent } from 'ng-zorro-antd/progress';`
- Markup:
  ```html
  <nz-progress [nzPercent]="42" nzStatus="active" />
  <nz-progress [nzPercent]="100" nzType="circle" />
  ```

## Spin

Loading spinner. Wrap content to overlay a spinner on it during a load.

- Import: `import { NzSpinComponent } from 'ng-zorro-antd/spin';`
- Markup: `<nz-spin [nzSpinning]="loading()"><table>...</table></nz-spin>`
- Standalone: `<nz-spin nzTip="Loading..." />` floats by itself.

## Skeleton

Placeholder shimmer while data loads.

- Import: `import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton';`
- Markup: `<nz-skeleton [nzActive]="true" [nzLoading]="loading()"><app-real-content /></nz-skeleton>`

## Result

Full-page status (404, 403, 500, success).

- Import: `import { NzResultComponent } from 'ng-zorro-antd/result';`
- Markup:
  ```html
  <nz-result nzStatus="404" nzTitle="404" nzSubTitle="This page does not exist.">
    <div nz-result-extra>
      <button nz-button nzType="primary" routerLink="/">Back home</button>
    </div>
  </nz-result>
  ```

## Picking between overlay types

| Need | Use |
|---|---|
| Tiny hover hint | Tooltip |
| Inline confirmation on a single button | Popconfirm |
| Rich hover content with title + body | Popover |
| Brief auto-dismissing feedback ("Saved") | Message |
| Detailed toast with title + body | Notification |
| Heavy form requiring focus trap | Modal |
| Slide-in form / side panel | Drawer |
| Persistent inline banner | Alert |
| Loading state on a section | Spin |
| Loading placeholder shape | Skeleton |
| Whole-page error / success | Result |

## Common pitfalls

1. **Service throws "no provider"** , forgot `provideNzModal()` / `provideNzMessage()` etc. in `app.config.ts`.
2. **Popconfirm closes when clicking inside the popup** , the directive triggers `nzOnCancel` on outside click only, internal buttons fire `nzOnConfirm` / `nzOnCancel` explicitly.
3. **Modal "OK" doesn't await an async handler** , return a `Promise` from `nzOnOk`, the modal stays open with a loading state until resolved.
4. **Drawer keeps state across opens** , destroyed on close by default. To preserve, use `[nzMaskClosable]="false"` and toggle visibility via `(nzOnClose)`.