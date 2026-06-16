# Buttons & Indicators

The visual primitives that get reused everywhere: buttons, badges, chips, icons, and progress.

## MatButton

Material 3 has five button variants. All are the same import, different selector.

- Import: `import { MatButton, MatIconButton, MatFabButton, MatMiniFabButton } from '@angular/material/button';`
- Variants:
  ```html
  <button mat-flat-button>Filled</button>     <!-- primary CTA -->
  <button mat-stroked-button>Outlined</button>
  <button mat-button>Text</button>
  <button mat-icon-button><mat-icon>close</mat-icon></button>
  <button mat-fab><mat-icon>add</mat-icon></button>
  <button mat-mini-fab><mat-icon>edit</mat-icon></button>
  ```
- Color: `color="primary" | "accent" | "warn"`. With M3 these map to system tokens.

## MatButtonToggle

A segmented control made of several toggle buttons.

- Import: `import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';`
- Markup:
  ```html
  <mat-button-toggle-group [(value)]="view">
    <mat-button-toggle value="grid">Grid</mat-button-toggle>
    <mat-button-toggle value="list">List</mat-button-toggle>
    <mat-button-toggle value="map">Map</mat-button-toggle>
  </mat-button-toggle-group>
  ```
- Multi-select: add `multiple` and bind `value` to an array.

## MatIcon

Material's icon component, defaults to the Material Symbols / Material Icons font.

- Import: `import { MatIcon } from '@angular/material/icon';`
- Markup: `<mat-icon>home</mat-icon>`
- Font loading: add to `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />
  ```
  And in `app.config.ts`, register the icon font name with `iconRegistry.setDefaultFontSetClass('material-symbols-outlined')` (default is the older `material-icons`).
- SVG icons: register your own with `MatIconRegistry.addSvgIcon('logo', sanitizer.bypassSecurityTrustResourceUrl('assets/logo.svg'))`.

## MatBadge

Floats a small counter or label on top of another element.

- Import: `import { MatBadge } from '@angular/material/badge';`
- Markup: `<button mat-icon-button matBadge="5" matBadgeColor="warn"><mat-icon>notifications</mat-icon></button>`
- Inputs: `matBadge` (the value), `matBadgeColor` (`primary | accent | warn`), `matBadgePosition` (`above before` etc.), `matBadgeHidden`, `matBadgeOverlap`.

## MatChip / MatChipSet / MatChipGrid

Pills for tags, selectable filters, or freely typed entries.

- Import: `import { MatChipsModule } from '@angular/material/chips';`
- Three flavors:
  - **`<mat-chip-set>`** , static row of chips.
  - **`<mat-chip-listbox>`** , clickable / selectable single or multi.
  - **`<mat-chip-grid>`** , editable, paired with an input for "type a tag, press Enter" UX.
- Markup:
  ```html
  <mat-chip-listbox aria-label="Filter" multiple>
    <mat-chip-option value="auth">Auth</mat-chip-option>
    <mat-chip-option value="billing">Billing</mat-chip-option>
  </mat-chip-listbox>
  ```

## MatProgressBar

Linear progress.

- Import: `import { MatProgressBar } from '@angular/material/progress-bar';`
- Markup: `<mat-progress-bar mode="determinate" [value]="progress()" />`
- Modes: `determinate | indeterminate | buffer | query`.

## MatProgressSpinner

Circular progress.

- Import: `import { MatProgressSpinner, MatSpinner } from '@angular/material/progress-spinner';`
- Markup:
  ```html
  <mat-progress-spinner mode="indeterminate" diameter="40" />
  <mat-progress-spinner mode="determinate" [value]="loadedPct()" diameter="56" strokeWidth="6" />
  ```
- `<mat-spinner>` is a shortcut for `<mat-progress-spinner mode="indeterminate">`.

## MatRipple

The "tap and ink ripples out" effect. Most Material components include it automatically; use the directive when adding ripples to custom elements.

- Import: `import { MatRipple } from '@angular/material/core';`
- Markup: `<div matRipple class="custom-button">Click me</div>`
- Inputs: `matRippleColor`, `matRippleCentered`, `matRippleDisabled`.

## Common pitfalls

1. **`<button mat-flat-button color="warn">` doesn't look red** , with M3, `color="warn"` maps to the system error token, which is more muted than M2's bright red. Use `mat.button-overrides()` if you want a stronger red.
2. **`mat-icon` shows the literal word** , font isn't loaded. Add the Material Symbols stylesheet to `index.html`.
3. **`matBadge` not positioned** , the parent needs `position: relative` or the badge floats relative to the document. Most buttons handle this; on a `<div>` you need to add it manually.
4. **Chip with no `aria-label`** , `mat-chip-listbox` without `aria-label` fails accessibility audits. Always provide a labelling attribute.
5. **Spinner stuck spinning forever** , in `mode="determinate"` you must bind `value` from `0` to `100`. Forgetting `mode` leaves it indeterminate.
