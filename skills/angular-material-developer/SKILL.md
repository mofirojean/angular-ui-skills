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

- **Tracks:** `@angular/material@22.0.2` (Angular v22 stable, released 2026-06-03), paired with `@angular/cdk@22.0.2`. The v21-aligned LTS remains available at `21.2.14` for legacy projects.
- **Works for:** Material v19 → v22 projects (M3 theming system landed in v19; older majors used M2 with the now-legacy `mat.define-light-theme` / `mat.define-dark-theme` API).
- **Angular:** v19 or newer required. v22 requires Node 22 or 26 and TypeScript 6. The skill assumes standalone components, control flow (`@if` / `@for`), and signal-based APIs.
- **Sass:** required for theming. The build pipeline must support `.scss` (Angular CLI does by default). Standalone CSS-only theming is not supported by Material's theming engine.
- **Not supported:** Material v18 and below (M2-only with `mat.define-*-theme()` API), Angular v18 or below (NgModule patterns + older animations API).

### v22 breaking changes (from v21)

The v21 → v22 jump has real API drift, not just an Angular version bump. Watch for:

- **Combobox:** legacy combobox and autocomplete promoted / removed. `SimpleCombobox` promoted to `Combobox` with all `simpleCombobox*` symbols renamed to `combobox*`.
- **List:** `MatListOption.checkboxPosition` removed, use `togglePosition` instead. `MatListOptionCheckboxPosition` renamed to `MatListOptionTogglePosition`.
- **CDK:** `injector` parameter is now required on `ConfigurableFocusTrap` and `FocusTrap` constructors. `ConfigurableFocusTrapFactory.create` boolean parameter replaced with a config object. `DropListRef.drop` event parameter is now required. `ContextMenuTracker` renamed to `MenuTracker`. Removed: `CDK_DESCRIBEDBY_HOST_ATTRIBUTE`, `CDK_DESCRIBEDBY_ID_PREFIX`, `MESSAGES_CONTAINER_ID`.
- **Multiple components:** input/model rename from `values` to `value` across Combobox, Listbox, Tree, Menu, Toolbar, Select. Constructors with rest arguments removed (affects code that extends Material or CDK components).
- **Dialog / Overlay:** `ArrowViewState` and `ArrowViewStateTransition` types removed.

Most of these have automatic `ng update` migrations. When in doubt, run `ng update @angular/material` and let the schematic do the work before hand-editing.

### v22 new features worth knowing

- **Signal Forms stable** (was experimental in v21). Angular's signal-based form API is now safe to use in production. `mat-form-field` composes with both `ReactiveFormsModule` and Signal Forms.
- **Angular Aria stable** (was preview). New accessibility primitives ship in the framework, which reduces the need to reach for CDK's a11y module for some patterns.
- **Button progress indicator** support inside `<button>` component.
- **Portal directives** support on `ComponentPortal`.
- **Separate tab animation durations** (per-tab enter/exit timing).


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
