---
name: primeng-developer
description: Generates PrimeNG code and guidance for Angular projects using `primeng` with `@primeuix/themes` and `@primeuix/styles`. Covers installation, design-token theming (Aura / Lara / Nora / Material presets), Styled vs Unstyled modes, the PassThrough (`pt`) customization API, component usage across all categories (form controls, buttons, overlays, layout, data display, display, menus), ReactiveForms / Signal Forms integration, accessibility, and v18→v21 migration renames. Use when the user mentions PrimeNG, `primeng`, `p-*` components, Aura/Lara/Nora theme presets, OR when the Angular project's `package.json` contains `primeng` or `@primeuix/*` dependencies. Pairs with `angular-developer` for Angular fundamentals.
license: MIT
metadata:
  author: Mofiro Jean
  version: '0.0.1'
---

# PrimeNG Developer Guidelines

> **Pairs with `angular-developer`** - that skill provides Angular fundamentals (signals, DI, routing, forms, SSR, accessibility). This skill focuses on PrimeNG specifics. Install both for the best experience.

## Compatibility

- **Tracks:** PrimeNG v21 (current), with `@primeuix/themes` v2.x and `@primeuix/styles` v1.x.
- **Works for:** PrimeNG v18 → v21 projects. The skill references include [`migration.md`](references/migration.md) covering the v18 component renames (Calendar→DatePicker, Dropdown→Select, etc.), so v18-v20 projects can use this skill but expect drift on theming and a few component APIs. v21 is the closest match.
- **Angular:** v18 or newer required. PrimeNG components are standalone since v18. The skill assumes standalone components, control flow (`@if` / `@for`), and signal-based APIs.
- **Tailwind:** v3 or v4 with `tailwindcss-primeui` plugin (optional, for unstyled mode).
- **Not supported:** PrimeNG v17 and below (different theming model based on `prime.css`), Angular v17 or below (NgModule patterns).

If the project's PrimeNG version is below v18, point the user to PrimeNG's v17 docs and decline to generate v18+ patterns into a v17 project, they will not compile.


1. Always check the project's PrimeNG version before providing guidance. PrimeNG v18 introduced major component **renames** (Calendar→DatePicker, Dropdown→Select, InputSwitch→ToggleSwitch, OverlayPanel→Popover, Sidebar→Drawer) and a new design-token theming system. `package.json` is the source of truth, when in doubt, look there before recommending an API. See [migration.md](references/migration.md).

2. Detect which **theming mode** the project uses before adding components:
   - If `@primeuix/themes` is imported and `providePrimeNG({ theme: ... })` is configured → **Styled mode** (default).
   - If `unstyled: true` is set in `providePrimeNG`, or the project uses `tailwindcss-primeui` → **Unstyled mode**.
   - The two modes have fundamentally different customization paths. See [styled-vs-unstyled.md](references/styled-vs-unstyled.md).

3. Components are **standalone since v18**. Always import the standalone class (e.g. `Button` from `'primeng/button'`), not the legacy `*Module`. Legacy modules still export for backwards compatibility but should not be added to new code.

4. After generating PrimeNG code, run `ng build` to catch compile errors. The most common AI mistakes are: (a) importing from `@primeng/themes` instead of `@primeuix/themes` (deprecated path); (b) forgetting `provideAnimationsAsync()` on v18 to v20 projects (PrimeNG v21+ uses native CSS animations and no longer requires it); (c) using v17 component names (`Calendar`, `Dropdown`, `OverlayPanel`, `Sidebar`, `InputSwitch`) after the v18 renames. See [setup.md](references/setup.md) and [migration.md](references/migration.md).

## PrimeNG architecture: Styled, Unstyled, PassThrough

PrimeNG ships compiled in `node_modules`, there is no source-copy CLI. Customization happens through three escalating mechanisms:

- **Design tokens** (Styled mode), override theme variables at the preset level via `definePreset(Aura, {...})`. Best for most theming needs. See [theming.md](references/theming.md).
- **PassThrough (`pt`)**, per-component prop that injects classes/attributes into any internal DOM section. Works in both Styled and Unstyled modes. Use when tokens aren't enough. See [passthrough.md](references/passthrough.md).
- **Unstyled mode**, strip PrimeNG's styles entirely and provide your own (typically Tailwind via `tailwindcss-primeui`). Use for teams that already own a design system. See [styled-vs-unstyled.md](references/styled-vs-unstyled.md).

**Default to Styled mode with Aura preset.** Reach for PassThrough when you need to override specific internal sections. Reach for Unstyled only when the project is committed to a Tailwind-driven design system.

## Installation and theming

- **Setup**: Install `primeng @primeuix/themes @primeuix/styles`, wire `providePrimeNG()` (and `provideAnimationsAsync()` on v18 to v20), common pitfalls. Read [setup.md](references/setup.md)
- **Theming**: Aura / Lara / Nora / Material presets, design tokens, dark mode, `definePreset` overrides, runtime preset switching, CSS layer ordering. Read [theming.md](references/theming.md)
- **Styled vs Unstyled**: When to use each mode, Tailwind v4 + `tailwindcss-primeui` integration, Volt UI reference patterns. Read [styled-vs-unstyled.md](references/styled-vs-unstyled.md)
- **PassThrough**: The `pt` API, global `pt` in `providePrimeNG`, nested-component prefix (`pcBadge`), `ptOptions.mergeSections` and `mergeProps`. Read [passthrough.md](references/passthrough.md)

## Components

PrimeNG provides 80+ components grouped here by category. Each category file covers component APIs, common patterns, and gotchas.

- **Form controls**: AutoComplete, CascadeSelect, Checkbox, ColorPicker, DatePicker, Editor, FloatLabel, IconField, IftaLabel, InputMask, InputNumber, InputOtp, InputText, Knob, Listbox, MultiSelect, Password, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, TreeSelect. Read [form-controls.md](references/form-controls.md)
- **Buttons**: Button, SpeedDial, SplitButton. Read [buttons.md](references/buttons.md)
- **Overlays**: ConfirmDialog, ConfirmPopup, Dialog, Drawer, DynamicDialog, Popover, Toast, Tooltip. Read [overlays.md](references/overlays.md)
- **Layout**: Accordion, BlockUI, Card, Divider, Fieldset, Panel, Scroller (VirtualScroller), ScrollTop, Splitter, Stepper, Tabs, Toolbar. Read [layout.md](references/layout.md)
- **Data display**: Carousel, DataView, Galleria, OrderList, Paginator, PickList, Table, Timeline, Tree, TreeTable. Read [data-display.md](references/data-display.md)
- **Display**: Avatar, Badge, Chip, Image, Inplace, Message, MeterGroup, OverlayBadge, ProgressBar, ProgressSpinner, Ripple, Skeleton, Tag, Terminal. Read [display.md](references/display.md)
- **Menus**: Breadcrumb, ContextMenu, Dock, MegaMenu, Menu, MenuBar, PanelMenu, TieredMenu. Read [menus.md](references/menus.md)

## Forms integration

- **Forms**: Wiring PrimeNG form components to ReactiveForms or Signal Forms, the `[invalid]` prop (v20+) replacing `.ng-invalid.ng-dirty`, `ControlValueAccessor` patterns, validation display. Read [forms.md](references/forms.md)

## Accessibility

- **Accessibility**: WCAG 2.1 AA compliance built in, `p-sr-only` utility, ARIA conventions per component, keyboard navigation, focus management. Read [accessibility.md](references/accessibility.md)

## Migration

- **Migration**: v18 component renames (Calendar→DatePicker etc.), deprecated APIs, the `[invalid]` prop replacing `.ng-invalid.ng-dirty`, design-token system replacing the legacy SCSS theme. Read [migration.md](references/migration.md)
