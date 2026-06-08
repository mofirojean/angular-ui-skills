# Accessibility

NG-ZORRO components follow WAI-ARIA conventions by default, but a few patterns need explicit attention to land cleanly with screen readers and keyboard users.

## What NG-ZORRO gives you for free

- **Focus management on Modal and Drawer.** First focusable element receives focus on open; focus returns to the trigger on close. Tab/Shift-Tab are trapped inside the dialog.
- **Roles and labels on overlay services.** Modal, Drawer, Message, Notification set `role="dialog"` / `role="alert"` / `role="status"` automatically.
- **Keyboard nav on Menu and Tree.** Arrow keys, Home, End, Enter, Space, type-ahead.
- **Aria-expanded / aria-haspopup on dropdowns.** Set automatically by the trigger directive.
- **Table headers expose sort state.** `aria-sort` is wired when a column has `nzSortFn`.

## What you still need to do

### Icon-only buttons

The directive doesn't infer an accessible name. Always set `aria-label`:

```html
<button nz-button nzType="text" aria-label="Refresh data">
  <nz-icon nzType="reload" />
</button>
```

A tooltip is not a substitute, screen readers don't read tooltip text.

### Form labels and required state

```html
<nz-form-label nzRequired nzFor="email">Email address</nz-form-label>
<nz-form-control nzErrorTip="Please enter a valid email">
  <input nz-input id="email" formControlName="email" />
</nz-form-control>
```

- `nzFor` matches the input's `id`. NG-ZORRO does not auto-link via projection.
- `nzRequired` adds a visual asterisk AND `aria-required="true"` on the wrapped input.
- `nzErrorTip` content is announced via `aria-describedby` when the field becomes invalid.

### Heading hierarchy

Pages built with `nz-page-header`, `nz-card`, and `nz-typography` headings can easily produce an unclear heading order. Validate with axe / Lighthouse, the visual hierarchy and the H1 → H2 → H3 sequence should match.

### Live regions for toasts

`NzMessageService` and `NzNotificationService` wire `role="status"` (polite) for non-critical messages. For critical errors that interrupt the user, prefer Modal or set `nzNotificationConfig` globally to mark the notification as assertive (`aria-live="assertive"`).

### Drawer that should NOT trap focus

Some drawers behave as supplementary panels (notification feed, help) without trapping focus. Set `[nzMaskClosable]="true"` and pair with a clear close affordance, but be aware NG-ZORRO's drawer focus-traps by default. To opt out, write a custom CDK overlay instead, the trap is non-configurable.

## Keyboard expectations per component

| Component | Keys to verify |
|---|---|
| Menu (inline) | ↑ / ↓ move items, → opens submenu, ← closes, Enter activates |
| Dropdown | Enter / Space opens, Esc closes, Arrow keys cycle items |
| Tabs | ← / → moves between tabs, Home / End jump to ends |
| Table | Tab into row actions, sort headers respond to Enter / Space |
| DatePicker | Arrow keys move within month grid, PageUp/Down moves months, Esc closes |
| Modal / Drawer | Esc closes (unless `[nzKeyboard]="false"`), Tab stays inside |
| Tree | ↑ / ↓ moves, → expands, ← collapses, Enter selects, Space checks |
| Select | Type-ahead filters, Enter selects, Esc closes |

## RTL

NG-ZORRO supports RTL via `NzConfigService` or the `[dir="rtl"]` attribute on a root element. Most components mirror automatically, the noteworthy exceptions are icons that carry directional meaning (e.g. arrow icons inside Steps), keep those manually correct.

```ts
import { NzConfigService } from 'ng-zorro-antd/core/config';

private cfg = inject(NzConfigService);
this.cfg.set('global', { direction: 'rtl' });
```

## Reduced motion

NG-ZORRO honours `prefers-reduced-motion: reduce` for the animations system, but only when `provideAnimationsAsync()` is in place (which it always is). Custom CSS transitions you add on top of NG-ZORRO components should explicitly check the media query:

```css
@media (prefers-reduced-motion: reduce) {
  .my-fancy-fade { animation: none; }
}
```

## Validating accessibility

- **axe DevTools** , covers the WCAG-mappable static checks.
- **Lighthouse** , overlap with axe but flags landmark / heading issues.
- **Manual keyboard pass** , Tab through the page, every interactive element should be reachable and have a visible focus ring.
- **Screen reader pass** , at minimum NVDA on Windows or VoiceOver on macOS. Test Modal open/close, form errors, toast announcements.
