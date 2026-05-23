# Overlays

> Status: outline. Fill in.

## Dialog

- Modal dialog with header / content / footer slots
- `[(visible)]`, `[modal]`, `[closable]`, `[draggable]`, `[resizable]`
- `[breakpoints]` for responsive width
- When to prefer DynamicDialog (programmatic open with data)

## DynamicDialog

- Open dialogs imperatively via `DialogService`
- Pass data + receive close-result
- When to prefer over template-bound Dialog

## Drawer (was Sidebar in v17)

- Side-mounted overlay; positions: `left`, `right`, `top`, `bottom`, `full`
- `[(visible)]` pattern
- When to use Drawer vs Dialog

## Popover (was OverlayPanel in v17)

- Click-anchored floating panel
- `toggle($event)` on a host button to open
- vs Tooltip (hover) vs Dialog (modal)

## Tooltip

- `[pTooltip]` directive (not a component)
- `tooltipPosition`, `showDelay`, `hideDelay`
- Accessibility: tooltips augment, don't replace, labels

## ConfirmDialog

- `ConfirmationService` + `<p-confirmdialog>` placement
- Per-call options: header, message, accept/reject labels, severity
- When to use ConfirmPopup instead (anchored, not modal)

## ConfirmPopup

- Anchored confirm bubble for low-stakes confirmations
- API mirrors ConfirmDialog through `ConfirmationService`

## Toast

- `MessageService.add({...})` + `<p-toast>` placement
- Severities, sticky vs auto-dismiss, position
- Multiple `<p-toast>` placements with `key` filter

## Common patterns

- Modal stacking (Dialog → ConfirmDialog) — works out of the box; document the z-index baseline
- Closing on route change — use `Router.events` + service refs
