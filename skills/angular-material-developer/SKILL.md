---
name: angular-material-developer
description: Generates Angular Material code and guidance for Angular projects using `@angular/material` with the Material 3 (M3) theming system. Covers installation, Sass-based theming via `mat.theme()` and the prebuilt palettes, density and typography customisation, component usage across all categories (form controls, buttons, overlays, layout, data display, navigation), `@angular/cdk` primitives (Overlay, Portal, Drag-Drop, Virtual Scroll, A11y), ReactiveForms / Signal Forms integration via `mat-form-field`, accessibility, and the M2 → M3 migration. Use when the user mentions Angular Material, `@angular/material`, `mat-*` components, M3 / Material 3, design tokens, OR when the Angular project's `package.json` contains `@angular/material`. Pairs with `angular-developer` for Angular fundamentals.
license: MIT
metadata:
  author: Mofiro Jean
  version: '0.0.1'
---

# Angular Material Developer Guidelines

> **Pairs with `angular-developer`** , that skill provides Angular fundamentals (signals, DI, routing, forms, SSR, accessibility). This skill focuses on Angular Material specifics. Install both for the best experience.

## Compatibility

- **Tracks:** `@angular/material@21.2.14` (the v21-aligned LTS), paired with `@angular/cdk@21.2.14`.
- **Works for:** Material v19 → v21 projects (the M3 theming system landed in v19; older majors used M2 with the now-legacy `mat.define-light-theme` / `mat.define-dark-theme` API).
- **Angular:** v19 or newer required. The skill assumes standalone components, control flow (`@if` / `@for`), and signal-based APIs.
- **Sass:** required for theming. The build pipeline must support `.scss` (Angular CLI does by default). Standalone CSS-only theming is not supported by Material's theming engine.
- **Not supported:** Material v18 and below (M2-only with `mat.define-*-theme()` API), Angular v18 or below (NgModule patterns + older animations API).

If the project is on Material v22+ paired with Angular v22+, this skill still applies, the component API is stable across v21 → v22, only theming-internal Sass changes between majors.

The Material v21 → v22 jump is **not** a redesign, it's an Angular version bump. The component selectors, inputs, and outputs are the same.


1. **Check the project's Material version before answering.** Material's M3 theming engine was introduced in v19 (`mat.theme()` mixin replacing `mat.define-light-theme` and `mat.define-dark-theme`). Code generated against M3 will silently break on M2 projects. `package.json` is the source of truth.

2. **Detect the theming generation in `styles.scss`:**
   - If you see `@include mat.theme((...))` → **M3** (v19+, default). Use `mat.theme()`, Material's prebuilt palettes, and CSS variable overrides.
   - If you see `mat.define-light-theme(...)` or `mat.define-dark-theme(...)` plus `@include mat.all-component-themes($theme)` → **M2** (legacy). Recommend migrating, see [migration.md](references/migration.md).
   - The two systems compile and behave very differently. See [theming.md](references/theming.md).

3. **Components are standalone since v15.** Always import the standalone class (e.g. `MatButton` from `'@angular/material/button'`), not the legacy `MatButtonModule`. The modules still re-export everything for backwards compatibility but should not be added to new code.

4. **After generating Material code, run `ng build`.** The most common AI mistakes are: (a) using v17-era `mat.define-light-theme` syntax in a v19+ project (compiles but silently emits no CSS vars); (b) forgetting `provideAnimationsAsync()`, which makes ripples, menu open/close, and dialog backdrop animations no-op; (c) missing `@angular/cdk` peer dep, Material imports cascade through it; (d) using `MatTable` without a `MatSort` / `MatPaginator` wiring up, the column header sort UI appears but does nothing.

## Material architecture: components, CDK, theming

Angular Material ships three layers:

- **Components** (`@angular/material/*`) , the styled `mat-*` components themselves: `MatButton`, `MatFormField`, `MatTable`, `MatDialog`, etc. Each lives at its own import path.
- **CDK** (`@angular/cdk/*`) , unstyled primitives Material composes on top of: `Overlay`, `Portal`, `A11y` (FocusTrap, LiveAnnouncer, ListKeyManager), `DragDrop`, `VirtualScroll`, `Stepper`. **Always installed as a peer dep alongside Material.** Useful on its own when you need a primitive but don't want Material's styling. See [cdk.md](references/cdk.md).
- **Theming engine** (`@angular/material/_index.scss`) , the Sass mixins (`mat.theme()`, `mat.theme-overrides()`) that emit CSS variables consumed by every component. Sass is required, no CSS-only theming path.

**Default to importing from `@angular/material/<component>`** (e.g. `MatButton from '@angular/material/button'`). Reach for `@angular/cdk/<primitive>` only when you need the headless primitive or are building a custom-styled component composing Material's behaviour.

## Installation and theming

- **Setup**: `ng add @angular/material` (handles the install + writes a default theme + wires `provideAnimationsAsync()`), or manual install. Read [setup.md](references/setup.md)
- **Theming (M3)**: `mat.theme()` mixin, prebuilt palettes (`mat.$violet-palette`, `mat.$azure-palette`, etc.), density and typography knobs, `light dark` color-scheme, per-component overrides via `mat.<component>-overrides()`. Read [theming.md](references/theming.md)
- **M2 → M3 migration**: the v19 ng-update schematic + manual fix patterns. Read [migration.md](references/migration.md)

## Components

Angular Material documents 40+ components grouped by category. Each category file below covers the components, their key inputs, common patterns, and gotchas.

- **Form Controls**: Autocomplete, Checkbox, Datepicker, FormField, Input, Radio, Select, Slider, SlideToggle. Read [form-controls.md](references/form-controls.md)
- **Buttons & Indicators**: Button, ButtonToggle, Badge, Chip, Icon, ProgressBar, ProgressSpinner, Ripple. Read [buttons-indicators.md](references/buttons-indicators.md)
- **Layout**: Card, Divider, ExpansionPanel, GridList, List, Stepper, Tabs, Tree. Read [layout.md](references/layout.md)
- **Navigation**: Menu, Sidenav, Toolbar. Read [navigation.md](references/navigation.md)
- **Popups & Modals**: BottomSheet, Dialog, Snackbar, Tooltip. Read [overlays.md](references/overlays.md)
- **Data Table**: Table, Paginator, Sort, MatTableDataSource. Read [data-table.md](references/data-table.md)

## CDK primitives

- **CDK**: Overlay, Portal, A11y (FocusTrap, FocusMonitor, LiveAnnouncer, ListKeyManager), Drag-Drop, VirtualScroll, Stepper, ScrollDispatcher, Layout (`Breakpoints`). Read [cdk.md](references/cdk.md)

## Forms integration

- **Forms**: Wiring Material components to ReactiveForms (the canonical path) and Signal Forms (Angular v22+) via `mat-form-field`, `MatInput` / `MatSelect` / `MatDatepicker`, `ErrorStateMatcher` patterns, `<mat-error>` display, and `ControlValueAccessor` for custom controls. Read [forms.md](references/forms.md)

## Accessibility

- **Accessibility**: Material's WCAG 2.1 AA targets, FocusMonitor for keyboard-vs-mouse focus styling, LiveAnnouncer for transient announcements, RTL support, the things Material gives you free and the things you still need to do. Read [accessibility.md](references/accessibility.md)
