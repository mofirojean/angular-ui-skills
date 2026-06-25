# Bridging to the library skills

This skill teaches *what good UI looks like*. The library-specific skills teach *which component implements it*. This file maps the principles in the rest of this skill onto the four Angular UI libraries we cover.

When in doubt, consult the library's own `theming.md`, `form-controls.md`, etc., reachable from each library skill's SKILL.md router.

## Detecting the library

Read `package.json`:

| Dependency present | Skill to load |
|---|---|
| `@spartan-ng/brain` or `@spartan-ng/helm` | `spartan-ng-developer` |
| `primeng` or `@primeuix/themes` | `primeng-developer` |
| `ng-zorro-antd` | `ng-zorro-developer` |
| `@angular/material` | `angular-material-developer` |

If multiple, ask the user which to lean on. Mixing two component libraries in one project is unusual and almost always a sign of incomplete migration.

## Density

| Library | How to go compact |
|---|---|
| Spartan/ng | Always pass `size="sm"` (or `size="icon"` for icon-only buttons). Helm doesn't have a global density mode; you tune per-component. |
| PrimeNG | Add `class="p-small"` or override `--p-form-field-padding-y` / `--p-button-padding-y` in the theme. |
| NG-ZORRO | Set `[nzSize]="'small'"` on form controls, tables, buttons. NG-ZORRO has a real density signal. |
| Angular Material | Wrap a region in `[style.--mat-form-field-density:'-3']` or use `matFormFieldAppearance="outline"` with the density mixin in your theme. M3 density tokens: `density-3` (compact) to `density-0` (default). |

The dense dashboard default for each:
- Spartan: `size="sm"` on all controls, `size="icon"` for icon buttons, custom `text-xs py-1.5` on table rows
- PrimeNG: `class="p-small"`, custom `:root { --p-table-row-padding: 0.5rem 0.75rem; }`
- ZORRO: `[nzSize]="'small'"` everywhere, `nzTable[nzSize]="'small'"` for the table
- Material: density `-3` for inputs in dashboards, `-2` for tables

## Theming and tokens

All four libraries support CSS-variable theming. The semantic token names differ.

| Concept | Spartan/ng | PrimeNG (Aura) | NG-ZORRO | Material 3 |
|---|---|---|---|---|
| Page background | `--background` | `--p-surface-0` | `--ant-color-bg-container` | `--mat-sys-surface` |
| Card background | `--card` | `--p-content-background` | `--ant-color-bg-elevated` | `--mat-sys-surface-container` |
| Body text | `--foreground` | `--p-text-color` | `--ant-color-text` | `--mat-sys-on-surface` |
| Muted text | `--muted-foreground` | `--p-text-muted-color` | `--ant-color-text-secondary` | `--mat-sys-on-surface-variant` |
| Border | `--border` | `--p-surface-200` (light) | `--ant-color-border` | `--mat-sys-outline-variant` |
| Brand / primary | `--primary` | `--p-primary-color` | `--ant-color-primary` | `--mat-sys-primary` |
| Destructive | `--destructive` | `--p-red-500` | `--ant-color-error` | `--mat-sys-error` |

When writing custom styles, use these semantic names. Never hard-code shades like `text-zinc-500` inside component CSS, because dark mode won't follow.

## Component picks per principle

### Data-driven UI

| Principle | Spartan | PrimeNG | NG-ZORRO | Material |
|---|---|---|---|---|
| Status chips | `<hlm-badge>` with custom `[ngClass]` for tone | `<p-tag>` with `severity` | `nz-tag` with `nzColor` | `mat-chip-listbox` with theming |
| Avatars | `<hlm-avatar>` + `hlmAvatarFallback` | `<p-avatar>` | `nz-avatar` | `<img matChipAvatar>` or roll your own |
| Data tables | `<hlm-table>` + TanStack Table | `<p-table>` (very full-featured) | `nz-table` | `MatTable` with `cdk-virtual-scroll` for >100 rows |
| Timeline | Roll your own with `<ol>` + avatar pseudo-anchor (see Forge example) | `<p-timeline>` | `nz-timeline` | Custom (no built-in) |
| Charts | Bring your own (Chart.js, ApexCharts) | `<p-chart>` (Chart.js wrapper) | Bring your own | Bring your own |

### Progressive disclosure

| Pattern | Spartan | PrimeNG | NG-ZORRO | Material |
|---|---|---|---|---|
| Popover | `[hlmPopoverTrigger]` + `<hlm-popover-content>` | `<p-popover>` | `nz-popover` | `MatMenu` (with custom positioning) |
| Dropdown menu | `[hlmDropdownMenuTrigger]` + `hlm-dropdown-menu` | `<p-menu>` | `nz-dropdown-menu` | `<mat-menu>` |
| Sheet (off-canvas) | `<hlm-sheet>` | `<p-drawer>` (was `<p-sidebar>` pre-v18) | `nz-drawer` | `MatSidenav` (modal mode) |
| Context menu | `HlmContextMenu` | `<p-contextmenu>` | `nz-dropdown nzTrigger="contextmenu"` | Roll your own with `cdkOverlay` |
| Command palette | `HlmCommandDialog` | `<p-autocomplete>` in a dialog | `nz-autocomplete` in a modal | `MatDialog` + `MatAutocomplete` |

### Hidden UI

| Pattern | Spartan | PrimeNG | NG-ZORRO | Material |
|---|---|---|---|---|
| Tooltip | `[hlmTooltipTrigger]` | `pTooltip` | `nz-tooltip` | `matTooltip` |
| Toast | `ngx-sonner` (`HlmToaster` mounts it) | `<p-toast>` + `MessageService` | `NzMessageService` / `NzNotificationService` | `MatSnackBar` |
| Empty state | `<hlm-empty>` | Roll your own | Roll your own | Roll your own |
| Skeleton | `<hlm-skeleton>` | `<p-skeleton>` | `nz-skeleton` | Roll your own (or `mat-skeleton-loader` third-party) |
| Spinner | `<hlm-spinner>` | `<p-progressspinner>` | `nz-spin` | `<mat-progress-spinner>` |
| Alert / banner | `<hlm-alert>` | `<p-message>` | `nz-alert` | `<mat-card>` styled as banner |

## Defaults to override

Each library has defaults that don't suit dashboards. Override these early in your styles.

### Spartan/ng

- `<hlm-card>` has generous padding by default (`p-6`). For dashboard cards, override to `p-4` or `p-5`.
- Default text in tables is `text-sm`. Drop to `text-xs` for dense surfaces.
- `<hlm-button>` default size is `md`. Pass `size="sm"` for action buttons in tables and toolbars.

### PrimeNG (Aura)

- `<p-table>` default row padding is `1rem`. Override with custom CSS:
  ```css
  :root {
    --p-table-row-padding: 0.5rem 0.75rem;
    --p-table-header-cell-padding: 0.5rem 0.75rem;
  }
  ```
- Default button has a `box-shadow` that feels heavy. Strip for dashboards: `<p-button styleClass="!shadow-none">`.
- Default chip is large; use a custom CSS class to compact it.
- `definePreset` in Aura lets you alter the entire theme; see `primeng-developer/references/theming.md`.

### NG-ZORRO

- Default mode is large; pass `[nzSize]="'small'"` everywhere.
- The default font is system-ui; load a webfont for polish.
- Themes use LESS, for dashboard polish, override LESS variables in `theme.less`:
  ```less
  @table-padding-vertical: 8px;
  @table-padding-horizontal: 12px;
  @font-family: 'Inter', sans-serif;
  ```
- `nz-table[nzTableLayout="fixed"]` for predictable column widths in dense layouts.

### Angular Material

- Default `MatTable` rows are 48-56px tall. Use density `-3` to shrink to ~40px.
- M3 default surface color in light mode is faintly tinted; consider overriding `--mat-sys-surface` to pure white for cleaner dashboards.
- `<mat-form-field appearance="outline">` reads cleaner than `fill` for dashboards.
- Default `--mat-form-field-density` is `0`. Set to `-3` globally:
  ```scss
  :root {
    --mat-form-field-density: -3;
  }
  ```

## Dark mode

| Library | Toggle mechanism |
|---|---|
| Spartan/ng | Toggle `class="dark"` on `<html>` |
| PrimeNG (Aura) | Toggle `class="my-app-dark"` on `<html>`, configured via `darkModeSelector` in `definePreset` |
| NG-ZORRO | Service `NzConfigService` + load a separate `dark.less` bundle |
| Material 3 | `mat.theme()` mixin with both light/dark schemes; toggle via `color-scheme` |

For dashboards, always wire a theme toggle. Put it in the user menu, the settings page, *and* the command palette. Persist via localStorage.

## When the project already exists

If you're polishing an existing app rather than building from scratch:

1. Read the project's `package.json` to identify the library
2. Read the existing theme file (Spartan: `styles.css`; PrimeNG: `app.config.ts` `providePrimeNG`; NG-ZORRO: theme `.less` files; Material: `_theme.scss` + `mat.theme()`)
3. Identify the *one* family of colors in use (the neutral palette), never introduce a new family
4. Use only the existing semantic tokens for your additions
5. Run `ng build` after every batch of changes to catch theme drift early

## Cross-reference

- Each library's `theming.md` for token wiring details
- Each library's category files (`form-controls.md`, `overlays.md`, `layout.md`, `display.md`, `data-display.md`) for component-specific API
- [color.md](color.md), the principles behind the tokens
- [finishing.md](finishing.md), polish moves that compose with any of the four
