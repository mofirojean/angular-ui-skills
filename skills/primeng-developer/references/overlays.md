# Overlays

PrimeNG overlays split into three categories:

- **Visible containers** opened in templates: `Dialog`, `Drawer`, `Popover`.
- **Programmatic overlays** opened via a service: `DynamicDialog`, `ConfirmDialog`, `ConfirmPopup`, `Toast`.
- **Hint overlay** as a directive: `Tooltip`.

Several were renamed in v18. v17 names (`Sidebar`, `OverlayPanel`) still resolve in legacy code but new code must use the new names. See [migration.md](./migration.md).

## Service registrations

Programmatic overlays need their service in the providers:

```typescript
// app.config.ts
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

providers: [
  // ...
  MessageService,
  ConfirmationService,
  DialogService,
],
```

`DialogService` is also providable per-component if you want a localized scope. The other two are typically app-wide.

## Dialog

Template-anchored modal.

```typescript
import { Dialog } from 'primeng/dialog';
```

```html
<p-dialog
  header="Edit user"
  [(visible)]="editing"
  [modal]="true"
  [style]="{ width: '32rem' }"
  [draggable]="false"
  [resizable]="false"
>
  <ng-template pTemplate="content">
    <!-- form here -->
  </ng-template>
  <ng-template pTemplate="footer">
    <p-button label="Cancel" variant="text" (onClick)="editing = false" />
    <p-button label="Save" (onClick)="save()" />
  </ng-template>
</p-dialog>
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `[(visible)]` | boolean | Two-way visibility binding. |
| `header` | string | Title shown in the dialog header. |
| `[modal]` | boolean | Default `true`. Modal blocks underlying interaction; non-modal does not. |
| `position` | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| ...` | Edge positioning. |
| `[draggable]` / `[resizable]` | boolean | User can move / resize. |
| `[maximizable]` | boolean | Adds a maximize button. |
| `[closable]` | boolean | Show the X button (default `true`). |
| `[breakpoints]` | object | Map of `{ '960px': '75vw', '640px': '90vw' }` for responsive width. |

### Events

- `(onShow)` / `(onHide)` , lifecycle.
- `(onMaximize)` , maximize button.

## DynamicDialog

Open dialogs imperatively, pass data in, receive results out.

```typescript
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserFormComponent } from './user-form/user-form';

@Component({ /* ... */ })
export class UsersPage {
  private dialog = inject(DialogService);
  private ref?: DynamicDialogRef;

  editUser(userId: string) {
    this.ref = this.dialog.open(UserFormComponent, {
      header: 'Edit user',
      width: '32rem',
      modal: true,
      data: { userId },
    });
    this.ref.onClose.subscribe((result) => {
      if (result?.saved) this.refresh();
    });
  }
}
```

In the opened component, inject the config and ref to read inputs and close the dialog with a result:

```typescript
@Component({ /* standalone, no template wrapper needed */ })
export class UserFormComponent {
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);

  userId = this.config.data?.userId;

  save() {
    // ...
    this.ref.close({ saved: true });
  }
}
```

### Config keys

`header`, `width`, `height`, `modal`, `closable`, `closeOnEscape`, `dismissableMask`, `position`, `style`, `styleClass`, `data` (your arbitrary payload), `templates` (component template overrides).

### When to use DynamicDialog vs Dialog

- **Dialog** , the dialog content lives in the parent template, parent owns state.
- **DynamicDialog** , dialog content is a separate component, opens with arbitrary data, closes with a result. Better for reusable forms and command-style flows.

## Drawer

Side-mounted overlay (was `Sidebar` in v17).

```typescript
import { Drawer } from 'primeng/drawer';
```

```html
<p-drawer
  header="Filters"
  [(visible)]="filterOpen"
  position="right"
  [style]="{ width: '24rem' }"
>
  <!-- content -->
</p-drawer>
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `[(visible)]` | boolean | Two-way binding. |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom' \| 'full'` | `full` covers the viewport. |
| `header` | string | Header title. |
| `[modal]` | boolean | Default `true`. |
| `[showCloseIcon]` | boolean | Default `true`. |
| `[dismissible]` | boolean | Click-backdrop to close. |

### Events

`(onShow)`, `(onHide)`.

### When to use Drawer vs Dialog

- **Drawer** , persistent, anchored to an edge, for tools that complement (not interrupt) the main flow. Filters, navigation, settings.
- **Dialog** , centered, blocks the flow, for actions that require focus. Create / edit / confirm.

## Popover

Click-anchored floating panel (was `OverlayPanel` in v17).

```typescript
import { Popover } from 'primeng/popover';
```

```html
<p-button label="Quick edit" (onClick)="popover.toggle($event)" />

<p-popover #popover>
  <ng-template pTemplate="content">
    <!-- panel content -->
  </ng-template>
</p-popover>
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `appendTo` | `'body' \| ElementRef` | Where the popover attaches in the DOM. `'body'` avoids overflow-clip issues. |
| `[showCloseIcon]` | boolean | Show X in the corner. |
| `[dismissable]` | boolean | Click outside to close (default `true`). |
| `style`, `styleClass` | various | Inline / class on the panel. |

### Methods

- `toggle(event)` , open/close, anchored to the event's `currentTarget`.
- `show(event)` , force open.
- `hide()` , force close.

### Popover vs Tooltip vs Dialog

| Need | Use |
|---|---|
| Tiny hint on hover | Tooltip |
| Interactive panel triggered by click | Popover |
| Larger form / modal flow | Dialog |

## Tooltip

Directive on the host element.

```typescript
import { Tooltip } from 'primeng/tooltip';
```

```html
<p-button
  icon="pi pi-refresh"
  pTooltip="Refresh data"
  tooltipPosition="top"
  showDelay="200"
  hideDelay="100"
  aria-label="Refresh data"
/>
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `pTooltip` | string | The tooltip text. |
| `tooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | Default `'right'`. |
| `showDelay` / `hideDelay` | number (ms) | Stagger to avoid flicker. |
| `tooltipEvent` | `'hover' \| 'focus' \| 'both'` | Default `'hover'`. v21.1.0+ also fires on touch events. |
| `tooltipStyleClass` | string | Class on the tooltip element. |
| `[escape]` | boolean | If `false`, content may contain HTML. Treat as `false` only when you fully control the input string. |
| `[showOnEllipsis]` | boolean | **v21.1.0+.** When `true`, the tooltip only appears if the target's text is actually truncated. Useful for table cells. |

### Accessibility

Tooltips augment, they don't replace, accessible names. An icon-only button still needs an `aria-label`, the `pTooltip` text is supplementary for sighted users.

## ConfirmDialog

Centered, modal confirmation. Driven by `ConfirmationService`.

```html
<!-- once, near the app root -->
<p-confirmDialog />

<p-button label="Delete" severity="danger" (onClick)="confirmDelete(user)" />
```

```typescript
import { ConfirmationService } from 'primeng/api';

private confirmer = inject(ConfirmationService);

confirmDelete(user: User) {
  this.confirmer.confirm({
    header: 'Delete user',
    message: `Delete ${user.name}? This can't be undone.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    acceptButtonProps: { severity: 'danger' },
    rejectLabel: 'Cancel',
    rejectButtonProps: { variant: 'text' },
    accept: () => this.deleteUser(user.id),
    reject: () => { /* no-op */ },
  });
}
```

### Confirm options

`header`, `message`, `icon`, `acceptLabel`, `rejectLabel`, `acceptButtonProps` / `rejectButtonProps` (pass-through to the buttons), `accept`, `reject`, `severity` (drives default styling).

### Multiple confirm dialogs

Use the `key` option on both `<p-confirmDialog key="foo">` and `confirmer.confirm({ key: 'foo', ... })` when you need more than one ConfirmDialog instance in scope.

## ConfirmPopup

Anchored variant of ConfirmDialog. Same API; adds a `target` pointing to the trigger element.

```typescript
confirmInline(event: Event, user: User) {
  this.confirmer.confirm({
    target: event.target as EventTarget,
    message: 'Remove this row?',
    icon: 'pi pi-info-circle',
    accept: () => this.remove(user.id),
  });
}
```

```html
<p-confirmPopup />
<p-button icon="pi pi-trash" (onClick)="confirmInline($event, user)" />
```

Use ConfirmPopup for low-stakes inline confirms (remove a row, dismiss a tag). Use ConfirmDialog for high-stakes destructive actions (delete an account).

## Toast

Transient notifications via `MessageService`.

```html
<!-- once, near the app root -->
<p-toast position="top-right" />
```

```typescript
import { MessageService } from 'primeng/api';

private messager = inject(MessageService);

notify() {
  this.messager.add({
    severity: 'success',
    summary: 'Saved',
    detail: 'Changes applied to 3 users.',
    life: 3000,
  });
}
```

### `MessageService.add` options

| Option | Notes |
|---|---|
| `severity` | `'success' \| 'info' \| 'warn' \| 'error' \| 'secondary' \| 'contrast'` |
| `summary` | Title line. |
| `detail` | Body line. |
| `life` | Auto-dismiss ms. Default 3000. Set 0 (or use `sticky: true`) for sticky. |
| `sticky` | Boolean shorthand for "no auto-dismiss". |
| `key` | Route to a specific `<p-toast key="...">` instance. |
| `closable` | Show the X. Default `true`. |

### Multiple toast placements

Mount multiple `<p-toast>` with different `key` values to display toasts in different corners (e.g. errors top-center, success bottom-right).

## Common patterns

- **Modal stacking** , Dialog → ConfirmDialog works out of the box. PrimeNG manages z-index. Verify with the `zIndex` provider option (see [setup.md](./setup.md)) if your app has competing layers.
- **Close all overlays on route change** , subscribe to `Router.events` and call each service's dismiss API.
- **Forms inside Dialog** , wire the dialog's footer Save button to the form's `submit` to keep validation behavior consistent.

## Common pitfalls

1. **Forgetting to register services** , `inject(MessageService)` throws if `MessageService` isn't in `providers`.
2. **Tooltip on disabled buttons** , disabled `<button>` elements don't fire hover events. Wrap the button in a `<span pTooltip="...">` to make the tooltip discoverable.
3. **Popover overflow** , when the trigger is inside an `overflow: hidden` container, the popover gets clipped. Set `appendTo="body"`.
4. **Toast `life: 0`** , doesn't make the toast sticky in older versions; use `sticky: true` to be safe.
5. **DynamicDialog with no `data`** , components that depend on `DynamicDialogConfig.data` should provide a default to avoid crashing when opened from a different code path.
6. **Two `<p-toast>` without `key`** , every toast appears in both. Always pair `add({ key })` with `<p-toast key="...">` when you mount more than one.