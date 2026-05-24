# Accessibility

PrimeNG ships with **WCAG 2.1 AA-level compliance** as a baseline across components. This file covers the conventions, the utilities, and the per-component notes you should know to keep your app at that bar.

## What PrimeNG gives you for free

- **ARIA roles and states** , every interactive component sets `role`, `aria-expanded`, `aria-disabled`, `aria-selected`, `aria-checked`, etc., wired to its internal state.
- **Keyboard support** , standard WAI-ARIA Authoring Practices keystrokes (arrows, Enter, Space, Esc, Tab) work out of the box.
- **Focus management** in overlays (Dialog, Drawer, Popover) , focus traps inside, returns to trigger on close.
- **Screen-reader-friendly markup** , real semantic HTML where possible (e.g. native `<input>` hidden behind styled wrappers), `aria-live` regions for transient announcements.
- **Color contrast** , default tokens meet AA contrast in all four shipped presets (Aura, Lara, Nora, Material), light and dark.

## `p-sr-only` utility

PrimeNG ships a screen-reader-only utility class:

```html
<button (click)="refresh()">
  <i class="pi pi-refresh"></i>
  <span class="p-sr-only">Refresh data</span>
</button>
```

The `<span>` is invisible to sighted users but read by assistive tech. Use it on icon-only controls when you can't or don't want `aria-label`.

`p-sr-only` is equivalent to Tailwind's `sr-only`. Either works; use whichever class your project already standardizes on.

## What you have to provide

Components can't infer purpose from context. You always supply:

- **Accessible names on icon-only controls** , `aria-label` (or visible `<span class="p-sr-only">`) on every Button, icon-only nav link, or interactive icon. Without it, screen readers announce nothing.
- **Labels on form controls** , bind `<label for="id">` to your input's `id`. PrimeNG's label wrappers (`FloatLabel`, `IftaLabel`) need this too.
- **Headings with sensible levels** , Accordion uses `headerAriaLevel` (default `2`). Set it to match the document outline if your dialog or section isn't level 2.
- **`alt` on images** , Image and Galleria pass through `alt` to the `<img>`; don't omit it.

## Per-component a11y notes

Things worth knowing case by case (paraphrased from each component's accessibility section in the docs).

| Component | Notes |
|---|---|
| **Button** | `role="button"`, native button when used as `<button pButton>`. **You must supply `aria-label` if there's no visible text.** |
| **Accordion** | Headers have `role="button"` + `aria-controls` + `aria-expanded`. Content uses `role="region"` linked via `aria-labelledby`. Each header has `role="heading"` with configurable `headerAriaLevel` (default 2). |
| **Dialog** | Focus is trapped while open, returns to trigger on close. Set `header` (or `aria-labelledby` pointing to a heading inside) so screen readers announce the dialog. Esc closes by default. |
| **Drawer** | Same focus trap behavior as Dialog. |
| **Popover** | Focus moves into the popover when opened via keyboard. Esc returns focus to trigger. |
| **Tooltip** | Augments, doesn't replace, labels. Icon-only buttons still need `aria-label` even when they have a tooltip. |
| **DatePicker** | Calendar keyboard nav: arrows for days, Page Up/Down for months, Shift+Page Up/Down for years. Announces the selected date. |
| **Select / MultiSelect** | Implements the combobox pattern with `aria-activedescendant`. Type-ahead works out of the box. |
| **AutoComplete** | Same combobox pattern. Use `aria-label` if there's no visible label wrapper. |
| **Checkbox / RadioButton** | Hidden native `<input>` underneath the styled control , real keyboard and screen-reader behavior. |
| **Table** | Sort buttons inside `<th>` use `aria-sort`. Selection announces via `aria-live`. Use `caption` for table description. |
| **Tree / TreeTable** | Implements the WAI-ARIA tree pattern (`role="tree"`, `role="treeitem"`, `aria-level`, `aria-expanded`). Arrow keys navigate. |
| **Menu (all 8 variants)** | `role="menu"` + `role="menuitem"`. Arrow keys navigate, Esc closes. Use `routerLink` rather than `command` for nav so right-click + keyboard work. |
| **Toast** | `role="alert"` + `aria-live="polite"`. For critical errors use `severity="error"` (which raises politeness to assertive). |
| **Badge / OverlayBadge** | Decorative by default. If a badge conveys important info (unread count), add `aria-label` to the host: `<button aria-label="3 unread">`. |
| **ProgressBar / ProgressSpinner** | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` (determinate) or `aria-valuetext="Loading"` (indeterminate). |

When in doubt, every component docs page has an **Accessibility** section listing the exact ARIA wiring and keyboard support. Read it for unusual cases.

## Color contrast

Default tokens meet AA. Things to watch:

- **`secondary` text on busy backgrounds** , the muted color barely passes in some themes. Test in your real layout.
- **Ghost buttons in light mode** , transparent backgrounds can render text below contrast if the page background is patterned.
- **Custom presets** , when you override `primary.color` with a brand color, **re-verify contrast**. Use Chrome DevTools' contrast checker or a tool like axe.

To audit:

1. Pick a colored token (e.g. `--p-primary-color`).
2. Compare against the foreground token that pairs with it (e.g. `--p-primary-contrast-color`).
3. Confirm ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (18pt+) and UI components.

## Dark mode and reduced-motion

PrimeNG follows `prefers-reduced-motion` automatically when CSS-based animations are in use (v21+). Components fall back to instant transitions when the user has requested reduced motion.

For dark mode, see [theming.md](./theming.md). Token contrast targets the same WCAG ratios in both modes.

## RTL

PrimeNG supports right-to-left layouts via standard CSS logical properties. Enable with `dir="rtl"` on `<html>` or a container, and nearly all components flip correctly. Known limitations in PrimeNG v21: **Galleria** and **Carousel** don't fully support RTL; they're slated for a modern rewrite in upcoming versions.

## Testing checklist

Before shipping:

- [ ] Tab through every page , does focus order match visual order?
- [ ] Esc closes every overlay (Dialog, Drawer, Popover, ConfirmDialog)?
- [ ] Every icon-only button has `aria-label` or visible text?
- [ ] Every form input has a `<label>` (either bound by `for=""` or wrapped via `FloatLabel`)?
- [ ] Form validation errors are announced (visible `<p-message>` works for sighted users; check screen reader announces them)?
- [ ] Headings are in document order without skipped levels (`<h1>` → `<h2>` → `<h3>`)?
- [ ] Images have `alt` (or `alt=""` for decorative)?
- [ ] Color contrast , primary, secondary, error states all pass AA?
- [ ] Tested with a real screen reader (NVDA on Windows, VoiceOver on macOS)?
- [ ] Lighthouse / axe-core / Pa11y CI: no critical or serious findings?

## When you need to extend

Components accept arbitrary ARIA props via PassThrough (see [passthrough.md](./passthrough.md)):

```html
<p-button
  icon="pi pi-trash"
  aria-label="Delete row"
  [pt]="{
    root: { 'aria-describedby': 'delete-help' }
  }"
/>
<span id="delete-help" class="p-sr-only">Permanently removes this record.</span>
```

Useful for cases where the built-in ARIA wiring isn't enough , very long descriptions, custom live regions, or composite widgets where you need to announce relationships.

## Common pitfalls

1. **Icon-only buttons without `aria-label`** , the single most common a11y failure. PrimeNG won't error; screen readers will silently skip the control.
2. **Custom colors that fail contrast** , brand magenta on white frequently doesn't pass. Verify before shipping.
3. **`escape: false` on a `MenuItem` without sanitization** , XSS risk. Set `escape: false` only when you control the string fully.
4. **Removing native form elements** , don't replace PrimeNG's hidden native inputs with `<div role="checkbox">`. The hidden input is what makes the component accessible.
5. **`aria-live` on every Toast** , default behavior is correct (`polite`). Don't force `assertive` unless the message is critical, it interrupts whatever the user is reading.
6. **Skipping `<label>` because the visual design hides it** , use `p-sr-only` to keep the label invisible but available.
