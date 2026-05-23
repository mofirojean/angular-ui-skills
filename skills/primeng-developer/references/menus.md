# Menus

> Status: outline. Fill in.

PrimeNG ships 8 menu variants. Pick by shape and context.

## Menu

- Vertical menu, optional overlay mode
- `[model]` shape: `MenuItem[]`
- Triggered as overlay via `(click)="menu.toggle($event)"`

## MenuBar

- Horizontal nav bar with submenus
- Top-level app nav pattern

## ContextMenu

- Right-click anchored menu
- `[target]` to attach to a host element
- Use for row-level actions in tables

## Breadcrumb

- Trail of navigation crumbs
- `[home]` + `[model]`
- Integrates with `RouterLink`

## TieredMenu

- Multi-level cascading menu
- Use when MenuBar's depth isn't enough

## MegaMenu

- Multi-column menu for marketing-style headers
- `[model]` shape supports columns + sub-items
- Orientation: horizontal / vertical

## PanelMenu

- Accordion-style vertical menu (multi-expandable)
- Common in admin sidebars

## Dock

- macOS-style icon dock
- Position: `top`, `bottom`, `left`, `right`
- Magnification on hover

## The `MenuItem` interface

- Common keys: `label`, `icon`, `routerLink`, `command`, `items`, `disabled`, `separator`, `styleClass`
- Document the canonical shape once, then reference from every menu

## Picking the right menu

- App-shell horizontal nav → **MenuBar**
- App-shell vertical nav → **PanelMenu**
- Right-click row actions → **ContextMenu**
- Marketing site header → **MegaMenu**
- Crumbs → **Breadcrumb**
- Click-to-open action menu → **Menu** (overlay mode)
