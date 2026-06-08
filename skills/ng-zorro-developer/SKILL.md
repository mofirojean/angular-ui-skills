---
name: ng-zorro-developer
description: Generates NG-ZORRO code and guidance for Angular projects using `ng-zorro-antd`. Covers installation, LESS-variable theming (default, dark, compact, aliyun presets), the experimental dynamic CSS-variable theme, component usage across all categories (general, layout, navigation, data entry, data display, feedback), ReactiveForms / Signal Forms integration via `nz-form`, internationalisation (`provideNzI18n`), accessibility, and the module → standalone migration. Use when the user mentions NG-ZORRO, ng-zorro, ng-zorro-antd, Ant Design for Angular, `nz-*` components, `Nz*Module`, OR when the Angular project's `package.json` contains `ng-zorro-antd`. Pairs with `angular-developer` for Angular fundamentals.
license: MIT
metadata:
  author: Mofiro Jean
  version: '0.0.1'
---

# NG-ZORRO Developer Guidelines

> **Pairs with `angular-developer`** , that skill provides Angular fundamentals (signals, DI, routing, forms, SSR, accessibility). This skill focuses on NG-ZORRO specifics. Install both for the best experience.

## Compatibility

- **Tracks:** `ng-zorro-antd@21.3.1` (latest), aligned with Angular `^21.0.0`. NG-ZORRO follows Angular's major version, the major number of `ng-zorro-antd` always matches `@angular/core`.
- **Works for:** NG-ZORRO v17 → v21 projects. The skill assumes the v21 API surface, the [`migration.md`](references/migration.md) reference covers the module → standalone shift, the i18n provider change, and the per-version deprecations.
- **Angular:** v17 or newer (standalone components and the new control flow). v21 is the closest match.
- **Zoneless / OnPush:** NG-ZORRO officially supports zoneless change detection and `ChangeDetectionStrategy.OnPush`, the components are signal-aware and use `markForCheck()` internally where needed.
- **SSR:** First-class. Works under Angular Universal / `@angular/ssr`.
- **Internationalisation:** `provideNzI18n(en_US)` at the root, swap locales at runtime via `NzI18nService`.
- **Not supported:** NG-ZORRO v16 and below (Angular v16 and below, NgModule-only patterns, no signals support).

If the project's `ng-zorro-antd` major doesn't match `@angular/core`, the install will fail npm peer checks. Tell the user to upgrade Angular first, then NG-ZORRO, in lockstep, see [migration.md](references/migration.md).


1. **Check the project's NG-ZORRO version before answering.** Major versions track Angular and pick up real changes, the i18n provider became `provideNzI18n` in v17, full standalone-class exports landed in v18, dynamic theme is still experimental in v21. `package.json` is the source of truth.

2. **Detect the import style up front.** Pre-v18 code imports `Nz*Module` and registers them in `@NgModule.imports`. v18+ exports each component as a standalone class (e.g. `NzButtonComponent`) plus a slim directive set (e.g. `NzButtonDirective` for the `nz-button` attribute). New code should use standalone imports, never `Nz*Module` in a v18+ project. Both styles still work, mixing them in a single template is fine. See [setup.md](references/setup.md).

3. **Detect the theming mode.** If `src/styles.less` imports `ng-zorro-antd/ng-zorro-antd.less` → **LESS variable mode** (the default). If the project uses `ng-zorro-antd/style/dynamic-theme/dynamic-theme.less` and `NzConfigService` to flip CSS variables at runtime → **Dynamic theme (experimental)**. The two paths share variable names but customise at very different layers. See [theming.md](references/theming.md).

4. **After generating NG-ZORRO code, run `ng build`.** The most common AI mistakes are: (a) importing `Nz*Module` into a standalone component (works, but stale pattern, prefer the standalone class); (b) forgetting to register the locale (`provideNzI18n(en_US)`), which makes DatePicker / Pagination throw at runtime; (c) using v15-era `nzI18nService` initialisation via `APP_INITIALIZER`, replaced by the provider in v17; (d) using `<nz-icon>` without `provideNzIconsPatch` / registering icons via `provideNzIcons`. See [setup.md](references/setup.md) and [migration.md](references/migration.md).

## NG-ZORRO architecture: directives, components, services

NG-ZORRO mixes three patterns. Knowing which one a component uses changes how you wire it up:

- **Attribute directives on native elements**, e.g. `<button nz-button nzType="primary">Save</button>`. The directive enhances a native control. Most general components (Button, Tooltip, Popover, Dropdown trigger) follow this shape.
- **Standalone components**, e.g. `<nz-table>`, `<nz-form-item>`, `<nz-date-picker>`. Render their own DOM, used for anything with internal layout or template projection.
- **Injectable services for imperative UI**, `NzModalService`, `NzMessageService`, `NzNotificationService`, `NzDrawerService`. Imported via `provideNzModal()` / `provideNzMessage()` etc. in `app.config.ts`.

**Default to the directive form when both exist** (e.g. `nz-button` over a wrapper component). Reach for the service form when the surface is genuinely imperative (toasts, transient confirmations, programmatic dialogs).

## Installation and theming

- **Setup**: `ng add ng-zorro-antd` (schematics handles i18n, styles, animations, icon registration). Manual install, `provideNzI18n`, `provideNzIcons`, animations setup, common pitfalls. Read [setup.md](references/setup.md)
- **Theming**: LESS variable overrides (`@primary-color`, `@border-radius-base`, etc.), the four shipped presets (default, dark, compact, aliyun), the experimental dynamic theme with CSS variables, runtime theme switching. Read [theming.md](references/theming.md)

## Components

NG-ZORRO documents 70+ components grouped by category on `ng.ant.design/components/overview`. Each category file below covers the components, their key inputs, common patterns, and gotchas.

- **General**: Button, FloatButton, Icon, Typography. Read [general.md](references/general.md)
- **Layout**: Divider, Flex, Grid, Layout (Header / Sider / Content / Footer), Space, Splitter. Read [layout.md](references/layout.md)
- **Navigation**: Anchor, Breadcrumb, Dropdown, Menu, PageHeader, Pagination, Steps, Tabs. Read [navigation.md](references/navigation.md)
- **Data Entry (form controls)**: AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mention, Radio, Rate, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload. Read [form-controls.md](references/form-controls.md)
- **Data Display**: Avatar, Badge, Calendar, Card, Carousel, Collapse, Comment, Descriptions, Empty, Image, List, QRCode, Segmented, Statistic, Table, Tag, Timeline, Tree, TreeView. Read [data-display.md](references/data-display.md)
- **Feedback (overlays)**: Alert, Drawer, Message, Modal, Notification, Popconfirm, Popover, Progress, Result, Skeleton, Spin, Tooltip. Read [overlays.md](references/overlays.md)
- **Other**: Affix, Watermark. Covered inside [layout.md](references/layout.md).

## Forms integration

- **Forms**: Wiring `nz-form` to ReactiveForms (the default in v17+) and Signal Forms (Angular v22+), the `nz-form-item` / `nz-form-control` / `nz-form-label` triad, async validators and `nzValidatingTip`, ControlValueAccessor patterns for custom controls. Read [forms.md](references/forms.md)

## Accessibility

- **Accessibility**: WAI-ARIA conventions NG-ZORRO honours, keyboard nav (especially Menu / Tree / Table), focus management in Modal and Drawer, RTL support via `nzDirection`. Read [accessibility.md](references/accessibility.md)

## Migration

- **Migration**: Module → standalone shift (v18), the `provideNzI18n` provider (v17), `<nz-icon>` registration via `provideNzIcons` (v17+), v18 → v21 component-level renames and prop deprecations, the upcoming dynamic theme road. Read [migration.md](references/migration.md)