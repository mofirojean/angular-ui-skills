# Roster

A reference Angular app built with [Angular Material](https://material.angular.dev) to validate the [`angular-material-developer` skill](../../skills/angular-material-developer). The app is a fictional HR / people-management console for a 200-person company, picked because Material's two strongest moats over Spartan, PrimeNG, and NG-ZORRO (the polished `mat-form-field` and the `MatDatepicker`) get exercised hardest in HR-shaped workflows.

> **Status**, complete. All 7 phases shipped per [`PLAN.md`](./PLAN.md).

## Stack

- Angular v21, standalone, zoneless change detection (`provideZonelessChangeDetection`)
- `@angular/material@21.2.x` with Material 3 theming via `mat.theme()` Sass mixin
- Material's prebuilt `mat.$azure-palette` (primary) + `mat.$blue-palette` (tertiary), with tonal-tint mixing via `color-mix()` to soften saturated `*-container` tokens in dark mode
- `@angular/cdk` for Drag-Drop (onboarding kanban), VirtualScroll (compact directory), BreakpointObserver (responsive sidenav)
- Material Symbols Outlined for icons
- Reactive Forms throughout (Signal Forms moves in when Angular v22 ships stable)
- [`ngx-transforms`](https://www.npmjs.com/package/ngx-transforms) pipes for `| initials`, `| timeAgo`, `| bytes`
- Mock data only, no backend

## What's inside

| Page | Surfaces |
|---|---|
| `/` Dashboard | 4 KPI Cards with delta chips, on-leave List, recently-joined horizontal scroll, upcoming birthdays list, open onboarding mini-Table, extended Fab |
| `/people` | Flagship MatTable with sort, sticky header + frozen name column, mat-paginator, mat-button-toggle-group status filter, MatAutocomplete name search, mat-date-range-picker hire-date filter, bulk select via `SelectionModel`, trailing 3-dot MatMenu, MatSlideToggle compact-mode toggle that swaps for `cdk-virtual-scroll-viewport` |
| `/people/:id` | Profile shell with breadcrumb header + MatChip status + sensitive-role flag, MatTabGroup with 5 tabs, Overview tab uses `MatTree` for the reporting line + read/edit toggle on the About form, Compensation tab has a `MatTable` of salary history + MatDialog for adjustments, Reviews tab uses `MatAccordion`, Documents tab has a simulated MatProgressBar upload, Activity tab is a custom timeline |
| `/onboarding` | CDK Drag-Drop Kanban with 4 stage columns (Offer / Setup / Day 1 / 30 days), tonal stage icons, custom drag preview |
| `/onboarding/new` | Linear MatStepper with 4 form-backed steps (Candidate / Team / Equipment / Review), MatAutocomplete on role + manager, MatChipGrid for the accessories kit, MatDatepicker for start date, confirmation checkbox on the final step |
| `/onboarding/:id` | Per-hire checklist grouped by stage with mat-checkbox rows, MatProgressBar across the top, MatBottomSheet for capturing per-task notes |
| `/time-off` | Three-tab view (Calendar / Requests / Balances). Calendar is CSS-grid with tonal chips per day + MatBottomSheet on click. Requests tab has a MatTable with status filter + Approve/Reject menu actions + Undo MatSnackBar. Balances tab is a card grid with `MatProgressBar` per leave type. Extended Fab routes to `/time-off/new` for a centered new-request form |
| `/reviews` | MatAccordion of cycles (active + 3 historical) with a per-cycle status MatTable. Each row links to `/reviews/:cycleId/:employeeId`, a 4-step MatStepper wizard (Self → Manager → Calibration → Final) |
| `/settings` | Page-level secondary MatSidenav with 6 sections (General with MatSlider density control / Branding with palette swatches / Teams / Roles & permissions with mat-slide-toggle list + MatChipGrid / Holidays / Notifications) |

## Theming

Material 3 via the `mat.theme()` mixin with Material's prebuilt `mat.$azure-palette` (primary) and `mat.$blue-palette` (tertiary). To swap in a custom brand palette, run:

```bash
ng g @angular/material:theme-color \
  --primary-color="#yourBrandHex" \
  --directory="src/styles"
```

Then point `styles.scss` at the generated `$primary-palette` Sass map. All component-level styling reads from `--mat-sys-*` tokens, so a palette swap retones the entire app.

Dark mode toggles a `theme-dark` / `theme-light` class on `<html>` via `ThemeService`. M3 tokens auto-adapt to the active `color-scheme`.

Tonal tints are used heavily throughout the app, e.g. `color-mix(in srgb, var(--mat-sys-primary) 16%, var(--mat-sys-surface-container-high))` rather than the raw `*-container` tokens, which read too saturated in dark mode.

## Material gotchas worth surfacing

- **`@angular/material` `ng add` does not install `@angular/animations`.** `provideAnimationsAsync()` dynamically imports `@angular/animations/browser` and fails the build if the peer dep isn't present. Run `npm i @angular/animations@^21.2.0` after the schematic.
- **`MatSelect` + `MatDatepicker` inside a `<ng-template>` MatDialog can position overlays at viewport (0, 0).** When CDK Overlay's connected-position strategy reads `getBoundingClientRect()` on a trigger element projected through an embedded view, the rect intermittently returns origin. Use a real component class for non-trivial dialog content (or switch to a route, which is what this app does for `/time-off/new` and `/reviews/.../wizard`).
- **Two-line `mat-list-item` with `matListItemTitle` + `matListItemLine` applies internal padding that resists `align-self: center` overrides.** For tight vertical alignment, drop down to a plain `<button>` with your own flex layout (the settings sub-sidebar does this).
- **MatTree `childrenAccessor` is typed `(node: T) => T[] | Observable<T[]>`, no `readonly`.** If your domain model uses `readonly T[]`, spread into a mutable array in the accessor.
- **Material's `<button>` host inherits the user-agent border** in some browsers. If you're using buttons for grid cells (e.g. a calendar), explicitly `border: none` to prevent the native border from showing through your "borderless" design.

These five are folded back into the skill's [setup.md](../../skills/angular-material-developer/references/setup.md), [overlays.md](../../skills/angular-material-developer/references/overlays.md), [layout.md](../../skills/angular-material-developer/references/layout.md), and [data-table.md](../../skills/angular-material-developer/references/data-table.md) reference files.

## Run it

```bash
cd examples/roster
npm install
npm start
```

Then open `http://localhost:4200/`.

## Build

```bash
npm run build
```

Outputs to `dist/roster/browser/`. Configured for the Vercel `angular` framework preset, see `vercel.json`.

## Component coverage

Every component documented in the [skill's SKILL.md](../../skills/angular-material-developer/SKILL.md) router is used somewhere in this app at least once. The mapping is enumerated in [`PLAN.md`](./PLAN.md#component-coverage-used-vs-documented).