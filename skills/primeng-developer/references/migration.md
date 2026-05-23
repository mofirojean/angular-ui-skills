# Migration notes

> Status: outline. Fill in.

The biggest source of AI errors with PrimeNG is using v17 names after v18+ renames. Document each.

## v18 component renames

| v17 (old) | v18+ (new) | Import path |
|---|---|---|
| Calendar | DatePicker | `primeng/datepicker` |
| Dropdown | Select | `primeng/select` |
| InputSwitch | ToggleSwitch | `primeng/toggleswitch` |
| OverlayPanel | Popover | `primeng/popover` |
| Sidebar | Drawer | `primeng/drawer` |
| TabView / TabPanel | Tabs / Tab | `primeng/tabs` |
| Steps | (deprecated → use Stepper) | `primeng/stepper` |

> Verify this list against the official migration guide; expand with any others.

## Theme system rewrite (v17 → v18)

- v17: SCSS-compiled themes (`primeng/resources/themes/...`)
- v18+: design-token system in `@primeuix/themes`
- Migration: remove the old SCSS import, add `providePrimeNG({ theme: { preset: Aura } })`

## `[invalid]` input (v20)

- Old: rely on Angular's `.ng-invalid.ng-dirty` for error styles
- New: bind `[invalid]="ctrl.invalid && ctrl.touched"` explicitly
- Old behavior still works but is deprecated

## Standalone-only mindset (v18+)

- All components are standalone classes
- Legacy `*Module` still exported but considered legacy
- New code: import the class, add to `imports: [Button, ...]` in the consuming component

## Removed APIs

- List any APIs removed across v18–v21
- For each: what replaced it + a one-line migration recipe

## Pre-flight checklist when adopting

- Drop SCSS theme imports
- Add `@primeuix/themes` and `providePrimeNG`
- Rename v17 components to v18+ names
- Replace `.ng-invalid` reliance with `[invalid]`
- Audit `*Module` imports → switch to standalone classes
