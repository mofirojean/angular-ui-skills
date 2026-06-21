# Overlays (Popups & Modals)

Material's overlay components are all imperative, opened from TypeScript via injected services. Each uses `@angular/cdk/overlay` under the hood.

Services to know:

- **`MatDialog`** , centered modal with focus trap.
- **`MatBottomSheet`** , slides up from the bottom (mobile-first).
- **`MatSnackBar`** , briefly-shown toast at the bottom.
- **`MatTooltip`** , declarative directive on a trigger element.

## MatDialog

- Import: `import { MatDialog } from '@angular/material/dialog';`
- Open programmatically:
  ```ts
  constructor(private dialog = inject(MatDialog)) {}

  openConfirm() {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: { title: 'Delete order?', body: 'This action cannot be undone.' },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.delete();
    });
  }
  ```
- Inside the dialog component, use the structural directives:
  ```html
  <h2 mat-dialog-title>{{ data.title }}</h2>
  <mat-dialog-content>{{ data.body }}</mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
  </mat-dialog-actions>
  ```
- Receive data via `inject(MAT_DIALOG_DATA)`. Close via `inject(MatDialogRef).close(result)`.

## MatBottomSheet

- Import: `import { MatBottomSheet } from '@angular/material/bottom-sheet';`
- Same pattern as `MatDialog` but slides in from the bottom edge:
  ```ts
  this.bottomSheet.open(ShareSheet, { data: { url } });
  ```
- Best for mobile contexts. On desktop, use `MatDialog` instead.

## MatSnackBar

- Import: `import { MatSnackBar } from '@angular/material/snack-bar';`
- Open as a quick toast:
  ```ts
  this.snackBar.open('Saved.', 'Undo', {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  });
  ```
- For an action callback, listen to `.onAction()`:
  ```ts
  const ref = this.snackBar.open('Deleted ticket', 'Undo', { duration: 5000 });
  ref.onAction().subscribe(() => this.restore());
  ```
- Custom component snackbars: `this.snackBar.openFromComponent(RichSnack, { data: {...} })`.

## MatTooltip

Hover/focus hint on a trigger element. Unlike the other three, this is a declarative directive.

- Import: `import { MatTooltip } from '@angular/material/tooltip';`
- Markup: `<button mat-icon-button matTooltip="Refresh data" matTooltipPosition="above"><mat-icon>refresh</mat-icon></button>`
- Inputs: `matTooltipPosition` (`above | below | left | right | before | after`), `matTooltipShowDelay`, `matTooltipHideDelay`, `matTooltipDisabled`.
- Touch behaviour: tap-and-hold shows on touch devices. Disable with `matTooltipTouchGestures="off"`.

## Picking between overlay types

| Need | Use |
|---|---|
| Hover hint | `matTooltip` |
| Short auto-dismissing feedback ("Saved") | `MatSnackBar` |
| Modal form / focus-trapped detail | `MatDialog` |
| Mobile action sheet / list of choices | `MatBottomSheet` |
| Persistent inline status | not Material's domain, use `mat-card` with `color="warn"` styling |

## Common pitfalls

1. **Forgetting `provideAnimationsAsync()`** , dialogs and snackbars open with no transition. Add the provider.
2. **`mat-dialog-content` without explicit height** , long dialogs grow past the viewport. Set `max-height: 70vh` on it.
3. **Multiple snackbars stacked** , `MatSnackBar` dismisses the previous before opening a new one. If you want multiple, queue them or use a different toast lib.
4. **Tooltip on disabled `<button>`** , disabled buttons don't fire pointer events, the tooltip never shows. Wrap the button in a `<span matTooltip="...">` instead.
5. **Dialog content inaccessible to screen readers** , Material wires `role="dialog"` and the focus trap, but the dialog component still needs a `mat-dialog-title` for the accessible name. Don't skip it.
6. **`MatSelect` panel lands at viewport (0, 0) inside a TemplateRef dialog.** When you open a dialog from `MatDialog.open(this.tplRef())` where the form lives in a `<ng-template>`, the embedded view projection breaks CDK Overlay's connected-position strategy intermittently, `getBoundingClientRect()` on the trigger returns origin and the panel drops at the top-left of the viewport. The MatSelect's option-centering math is the most-visible symptom, the MatDatepicker calendar appears empty (no day numbers) as a secondary effect from the same root cause.
   **Fix:** use a real component class for non-trivial dialog content, or move the form to its own route. Reserve TemplateRef dialogs for simple confirmation prompts that don't contain MatSelect or MatDatepicker. Route-based forms are the bullet-proof option, see the `examples/roster` `/time-off/new` and `/reviews/:cycleId/:employeeId` for the pattern.
