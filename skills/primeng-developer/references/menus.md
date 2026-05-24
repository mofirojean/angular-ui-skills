# Menus

PrimeNG ships 8 menu variants. They all share the `MenuItem` model shape, pick by *layout* and *trigger*.

## The `MenuItem` shape

Almost every menu binds to `model: MenuItem[]` from `primeng/api`:

```typescript
import { MenuItem } from 'primeng/api';

items: MenuItem[] = [
  {
    label: 'New',
    icon: 'pi pi-plus',
    command: () => this.create(),       // imperative handler
  },
  {
    label: 'Open recent',
    icon: 'pi pi-history',
    items: [                            // nested submenu
      { label: 'report.pdf', icon: 'pi pi-file', command: () => this.open('report.pdf') },
    ],
  },
  { separator: true },                  // divider
  {
    label: 'Help',
    icon: 'pi pi-question-circle',
    routerLink: '/help',                 // Angular Router target
  },
  {
    label: 'External',
    icon: 'pi pi-external-link',
    url: 'https://example.com',
    target: '_blank',
  },
];
```

### Common keys

| Key | Notes |
|---|---|
| `label` | Display text. |
| `icon` | Icon class (e.g. `'pi pi-plus'`). |
| `command(event)` | Click handler. Receives `{ originalEvent, item }`. |
| `routerLink` | Angular Router target. Prefer this over `command` for navigation. |
| `url`, `target` | Plain anchor href + window target. For external links. |
| `items` | Nested submenu. Recursive structure. |
| `separator` | `true` renders a divider; ignored other keys. |
| `disabled` | Disables the item. |
| `visible` | `false` hides without removing. |
| `styleClass` | Class applied to the item link. |
| `tooltip`, `tooltipOptions` | Native tooltip for the item. |
| `badge`, `badgeStyleClass` | Counter badge on the item. |
| `escape` | `false` allows HTML in `label`. Treat as `false` only when you fully control the label string. |

`MegaMenu` uses `MegaMenuItem[]` (same shape with an extra `items: MenuItem[][]` for column groups).

## Menu

Vertical list. Can be static (always visible) or popup (toggle).

```typescript
import { Menu } from 'primeng/menu';
```

```html
<!-- popup mode -->
<p-button label="Actions" (onClick)="menu.toggle($event)" />
<p-menu #menu [model]="actions" [popup]="true" appendTo="body" />

<!-- static -->
<p-menu [model]="sectionLinks" />
```

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | Items. |
| `[popup]` | boolean | Show as overlay vs inline list. |
| `appendTo` | `'self' \| 'body' \| ElementRef` | Where overlays attach. Use `'body'` if the trigger sits inside `overflow: hidden`. |

Methods (popup mode): `toggle(event)`, `show(event)`, `hide()`.
Events: `(onShow)`, `(onHide)`, `(onFocus)`, `(onBlur)`.

## MenuBar

Horizontal nav bar with cascading submenus. The canonical app-shell header menu.

```typescript
import { Menubar } from 'primeng/menubar';
```

```html
<p-menubar [model]="appMenu">
  <ng-template pTemplate="start">
    <img src="/logo.svg" height="24" alt="Logo" />
  </ng-template>
  <ng-template pTemplate="end">
    <p-button label="Sign in" variant="text" />
  </ng-template>
</p-menubar>
```

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | Top-level items with optional nested `items`. |
| `[autoDisplay]` | boolean | Default `true`. Open submenus on hover. |
| `[autoHide]` | boolean | Default `false`. Close root submenu when mouse leaves. |
| `breakpoint` | string | Default `'960px'`. Below this, collapses to a hamburger. |

Templates: `start`, `end`, `item`, `menuicon`, `submenuicon`.

## ContextMenu

Right-click anchored menu.

```typescript
import { ContextMenu } from 'primeng/contextmenu';
```

```html
<p-contextmenu [target]="tableEl" [model]="rowActions" />
<table #tableEl pTable [value]="rows">...</table>
```

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | Items. |
| `target` | `string \| HTMLElement` | Host element to attach to (or template ref name). |
| `[global]` | boolean | Attach to the entire document. |
| `triggerEvent` | string | Default `'contextmenu'`. Override to `'click'` for click-anchored use. |
| `pressDelay` | number | Touch long-press delay (ms). |

Tables and Trees have special integration, set `[(contextMenu)]` on the table for row-aware menus.

## Breadcrumb

Path trail. Integrates with Router.

```typescript
import { Breadcrumb } from 'primeng/breadcrumb';
```

```html
<p-breadcrumb [home]="{ icon: 'pi pi-home', routerLink: '/' }" [model]="crumbs" />
```

```typescript
crumbs: MenuItem[] = [
  { label: 'Agents', routerLink: '/agents' },
  { label: 'Lead Qualifier', routerLink: '/agents/lead-qualifier' },
];
```

| Input | Type | Notes |
|---|---|---|
| `home` | `MenuItem` | Special leading "home" item. |
| `model` | `MenuItem[]` | The trail. |

Event: `(onItemClick)` , `{ originalEvent, item }`.

## TieredMenu

Multi-level cascading menu (think classic File / Edit / View hierarchy with submenus that fan out).

```typescript
import { TieredMenu } from 'primeng/tieredmenu';
```

```html
<p-button label="Menu" (onClick)="tiered.toggle($event)" />
<p-tieredMenu #tiered [model]="deeplyNested" [popup]="true" appendTo="body" />
```

Use TieredMenu when MenuBar's depth feels cramped or when a Menu's flat list isn't enough.

## MegaMenu

Multi-column menu for marketing-style headers.

```typescript
import { MegaMenu } from 'primeng/megamenu';
import { MegaMenuItem } from 'primeng/api';
```

```html
<p-megamenu [model]="categories" orientation="horizontal" />
```

```typescript
categories: MegaMenuItem[] = [
  {
    label: 'Products',
    items: [
      [
        { label: 'Analytics', items: [{ label: 'Dashboards' }, { label: 'Reports' }] },
        { label: 'Automation', items: [{ label: 'Workflows' }, { label: 'Triggers' }] },
      ],
      [
        { label: 'Integrations', items: [{ label: 'Slack' }, { label: 'GitHub' }] },
      ],
    ],
  },
];
```

`items` is `MenuItem[][]`, an array of columns, each column being an array of grouped items.

| Input | Type | Notes |
|---|---|---|
| `model` | `MegaMenuItem[]` | |
| `orientation` | `'horizontal' \| 'vertical'` | Default `'horizontal'`. |
| `scrollHeight` | string | Max viewport before scrollbar (default `'20rem'`). |
| `breakpoint` | string | Default `'960px'`. Collapses to button below. |

## PanelMenu

Vertical, accordion-style menu. Multi-level. Common in admin sidebars.

```typescript
import { PanelMenu } from 'primeng/panelmenu';
```

```html
<p-panelmenu [model]="sidebar" [multiple]="false" />
```

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | Items (typically with nested `items`). |
| `[multiple]` | boolean | Allow more than one top-level panel open simultaneously. |

Method: `collapseAll()` , closes every panel.

## Dock

macOS-style icon dock.

```typescript
import { Dock } from 'primeng/dock';
```

```html
<p-dock [model]="apps" position="bottom" />
```

```typescript
apps: MenuItem[] = [
  { label: 'Finder', icon: 'pi pi-search', command: () => this.open('finder') },
  { label: 'Mail',   icon: 'pi pi-envelope', command: () => this.open('mail') },
];
```

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Default `'bottom'`. |
| `breakpoint` | string | Default `'960px'`. |

Reach for Dock when icon-driven launching is the point of the page (creative tools, kiosks). It's not a substitute for a structured nav.

## Picker , which menu for which job?

| Use case | Component |
|---|---|
| App-shell horizontal nav | **MenuBar** |
| App-shell vertical nav (sidebar) | **PanelMenu** |
| Right-click row actions in a table | **ContextMenu** |
| Click-anchored action list (toolbar button → menu) | **Menu** with `[popup]="true"` |
| Multi-level cascading menu | **TieredMenu** |
| Marketing-site header with columns | **MegaMenu** |
| Path trail | **Breadcrumb** |
| Icon launcher (macOS dock style) | **Dock** |

## Routing integration

Use `routerLink` on items rather than `command` whenever the action is navigation. You get:

- Browser back button support.
- Keyboard accessibility (focus moves correctly).
- Right-click "Open in new tab" works.
- Active-link state can be styled via `[routerLinkActive]`.

For non-routing actions (open dialog, fire mutation), use `command`.

## Common pitfalls

1. **Forgetting to register `MenuItem` items as a stable reference** , recreating the array in a getter triggers excessive change detection. Keep `model` as a class field or computed signal.
2. **`escape: false` with unsanitized labels** , XSS risk. Only when you fully control the text.
3. **MenuBar without `breakpoint`** , the responsive hamburger kicks in at `960px` by default. Override to `'768px'` for app shells that should stay horizontal longer.
4. **PanelMenu and Accordion confusion** , PanelMenu is for navigation (items with `routerLink`/`command`). Accordion is for content panels. Use the right one.
5. **ContextMenu without `[target]`** , attaches to the whole document, fires on every right-click anywhere on the page.
6. **MegaMenu shape mismatch** , `items` is `MenuItem[][]` (array of columns), not `MenuItem[]`. The compiler accepts both; only the `[][]` form renders columns.
