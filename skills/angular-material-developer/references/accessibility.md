# Accessibility

Material targets WCAG 2.1 AA. Most components ship with sensible a11y defaults, but a few patterns require explicit attention.

## What Material gives you for free

- **Focus trap on Dialog and BottomSheet** , Tab cycles inside, Shift+Tab cycles back, Esc dismisses. Focus returns to the trigger on close.
- **ARIA roles and labels on overlays** , `MatDialog` sets `role="dialog"` / `aria-modal="true"`, `MatSnackBar` uses `role="status"` (polite live region).
- **Keyboard navigation on lists, menus, selects** , arrow keys, Home, End, Enter, Space, type-ahead, via CDK's `ListKeyManager`.
- **`aria-expanded` and `aria-haspopup` on menu / select triggers** , set automatically.
- **Sort state announced via `LiveAnnouncer`** , sorted column changes are spoken by screen readers.
- **`aria-sort` on table headers** , wired when `mat-sort-header` is present.

## What you still need to do

### Icon-only buttons

Material doesn't infer an accessible name. Always provide `aria-label`:

```html
<button mat-icon-button aria-label="Refresh data">
  <mat-icon>refresh</mat-icon>
</button>
```

A `matTooltip` is not a substitute, screen readers don't read tooltip text.

### Form labels

Use `<mat-label>` inside the form-field. The label is auto-associated with the inner control via `for`:

```html
<mat-form-field>
  <mat-label>Email address</mat-label>
  <input matInput type="email" formControlName="email" />
</mat-form-field>
```

For checkboxes / radios where the visible text is the label, the directive handles it. For sliders with no visible label, add `aria-label`:

```html
<mat-slider><input matSliderThumb aria-label="Volume" /></mat-slider>
```

### Heading hierarchy

Pages built with `mat-toolbar`, `mat-card`, `mat-card-title`, `mat-tab-group` can produce a jumbled heading order. Validate with axe / Lighthouse, the H1 → H2 → H3 visual hierarchy should match the DOM.

### Live regions for toasts

`MatSnackBar` uses `role="status"` (polite, won't interrupt screen reader speech). For *critical* errors that should interrupt, open a `MatDialog` instead, or use `LiveAnnouncer.announce(text, 'assertive')`.

### Focus styling

Material styles focus differently for keyboard vs mouse via `FocusMonitor`. You get this for free on Material components. For custom components, apply the directive:

```ts
constructor(
  private host = inject(ElementRef),
  private focus = inject(FocusMonitor),
) {}

ngAfterViewInit() {
  this.focus.monitor(this.host.nativeElement, true);  // true = monitor children
}

ngOnDestroy() {
  this.focus.stopMonitoring(this.host.nativeElement);
}
```

The element then gets `cdk-focused`, `cdk-keyboard-focused`, `cdk-mouse-focused` classes; style only the keyboard variant.

### Responsive sidenav

`mat-sidenav` should be `mode="over"` on phones and `mode="side"` on desktop. Use `BreakpointObserver`:

```ts
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

readonly isHandset = toSignal(
  inject(BreakpointObserver).observe(Breakpoints.Handset).pipe(map((s) => s.matches)),
  { initialValue: false },
);
```

```html
<mat-sidenav [mode]="isHandset() ? 'over' : 'side'" [opened]="!isHandset()">
  ...
</mat-sidenav>
```

This also keeps the sidenav from being permanently open and inaccessible on mobile.

## Keyboard expectations per component

| Component | Keys to verify |
|---|---|
| `MatMenu` | Enter / Space opens, ↑↓ moves items, Esc closes |
| `MatSelect` | Enter / Space opens, type-ahead filters, Esc closes |
| `MatDatepicker` | Arrow keys move within month, PageUp/Down moves month, Esc closes |
| `MatTabGroup` | ←/→ moves between tabs, Home/End jump to ends |
| `MatDialog` | Esc closes (unless `disableClose: true`), Tab stays inside |
| `MatStepper` | Tab inside step content, header arrow keys move between steps |
| `MatTable` | Tab into row actions, sort headers respond to Enter / Space |

## RTL

Material supports RTL via `dir="rtl"` on a root element (typically `<html>` or `<body>`). All component icons and animations mirror automatically. Manually-positioned UI (custom CDK overlay positions) needs explicit `direction` handling.

## Reduced motion

Material honours `prefers-reduced-motion: reduce` automatically for ripples, dialog backdrop, menu open/close. Custom CSS animations you add on top should also check the query:

```css
@media (prefers-reduced-motion: reduce) {
  .my-fancy-fade { animation: none; }
}
```

## Validating accessibility

- **axe DevTools** , covers WCAG-mappable static checks.
- **Lighthouse a11y audit** , overlaps with axe + landmark/heading checks.
- **Manual keyboard pass** , Tab through every page, every interactive element should be reachable and show a visible focus ring.
- **Screen reader pass** , at minimum NVDA on Windows or VoiceOver on macOS. Test dialog open/close, form errors, snackbar announcements.
